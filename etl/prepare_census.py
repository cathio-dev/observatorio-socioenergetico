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
    "dwellings1": f"{BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio1_BR_20261021.zip",
    "dwellings2": f"{BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip",
    "dwellings3": f"{BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio3_BR_20250417.zip",
    "income": f"{BASE}_Rendimento_do_Responsavel/Agregados_por_bairros_renda_responsavel_BR_20260508_csv.zip",
    "urban": "https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Bairro_csv/Agregados_por_bairros_entorno_domic%c3%adlios_BR.zip",
    "epe": "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-160/topico-168/anuario-workbook.xlsx",
    "ipea": "https://www.ipea.gov.br/redeipea/images/excel/dados-ivs-municipal.zip",
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


def read_bairro_table(path: Path) -> dict[str, dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        csv_name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
        text = io.TextIOWrapper(archive.open(csv_name), encoding="latin-1", newline="")
        return {row["CD_BAIRRO"]: row for row in csv.DictReader(text, delimiter=";") if row.get("CD_BAIRRO") in TARGETS}


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    basic_path = RAW / "ibge_bairros_basico_20260520.zip"
    boundary_path = RAW / "BA_bairros_CD2022.gpkg"
    table_paths = {
        "dwellings1": RAW / "ibge_bairros_caracteristicas_domicilio1_20261021.zip",
        "dwellings2": RAW / "ibge_bairros_caracteristicas_domicilio2_20250417.zip",
        "dwellings3": RAW / "ibge_bairros_caracteristicas_domicilio3_20250417.zip",
        "income": RAW / "ibge_bairros_rendimento_responsavel_20260508.zip",
        "urban": RAW / "ibge_bairros_entorno_domicilios_2025.zip",
    }
    download(SOURCES["basic"], basic_path)
    download(SOURCES["boundaries"], boundary_path)
    for name, path in table_paths.items():
        download(SOURCES[name], path)

    tables = {"basic": read_bairro_table(basic_path)}
    tables.update({name: read_bairro_table(path) for name, path in table_paths.items()})
    for name, rows in tables.items():
        missing_codes = set(TARGETS) - set(rows)
        if missing_codes:
            raise ValueError(f"{name} table is missing target codes: {sorted(missing_codes)}")
    selected = tables["basic"]

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
                "source_code": "ibge_censo_bairro_basico_2022",
                "source": "IBGE - Censo Demográfico 2022, agregados por bairro",
                "source_url": SOURCES["basic"], "classification": "observado",
                "definition": definition, "geography": "bairro", "limitations": "Retrato censitário de 2022; não mede diretamente pobreza energética familiar.",
            })
    for t in territories:
        pop = next(o["value"] for o in observations if o["territory_code"] == t["code"] and o["indicator_code"] == "population")
        observations.append({
            "territory_code": t["code"], "indicator_code": "population_density", "indicator_name": "Densidade populacional",
            "unit": "pessoas/km²", "year": 2022, "value": round(pop / t["area_km2"], 1),
            "source_code": "ibge_censo_bairro_basico_2022",
            "source": "IBGE - Censo Demográfico 2022, agregados por bairro",
            "source_url": SOURCES["basic"], "classification": "derivado",
            "definition": "População residente (v0001) / área territorial (km²).",
            "geography": "bairro", "limitations": "Densidade média do bairro; não descreve distribuição intrabairro.",
        })

    housing_metrics = [
        ("water_network_share", "Domicílios com abastecimento pela rede geral", "%", "dwellings2", "V00111", "domicilios_particulares_permanentes_ocupados", "V00001", "Domicílios particulares permanentes ocupados que utilizam rede geral de distribuição de água; proporção calculada sobre DPO."),
        ("sewer_network_share", "Domicílios com esgoto na rede geral ou pluvial", "%", "dwellings2", "V00309", "domicilios_particulares_permanentes_ocupados", "V00001", "Domicílios particulares permanentes ocupados cujo esgoto vai para rede geral ou pluvial; proporção calculada sobre DPO."),
        ("waste_collection_share", "Domicílios com coleta por serviço de limpeza", "%", "dwellings2", "V00397+V00398", "domicilios_particulares_permanentes_ocupados", "V00001", "Domicílios particulares permanentes ocupados com lixo coletado por serviço de limpeza, no domicílio ou em caçamba; proporção calculada sobre DPO."),
        ("without_bathroom_share", "Domicílios sem banheiro nem sanitário", "%", "dwellings2", "V00238", "domicilios_particulares_permanentes_ocupados", "V00001", "Domicílios particulares permanentes ocupados sem banheiro nem sanitário; proporção calculada sobre DPO."),
    ]
    for code, label, unit, table_name, numerator_col, _, denominator_col, definition in housing_metrics:
        for territory_code in TARGETS:
            numerator = sum(parse_br_number(tables[table_name][territory_code][column]) for column in numerator_col.split('+'))
            denominator = parse_br_number(tables["dwellings1"][territory_code][denominator_col])
            observations.append({
                "territory_code": territory_code, "indicator_code": code, "indicator_name": label,
                "unit": unit, "year": 2022, "value": round(numerator / denominator * 100, 2) if denominator else 0,
                "source_code": "ibge_censo_caracteristicas_domicilios_2022",
                "source": "IBGE - Censo Demográfico 2022, características dos domicílios",
                "source_url": SOURCES[table_name], "classification": "derivado",
                "definition": f"{definition} Fórmula: {numerator_col} / {denominator_col} × 100.",
                "geography": "bairro", "limitations": "Percentual agregado de DPO; não mede qualidade, continuidade ou experiência individual do serviço.",
            })

    income_metrics = [
        ("income_average", "Rendimento nominal médio mensal do responsável", "R$/mês (nominal 2022)", "V06004", "Valor médio mensal das pessoas responsáveis com rendimento em domicílios particulares permanentes ocupados."),
        ("income_median", "Rendimento nominal mediano mensal do responsável", "R$/mês (nominal 2022)", "V06006", "Mediana do rendimento nominal mensal das pessoas responsáveis com rendimento em domicílios particulares permanentes ocupados."),
    ]
    for code, label, unit, column, definition in income_metrics:
        for territory_code in TARGETS:
            row = tables["income"][territory_code]
            observations.append({
                "territory_code": territory_code, "indicator_code": code, "indicator_name": label,
                "unit": unit, "year": 2022, "value": parse_br_number(row[column]),
                "source_code": "ibge_censo_rendimento_responsavel_2022",
                "source": "IBGE - Censo Demográfico 2022, rendimento do responsável",
                "source_url": SOURCES["income"], "classification": "observado",
                "definition": definition, "geography": "bairro",
                "limitations": "Rendimento do responsável que possui rendimento; não equivale à renda per capita nem informa gasto com energia.",
            })

    urban_metrics = [
        ("urban_paved_share", "Domicílios em face com via pavimentada", "V05006", "Proporção de DPOs em face com via pavimentada"),
        ("urban_lighting_share", "Domicílios em face com iluminação pública", "V05012", "Proporção de DPOs em face com iluminação pública"),
        ("urban_sidewalk_share", "Domicílios em face com calçada", "V05021", "Proporção de DPOs em face com calçada"),
        ("urban_no_trees_share", "Domicílios em face sem árvores", "V05030", "Proporção de DPOs em face sem árvores"),
    ]
    for code, label, yes_col, description in urban_metrics:
        for territory_code in TARGETS:
            row = tables["urban"][territory_code]
            denominator = parse_br_number(row["V05000"])
            numerator = parse_br_number(row[yes_col])
            observations.append({
                "territory_code": territory_code, "indicator_code": code, "indicator_name": label,
                "unit": "%", "year": 2022, "value": round(numerator / denominator * 100, 2) if denominator else 0,
                "source_code": "ibge_censo_entorno_domicilios_2022",
                "source": "IBGE - Censo Demográfico 2022, características urbanísticas do entorno",
                "source_url": SOURCES["urban"], "classification": "derivado",
                "definition": f"{description}. Fórmula: {yes_col} / V05000 × 100.",
                "geography": "bairro", "limitations": "Percentual de domicílios ponderado pela face de entorno; não mede qualidade ou continuidade do serviço.",
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
                "source_code": "epe_anuario_2026",
                "source": "EPE - Anuário Estatístico de Energia Elétrica 2026, tabela 4.17",
                "source_url": SOURCES["epe"], "classification": "observado",
                "definition": f"Valor publicado pela EPE para a Bahia no ano de {year}.",
                "geography": "estado", "limitations": "Dado estadual; não representa nem pode ser atribuído aos bairros.",
            })

    # IPEA IVS is available for Salvador at municipality level for 2000 and 2010.
    ipea_path = RAW / "ipea_ivs_municipal.zip"
    download(SOURCES["ipea"], ipea_path)
    with zipfile.ZipFile(ipea_path) as archive:
        xlsx_name = next(n for n in archive.namelist() if n.lower().endswith(".xlsx"))
        ipea_bytes = io.BytesIO(archive.read(xlsx_name))
    ipea_sheet = load_workbook(ipea_bytes, read_only=True, data_only=True)["Municipios"]
    ipea_rows = [row for row in ipea_sheet.iter_rows(min_row=2, values_only=True) if row[1] == 292740]
    ipea_by_year = {int(row[5]): row for row in ipea_rows}
    if set(ipea_by_year) != {2000, 2010}:
        raise ValueError("IPEA municipal IVS table is missing Salvador for 2000 and/or 2010")
    territories.append({"code": "2927408", "name": "Salvador", "parent": "Bahia", "geography_level": "município"})
    ipea_indicators = [
        ("ivs", "Índice de Vulnerabilidade Social (IVS)", 25, "Índice sintético de 0 a 1"),
        ("ivs_income_work", "IVS Renda e Trabalho", 22, "Dimensão do IVS, índice de 0 a 1"),
        ("ivs_human_capital", "IVS Capital Humano", 23, "Dimensão do IVS, índice de 0 a 1"),
        ("ivs_urban_infrastructure", "IVS Infraestrutura Urbana", 24, "Dimensão do IVS, índice de 0 a 1"),
    ]
    for code, label, column, definition in ipea_indicators:
        for year, row in ipea_by_year.items():
            observations.append({
                "territory_code": "2927408", "indicator_code": code, "indicator_name": label,
                "unit": "índice (0–1)", "year": year, "value": float(row[column]),
                "source_code": "ipea_ivs_municipal",
                "source": "IPEA - Atlas da Vulnerabilidade Social, Base IVS Municipal",
                "source_url": SOURCES["ipea"], "classification": "observado",
                "definition": definition, "geography": "município",
                "limitations": "Valor municipal publicado pelo IPEA; não descreve os bairros individualmente. Referência histórica de 2000/2010.",
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
