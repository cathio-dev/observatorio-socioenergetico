# Fontes, indicadores e limites de interpretação

## Recorte geográfico e tempo

O IBGE identifica os bairros como **Beiru / Tancredo Neves**, código `2927408018`, e **Pernambués**, código `2927408117`. A tabela e a malha do Censo 2022 usam o mesmo código. O nome oficial é preservado no banco e na interface. O limite é o do Censo 2022, não uma afirmação sobre limites administrativos atuais.

## Indicadores carregados

| Código | Indicador | Classificação | Definição / unidade | Escala e referência |
|---|---|---|---|---|
| `population` | População residente | Observado | `v0001`, pessoas | Bairro, Censo 2022 |
| `dwellings_total` | Domicílios totais | Observado | `v0002`, domicílios (categorias do agregado básico) | Bairro, Censo 2022 |
| `dwellings_occupied` | Domicílios particulares ocupados | Observado | `v0007`, permanentes ocupados + improvisados ocupados | Bairro, Censo 2022 |
| `dwellings_occasional` | Domicílios de uso ocasional | Observado | `v0008`, domicílios | Bairro, Censo 2022 |
| `dwellings_vacant` | Domicílios vagos | Observado | `v0009`, domicílios | Bairro, Censo 2022 |
| `residents_per_occupied_dwelling` | Moradores por domicílio ocupado | Observado | `v0005`, pessoas por domicílio | Bairro, Censo 2022 |
| `population_density` | Densidade populacional | Derivado | `v0001 / AREA_KM2`, pessoas/km² | Bairro, Censo 2022 |
| `water_network_share` | Domicílios com água pela rede geral | Derivado | `V00111 / V00001 × 100`, % dos DPO | Bairro, Censo 2022 |
| `sewer_network_share` | Domicílios com esgoto na rede geral/pluvial | Derivado | `V00309 / V00001 × 100`, % dos DPO | Bairro, Censo 2022 |
| `waste_collection_share` | Domicílios atendidos por coleta de serviço de limpeza | Derivado | `(V00397 + V00398) / V00001 × 100`, % dos DPO | Bairro, Censo 2022 |
| `without_bathroom_share` | Domicílios sem banheiro ou sanitário | Derivado | `V00238 / V00001 × 100`, % dos DPO | Bairro, Censo 2022 |
| `income_average` | Rendimento médio nominal mensal do responsável com rendimento | Observado | R$/mês, valores nominais de 2022 | Bairro, Censo 2022 |
| `income_median` | Rendimento mediano nominal mensal do responsável com rendimento | Observado | R$/mês, valores nominais de 2022 | Bairro, Censo 2022 |
| `urban_paved_share` | Domicílios em face com via pavimentada | Derivado | `V05006 / V05000 × 100`, % | Bairro, entorno, Censo 2022 |
| `urban_lighting_share` | Domicílios em face com iluminação pública | Derivado | `V05012 / V05000 × 100`, % | Bairro, entorno, Censo 2022 |
| `urban_sidewalk_share` | Domicílios em face com calçada | Derivado | `V05021 / V05000 × 100`, % | Bairro, entorno, Censo 2022 |
| `urban_no_trees_share` | Domicílios em face sem árvores | Derivado | `V05030 / V05000 × 100`, % | Bairro, entorno, Censo 2022 |
| `ivs` | IVS | Observado | Índice de 0 a 1 publicado pelo IPEA | Município de Salvador, 2000 e 2010 |
| `ivs_income_work` | IVS Renda e Trabalho | Observado | Dimensão do IVS, índice de 0 a 1 | Município de Salvador, 2000 e 2010 |
| `ivs_human_capital` | IVS Capital Humano | Observado | Dimensão do IVS, índice de 0 a 1 | Município de Salvador, 2000 e 2010 |
| `ivs_urban_infrastructure` | IVS Infraestrutura Urbana | Observado | Dimensão do IVS, índice de 0 a 1 | Município de Salvador, 2000 e 2010 |
| `electricity_residential_consumption` | Consumo residencial de eletricidade | Observado | GWh | Estado da Bahia, 2011–2025 |
| `electricity_residential_consumers` | Consumidores residenciais de eletricidade | Observado | unidades consumidoras | Estado da Bahia, 2011–2025 |

