"""Download official IBGE tables and prepare a small neighborhood-only dataset."""
from __future__ import annotations

import csv
import io
import json
import sqlite3
import urllib.request
import zipfile
from pathlib import Path

from shapely import wkb
from shapely.geometry import mapping
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "src" / "data"
BASE = "https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios"
SOURCES = {
    "basic": f"{BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip",
    "boundaries": f"{BASE}/malha_com_atributos/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg",
    "epe": "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-160/topico-168/anuario-workbook.xlsx",
}
TARGETS = {
    "2927408018": "Beiru / Tancredo Neves",
    "2927408117": "Pernambués",
}


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists():
        print(f"Downloading {url}")
        urllib.request.urlretrieve(url, destination)


def parse_br_number(value: str) -> float:
    return float(value.replace(".", "").replace(",", "."))


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    basic_path = RAW / "ibge_bairros_basico_20260520.zip"
    boundary_path = RAW / "BA_bairros_CD2022.gpkg"
    download(SOURCES["basic"], basic_path)
    download(SOURCES["boundaries"], boundary_path)

    with zipfile.ZipFile(basic_path) as archive:
        csv_name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
        text = io.TextIOWrapper(archive.open(csv_name), encoding="latin-1", newline="")
        rows = csv.DictReader(text, delimiter=";")
        selected = {row["CD_BAIRRO"]: row for row in rows if row.get("CD_BAIRRO") in TARGETS}

    missing = set(TARGETS) - set(selected)
    if missing:
        raise ValueError(f"Official IBGE table is missing target codes: {sorted(missing)}")

    indicators = [
        ("population", "População residente", "pessoas", "v0001", "Pessoas residentes no bairro"),
        ("dwellings_total", "Domicílios totais", "domicílios", "v0002", "Total de domicílios, conforme definição do IBGE"),
        ("dwellings_occupied", "Domicílios particulares ocupados", "domicílios", "v0007", "Domicílios particulares ocupados (permanentes + improvisados)"),
        ("dwellings_occasional", "Domicílios de uso ocasional", "domicílios", "v0008", "Domicílios particulares permanentes de uso ocasional"),
        ("dwellings_vacant", "Domicílios vagos", "domicílios", "v0009", "Domicílios particulares permanentes vagos"),
        ("residents_per_occupied_dwelling", "Moradores por domicílio ocupado", "pessoas por domicílio", "v0005", "Média do IBGE: pessoas em DPO / DPO"),
    ]
    observations = []
    territories = []
    for code, official_name in TARGETS.items():
        row = selected[code]
        if row["NM_BAIRRO"] != official_name:
            raise ValueError(f"Unexpected name for IBGE code {code}: {row['NM_BAIRRO']}")
        territories.append({"code": code, "name": official_name, "parent": "Salvador", "geography_level": "bairro", "area_km2": parse_br_number(row["AREA_KM2"])})
        for key, label, unit, column, definition in indicators:
            observations.append({
                "territory_code": code, "indicator_code": key, "indicator_name": label,
                "unit": unit, "year": 2022, "value": parse_br_number(row[column]),
                "source": "IBGE - Censo Demográfico 2022, agregados por bairro",
                "source_url": SOURCES["basic"], "classification": "observado",
                "definition": definition, "geography": "bairro", "limitations": "Retrato censitário de 2022; não mede diretamente pobreza energética familiar.",
            })
    for t in territories:
        pop = next(o["value"] for o in observations if o["territory_code"] == t["code"] and o["indicator_code"] == "population")
        observations.append({
            "territory_code": t["code"], "indicator_code": "population_density", "indicator_name": "Densidade populacional",
            "unit": "pessoas/km²", "year": 2022, "value": round(pop / t["area_km2"], 1),
            "source": "IBGE - Censo Demográfico 2022, agregados por bairro",
            "source_url": SOURCES["basic"], "classification": "derivado",
            "definition": "População residente (v0001) / área territorial (km²).",
            "geography": "bairro", "limitations": "Densidade média do bairro; não descreve distribuição intrabairro.",
        })

    # The EPE table is state-level. Preserve that geography in its own territory.
    epe_path = RAW / "epe_anuario_workbook.xlsx"
    download(SOURCES["epe"], epe_path)
    workbook = load_workbook(epe_path, read_only=True, data_only=True)
    rows = list(workbook["Tabela 4.17"].iter_rows(values_only=True))
    years = [int(value) for value in rows[8][2:17]]
    epe_series = {
        "electricity_residential_consumption": ("Consumo residencial de eletricidade - Bahia", "GWh", rows[10]),
        "electricity_residential_consumers": ("Consumidores residenciais de eletricidade - Bahia", "unidades consumidoras", rows[19]),
    }
    territories.append({"code": "BA", "name": "Bahia", "parent": "Brasil", "geography_level": "estado"})
    for code, (label, unit, row) in epe_series.items():
        for year, value in zip(years, row[2:17]):
            observations.append({
                "territory_code": "BA", "indicator_code": code, "indicator_name": label,
                "unit": unit, "year": year, "value": float(value),
                "source": "EPE - Anuário Estatístico de Energia Elétrica 2026, tabela 4.17",
                "source_url": SOURCES["epe"], "classification": "observado",
                "definition": f"Valor publicado pela EPE para a Bahia no ano de {year}.",
                "geography": "estado", "limitations": "Dado estadual; não representa nem pode ser atribuído aos bairros.",
            })

    (OUT / "seed.json").write_text(json.dumps({"territories": territories, "observations": observations}, ensure_ascii=False, indent=2) + "\n")

    connection = sqlite3.connect(boundary_path)
    connection.row_factory = sqlite3.Row
    features = []
    for row in connection.execute("SELECT CD_BAIRRO, NM_BAIRRO, geom FROM BA_bairros_CD2022 WHERE CD_BAIRRO IN (?, ?)", tuple(TARGETS)):
        blob = row["geom"]
        envelope_sizes = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}
        envelope_code = (blob[3] >> 1) & 0b111
        geometry = wkb.loads(blob[8 + envelope_sizes[envelope_code]:])
        features.append({"type": "Feature", "geometry": mapping(geometry), "properties": {"code": row["CD_BAIRRO"], "name": row["NM_BAIRRO"]}})
    if {f["properties"]["code"] for f in features} != set(TARGETS):
        raise ValueError("IBGE neighborhood boundary file did not include both target codes")
    (OUT / "bairros.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Prepared {len(observations)} observations across {len(territories)} geographic units")


if __name__ == "__main__":
    main()
