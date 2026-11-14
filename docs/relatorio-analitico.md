# Relatório analítico — versão inicial

**Observatório de Vulnerabilidade Socioenergética de Salvador**  
**Recorte principal:** Beiru / Tancredo Neves e Pernambués  
**Referência principal:** Censo Demográfico 2022

## Síntese

O Censo 2022 registra 38.329 moradores em Beiru / Tancredo Neves e 52.564 em Pernambués. Pernambués tem 14.235 residentes a mais; Beiru / Tancredo Neves, apesar da população menor, tem maior densidade média porque sua área oficial é menor. Os indicadores agregados de água pela rede geral, esgoto em rede geral/pluvial, pavimentação e iluminação pública são altos nos dois bairros. O entorno mostra presença de calçadas em cerca de 39% das faces ponderadas por domicílios e ausência de árvores em 65% a 74% delas.

Essas estatísticas ajudam a orientar perguntas sobre calor, habitabilidade e serviços urbanos. Não permitem afirmar que uma família específica enfrenta pobreza energética: o Censo não traz gasto de energia em proporção à renda, interrupções vividas, conforto térmico ou estratégias de restrição de consumo.

## Comparação dos bairros

| Indicador | Beiru / Tancredo Neves | Pernambués | Leitura possível |
|---|---:|---:|---|
| População residente | 38.329 | 52.564 | Pernambués registra 14.235 pessoas a mais (37,1% acima de Beiru / TN). |
| Área oficial | 1,636 km² | 3,207 km² | O recorte do Beiru / TN é menor. |
| Densidade populacional | 23.426 pessoas/km² | 16.388 pessoas/km² | A média do Beiru / TN é 42,9% maior; não descreve concentração dentro do bairro. |
| Domicílios particulares ocupados | 15.458 | 21.568 | Pernambués tem mais unidades ocupadas em termos absolutos. |
| Moradores por domicílio ocupado (média IBGE) | 2,5 | 2,4 | Valores agregados próximos; não mostram superlotação por domicílio. |
| Rendimento médio nominal mensal do responsável com rendimento | R$ 2.035,87 | R$ 2.316,25 | Valor médio maior em Pernambués; não é renda per capita nem mede capacidade de pagar energia. |
| Rendimento mediano nominal mensal do responsável com rendimento | R$ 1.212,00 | R$ 1.212,00 | A mediana coincide; valores são nominais de 2022. |
| DPO com água pela rede geral | 99,82% | 99,74% | Cobertura observada semelhante; não mede continuidade nem qualidade da água. |
| DPO com esgoto em rede geral/pluvial | 97,98% | 98,45% | Percentuais próximos; não abrangem toda a qualidade sanitária da moradia. |
| DPO com coleta por serviço de limpeza | 97,33% | 95,44% | Conta coleta no domicílio e em caçamba; a categoria e o denominador estão documentados no ETL. |
| Domicílios sem banheiro ou sanitário | 0,00% | 0,00% | A tabela agregada não registrou casos nessa categoria; não é um diagnóstico de outras condições sanitárias. |
| Face com iluminação pública | 96,51% | 98,51% | Mede a presença reportada no entorno; não mede iluminação dentro da residência nem continuidade elétrica. |
| Face com calçada | 39,46% | 38,57% | A presença de calçada é minoritária no agregado ponderado por domicílios. |
| Face sem árvores | 74,37% | 65,07% | Indica baixa arborização do entorno reportado; não substitui medição de temperatura ou sombra. |

Os percentuais de água, esgoto, coleta e ausência de banheiro usam como denominador `V00001`, domicílios particulares permanentes ocupados. As medidas de entorno usam `V05000`, o total de domicílios particulares permanentes ocupados considerado na tabela de entorno. As fórmulas e os códigos estão em `docs/fontes-e-indicadores.md` e `etl/prepare_census.py`.

## Contexto estadual e municipal

- **EPE, Bahia:** o consumo residencial observado foi 5.367,10 GWh em 2011 e 8.048,81 GWh em 2025. A série sobe 50,0% entre esses anos, com oscilação no percurso e queda de 1,4% de 2024 para 2025. São valores estaduais, não dos bairros.
- **IPEA, Salvador município:** o IVS geral publicado foi 0,449 em 2000 e 0,350 em 2010. As dimensões também recuaram nesse intervalo. É uma referência histórica de escala municipal e não mede Beiru / TN ou Pernambués no Censo 2022.

## O que é possível concluir

1. A diferença populacional e de densidade é clara, mas densidade média sozinha não descreve as condições internas do território.
2. Os indicadores agregados de água, esgoto, coleta, pavimentação e iluminação pública não apontam grande distância entre os bairros. Eles não comprovam regularidade, qualidade ou custo acessível.
3. A baixa cobertura relativa de calçadas e a proporção de faces sem árvores justificam investigar mobilidade a pé, sombra e exposição ao calor, sem tratar esses indicadores como medição direta de desconforto térmico.
4. Os valores de rendimento são médias/medianas dos responsáveis que recebem rendimento; sem despesas com eletricidade ou renda familiar completa, não é possível estimar comprometimento do orçamento.
5. As séries do IPEA e da EPE contextualizam município e estado, respectivamente. Nenhuma delas é distribuída pelos bairros.

## Próxima evidência necessária

Para medir vulnerabilidade energética domiciliar, a equipe precisaria de dados ou pesquisa sobre: despesa de energia e renda do domicílio; atrasos e interrupções; acesso e estado de equipamentos; ventilação e temperatura interna; restrição voluntária ou forçada do consumo; e percepção de conforto e segurança. Uma pesquisa amostral por bairro, protegendo informações pessoais, seria um complemento direto ao Censo.

Como hipóteses de planejamento, os resultados podem justificar investigar eficiência de equipamentos, estratégias de conforto térmico e cobertura vegetal em microáreas priorizadas. A priorização deve vir depois de medições locais e escuta dos moradores, não de um diagnóstico conclusivo produzido pelos dados atuais.

## Fontes primárias

- IBGE, [agregados por bairro do Censo 2022](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/).
- IBGE, [rendimento do responsável](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/).
- IBGE, [características urbanísticas do entorno](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/).
- IPEA, [Base IVS Municipal](https://www.ipea.gov.br/redeipea/images/excel/dados-ivs-municipal.zip).
- EPE, [Anuário Estatístico de Energia Elétrica](https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica).