As definições do IBGE vêm do dicionário oficial dos agregados censitários e dos dicionários das tabelas de rendimento e entorno. As séries da EPE vêm da tabela 4.17 do workbook do Anuário 2026. Os quatro índices do IPEA foram filtrados pelo código municipal `292740` na aba `Municipios` da Base IVS Municipal, edição de 2015. A malha e as tabelas são baixadas pelo ETL; arquivos brutos ficam fora do repositório.

## Catálogo de indicadores para investigação

| Dimensão | Indicador candidato | Fonte e escala esperada | Situação / cuidado |
|---|---|---|---|
| Demográfica | População residente | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Domicílios totais | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Moradores por domicílio ocupado | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Densidade populacional | IBGE, bairro, 2022 | Carregado; derivado por área oficial |
| Habitacional | Domicílios vagos | IBGE, bairro, 2022 | Carregado; observado |
| Habitacional | Domicílios de uso ocasional | IBGE, bairro, 2022 | Carregado; observado |
| Econômica | Rendimento médio e mediano de responsáveis com rendimento | IBGE, bairro, Censo 2022 | Carregado; não é renda per capita nem inclui quem não declarou rendimento |
| Social | Escolaridade / alfabetização | IBGE, bairro/setor conforme tabela | Candidato; selecionar tabela e grupos etários comparáveis |
| Habitacional | Água pela rede geral, esgoto em rede geral/pluvial e coleta por serviço de limpeza | IBGE, bairro, Censo 2022 | Carregado; percentuais têm numeradores e denominador DPO documentados |
| Habitacional | Domicílios sem banheiro ou sanitário | IBGE, bairro, Censo 2022 | Carregado; indicador derivado sobre DPO |
| Urbana | Arborização, pavimentação, calçada e iluminação pública | IBGE, entorno, bairro, Censo 2022 | Carregado; iluminação pública não mede continuidade elétrica residencial |
| Social | IVS geral e dimensões | IPEA, município de Salvador | Carregado para 2000 e 2010; histórico municipal, sem desagregação para os bairros |
| Energética | Consumo residencial | EPE, Bahia | Carregado para 2011–2025; contexto estadual |
| Energética | Consumidores residenciais | EPE, Bahia | Carregado para 2011–2025; contexto estadual |

## Fontes oficiais

- IBGE, [agregados por bairro do Censo 2022 (CSV)](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/).
- IBGE, [malha oficial de bairros do Censo 2022](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/).
- IBGE, [dicionário dos agregados censitários](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/).
- IPEA, [Atlas da Vulnerabilidade Social](http://ivs.ipea.gov.br/).
- IPEA, [Base IVS Municipal (arquivo oficial ZIP)](https://www.ipea.gov.br/redeipea/images/excel/dados-ivs-municipal.zip).
- EPE, [Anuário Estatístico de Energia Elétrica e dados abertos](https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica).

## Limites

O IVS municipal de Salvador é um retrato histórico baseado nos Censos 2000 e 2010; ele não representa especificamente Beiru / Tancredo Neves nem Pernambués e não deve ser comparado como se tivesse a mesma data do Censo 2022. Os indicadores de rendimento medem apenas o responsável com rendimento, e não representam renda per capita. As variáveis de entorno são ponderadas pelo número de domicílios particulares permanentes ocupados e suas categorias declaradas. Baixa renda, densidade, condições de moradia e infraestrutura são dimensões relacionadas, mas não comprovam pobreza energética de uma família. Comparações percentuais exigem denominadores compatíveis. Dados estaduais da EPE são exibidos em painel separado e não são distribuídos artificialmente entre bairros. Um eventual IEVS será exploratório e não oficial, com normalização, pesos e sensibilidade explicitados.
