# Revisão do dashboard — Membro 3

Branch: `feature/member-3-dashboard` (a partir de `develop`). Escopo: telas, filtros, gráficos, mapa e acessibilidade. Não foram alterados ETL, schema nem `loadData` (frentes dos membros 1 e 2).

## Problemas encontrados e correções

| # | Área | Problema | Correção |
|---|---|---|---|
| 1 | Todas | Valores lidos por posição (`rows[0]`, `rows[1]`). Com o Supabase, que ordena só por ano, os bairros podiam trocar de lugar e receber o valor errado. | Busca por `territory_code` (`valueFor` em `src/lib/format.ts`). |
| 2 | Visão geral | O card "Diferença populacional" e o texto "quem tem mais residentes" dependiam da ordem das linhas. "Maior densidade" não dizia qual bairro. | Cálculo pelo código do território; o card de densidade passa a nomear o bairro. |
| 3 | Comparar | Percentuais e rendas apareciam sem unidade (ex.: "99,82"), e a diferença relativa de proporções era dada em "%". | Formatação por unidade (%, R$, índice); proporções comparadas em **pontos percentuais (p.p.)**; diferença relativa omitida quando não se aplica. |
| 4 | Comparar | O quadro não informava se o indicador é observado ou derivado. | Coluna "Tipo" e texto com definição e limitação do indicador selecionado. |
| 5 | Mapa | Legenda errada: "valor menor" e "valor maior" usavam a mesma cor. | Cores da legenda iguais às do mapa; caso específico para valores iguais (ex.: rendimento mediano). |
| 6 | Mapa | Os tooltips ficavam presos à primeira camada escolhida. | O GeoJSON é recriado ao trocar de camada; o tooltip mostra indicador, valor e unidade. |
| 7 | Mapa | Centro fixo; Pernambués aparecia parcialmente; contorno branco pouco visível. | `fitBounds` nos limites oficiais; contorno escuro. Barras de proporção em escala de 0 a 100%. |
| 8 | Energia | Anos e intervalo fixos no código ("2011–2025", padrão 2025); dado ausente virava 0. | Anos e intervalo lidos dos dados; ausência exibida como "—"; ponto do ano selecionado destacado; eixo com unidade (GWh). |
| 9 | Gráficos | Valores visíveis só no hover (inacessíveis no celular e para leitores de tela). | Rótulo de valor nas barras e `aria-label` com resumo dos dados. |
| 10 | Navegação | O indicador de seção ativa ficava sempre em "Visão geral"; páginas sem URL própria. | Indicador correto, `aria-current` e rotas por hash (ex.: `#/map`, `#/compare`) para compartilhar e apresentar. |
| 11 | Acessibilidade | Fontes de 6 a 9 px; sem foco visível; menu móvel sem `aria-expanded` e sem forma de fechar. | Tamanho mínimo de cerca de 10 a 12 px, foco visível, link "pular para o conteúdo", fundo escurecido e tecla Esc para fechar o menu. |

## Como verificar

```bash
npm install
npm run build   # tsc + vite sem erros
npm run dev     # abrir /#/overview, /#/compare, /#/map, /#/energy, /#/method
```

Testado em desktop e em viewport móvel (375 px), sem erros no console.

## Pontos para combinar com a equipe

- **Membro 1:** confirmar os textos de definição/limitação exibidos na comparação (vêm do `seed.json`) e se "Face do domicílio sem árvores" deve vir acompanhado de aviso de sentido invertido.
- **Membro 2:** a interface depende de `territory_code`, `unit`, `classification`, `definition` e `limitations` da view `dashboard_observations` (já presentes em `supabase/schema.sql`). Avisar antes de renomear qualquer coluna e testar o painel com o Supabase conectado depois da carga.
- **Membro 4:** as rotas `#/...` permitem abrir cada seção direto durante a apresentação.
