# Plano do projeto

## Objetivo

Integrar dados públicos do IBGE, IPEA e EPE para descrever Beiru / Tancredo Neves e Pernambués, contextualizar vulnerabilidade socioenergética sem inventar dados de bairro e publicar um dashboard responsivo.

## Escopo construído

1. Pipeline reproduzível: IBGE Censo 2022 para bairros, IVS IPEA para Salvador em 2000/2010 e EPE para Bahia em 2011–2025.
2. Modelo relacional e política de leitura pública no Supabase; ingestão administrativa por script local com chave de serviço.
3. Dashboard com resumo, comparação, mapa, série energética e fontes/metodologia.
4. Entrega prevista em Vercel com deploy a partir do GitHub.
5. Relatório/análise: comparar valores de mesma escala e mesmo período; explicitar limitações e perguntas sem resposta.

## Divisão entre quatro participantes

| Participante | Branch | Responsabilidade principal | Entrega verificável |
|---|---|---|---|
| Membro 1 | `feature/member-1-dados` | IBGE, IPEA, EPE, catálogo, ETL e relatório de qualidade | Dataset reproduzível, variáveis rastreadas e validações documentadas |
| Membro 2 | `feature/member-2-supabase` | Modelo PostgreSQL, Supabase, políticas de leitura e carga | Schema aplicado, tabelas preenchidas e consulta do dashboard funcionando |
| Membro 3 | `feature/member-3-dashboard` | Componentes React, filtros, mapas, gráficos e responsividade | Cinco áreas do dashboard ligadas ao contrato de dados |
| Membro 4 (você) | `feature/member-4-integracao-deploy` | Integração, revisão por pares, deploy Vercel e apresentação | Pull requests revisados, URL pública, roteiro e conclusões defensáveis |

### Onde as tarefas se cruzam

- Membro 1 combina com o Membro 2 os códigos e campos que serão usados no banco (`territory_code`, `indicator_code`, `year`, fonte, unidade e escala).
- Membro 2 combina com o Membro 3 o nome e os tipos do view `dashboard_observations`, além do acesso de leitura anônima.
- Membro 3 valida o dashboard junto ao Membro 1 para garantir que títulos, unidades e avisos reflitam o significado real dos dados.
- Você combina com os três a revisão final, confere configuração de deploy e inclui no relatório somente conclusões respaldadas pelos dados.
- Todo mundo revisa pelo menos um pull request de outra pessoa e registra sua própria contribuição por commits reais.

## Perguntas para a apresentação

- Qual o perfil demográfico dos dois bairros no Censo 2022?
- Que diferenças aparecem em domicílios, densidade e moradores por domicílio?
- Que aspectos de moradia/infraestrutura podem motivar uma investigação posterior?
- O que o IVS municipal histórico de Salvador permite contextualizar — e o que ele não permite afirmar sobre os bairros?
- Como o consumo estadual da Bahia mudou entre 2011 e 2025, sem extrapolar essa série aos bairros?
- Quais informações domiciliares adicionais seriam necessárias para medir vulnerabilidade energética diretamente?
- Que intervenções podem ser priorizadas com evidências proporcionais à escala dos dados?

## Backlog a concluir com dados e contas do grupo

- [ ] Confirmar se o professor aceita Censo 2022 para os bairros e IVS IPEA histórico de Salvador como contextualização.
- [ ] Incorporar renda e infraestrutura somente depois de mapear variáveis e denominadores no dicionário correto do IBGE.
- [ ] Criar projeto Supabase na conta do grupo, executar `supabase/schema.sql`, preencher variáveis e importar o snapshot.
- [ ] Criar repositório remoto na conta do integrante responsável e enviar branches.
- [ ] Configurar Vercel e variáveis públicas do Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [ ] Fazer revisão pelos quatro integrantes, capturar evidências reais de colaboração e ensaiar a apresentação.

## Critério metodológico

Nenhum dado da Bahia ou do município é replicado para os dois bairros. Os gráficos comparam somente observações de mesma unidade e período; o mapa usa limites oficiais do Censo 2022.
