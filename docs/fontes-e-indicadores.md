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

As definições `v0001` a `v0009` vêm do dicionário oficial **Dicionário Básico** do arquivo `dicionario_de_dados_agregados_por_setores_censitarios_20261113.xlsx`. A malha e a tabela são baixadas pelo ETL; arquivos nacionais brutos ficam fora do repositório.

## Catálogo de indicadores para investigação

| Dimensão | Indicador candidato | Fonte e escala esperada | Situação / cuidado |
|---|---|---|---|
| Demográfica | População residente | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Domicílios totais | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Moradores por domicílio ocupado | IBGE, bairro, 2022 | Carregado; observado |
| Demográfica | Densidade populacional | IBGE, bairro, 2022 | Carregado; derivado por área oficial |
| Habitacional | Domicílios vagos | IBGE, bairro, 2022 | Carregado; observado |
| Habitacional | Domicílios de uso ocasional | IBGE, bairro, 2022 | Carregado; observado |
| Econômica | Distribuição de rendimento domiciliar | IBGE, bairro/setor conforme tabela | Candidato; validar variáveis e denominadores no dicionário antes de exibir |
| Social | Escolaridade / alfabetização | IBGE, bairro/setor conforme tabela | Candidato; selecionar tabela e grupos etários comparáveis |
| Habitacional | Abastecimento de água | IBGE, bairro/setor conforme tabela | Candidato; publicar percentual somente com numerador e denominador definidos |
| Habitacional | Esgotamento sanitário | IBGE, bairro/setor conforme tabela | Candidato; validar categorias da tabela |
| Urbana | Arborização, pavimentação e iluminação pública | IBGE, entorno, setor ou bairro quando agregado | Candidato; iluminação pública não mede continuidade elétrica residencial |
| Social | Índice de Vulnerabilidade Social (IVS) | IPEA, escala indicada na edição | Candidato; não presumir disponibilidade por bairro |
| Energética | Consumo residencial e número de consumidores | EPE, estado/região | Candidato; usar como contexto da Bahia, nunca como observação de bairro |

## Fontes oficiais

- IBGE, [agregados por bairro do Censo 2022 (CSV)](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/).
- IBGE, [malha oficial de bairros do Censo 2022](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/).
- IBGE, [dicionário dos agregados censitários](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/).
- IPEA, [Atlas da Vulnerabilidade Social](http://ivs.ipea.gov.br/).
- EPE, [Anuário Estatístico de Energia Elétrica e dados abertos](https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica).

## Limites

Baixa renda, densidade, condições de moradia e infraestrutura são dimensões relacionadas, mas não comprovam pobreza energética de uma família. O Censo descreve um período específico. Comparações percentuais exigem denominadores compatíveis. Dados estaduais da EPE são exibidos em painel separado e não são distribuídos artificialmente entre bairros. Um eventual IEVS será exploratório e não oficial, com normalização, pesos e sensibilidade explicitados.
