# Pipeline IBGE

O script baixa a tabela agregada por bairro e a malha oficial do IBGE, filtra os códigos de Salvador `2927408018` e `2927408117`, e produz `src/data/seed.json` e `src/data/bairros.geojson`. Também extrai da tabela 4.17 do Anuário EPE 2026 as séries estaduais de consumo residencial e consumidores (2011-2025), e da Base IVS Municipal do IPEA as quatro séries municipais de Salvador (2000 e 2010).

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r etl/requirements.txt
python etl/prepare_census.py
```

Os arquivos brutos são guardados em `data/raw/` e ignorados pelo Git. O dataset processado contém somente os dois bairros do projeto, uma unidade municipal para Salvador e uma unidade estadual para a Bahia. A fonte inicial é o pacote de agregados por bairro `Agregados_por_bairros_basico_BR_20260520.zip`; os limites são da malha oficial de bairros do Censo 2022 (GeoPackage da Bahia). Os valores do IPEA não são atribuídos aos bairros, e a série de energia nunca é desagregada artificialmente.

Antes de atualizar o snapshot, compare cabeçalhos e definições com o dicionário vigente do IBGE. Não altere os códigos dos bairros para contornar discrepância nominal.
