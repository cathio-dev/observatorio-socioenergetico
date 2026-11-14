# Relatório de qualidade dos dados

## Snapshot versionado

O snapshot `src/data/seed.json` contém 72 observações, filtradas de bases oficiais pelas unidades geográficas do projeto:

| Fonte | Recorte | Observações |
|---|---|---:|
| IBGE Censo 2022 — agregado básico | 2 bairros | 14 |
| IBGE Censo 2022 — características dos domicílios | 2 bairros | 8 |
| IBGE Censo 2022 — rendimento do responsável | 2 bairros | 4 |
| IBGE Censo 2022 — entorno urbano | 2 bairros | 8 |
| IPEA — Base IVS Municipal | Salvador, 2000 e 2010 | 8 |
| EPE — Anuário 2026, tabela 4.17 | Bahia, 2011–2025 | 30 |
| **Total** | 2 bairros + município + estado | **72** |

## Validações executadas pelo ETL

- Os códigos de bairro `2927408018` e `2927408117` estão presentes nas tabelas usadas e associados aos nomes oficiais.
- A malha de bairros contém os dois mesmos códigos.
- Os índices IPEA foram filtrados pelo código municipal `292740`; os dois anos esperados são 2000 e 2010.
- A planilha EPE fornece os anos 2011 a 2025 para consumo e consumidores residenciais da Bahia.
- As taxas de domicílio usam denominadores rastreados: `V00001` para características domiciliares; `V05000` para entorno.
- O pipeline bloqueia a geração se faltar algum bairro, alguma geometria ou uma observação municipal esperada do IPEA.
- O snapshot possui 54 valores publicados diretamente e 18 indicadores derivados com fórmula registrada.

## Restrições conhecidas

- O rendimento observado é dos responsáveis com rendimento; não representa renda per capita nem carga de gasto energético.
- Os indicadores de entorno caracterizam domicílios em faces selecionadas para a pesquisa de entorno e não informam qualidade individual.
- O conjunto não contém uma medida domiciliar direta de interrupção de energia, gasto relativo à renda ou conforto térmico.
- O IVS é municipal e histórico (2000/2010); a EPE é estadual e anual (2011–2025). As duas séries são separadas dos indicadores de bairro.

Para atualizar as contagens, execute `python etl/prepare_census.py` e confira o total impresso e as contagens no JSON antes de integrar a alteração.
