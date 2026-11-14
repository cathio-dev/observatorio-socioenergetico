# Observatório Socioenergético de Salvador

Dashboard público para caracterizar e comparar Beiru / Tancredo Neves e Pernambués com indicadores oficiais, preservando fonte, período e escala geográfica.

## Situação atual

- Repositório organizado em `main` e `develop`, com frentes `feature/` documentadas em [CONTRIBUTING.md](CONTRIBUTING.md).
- Base inicial reproduzível do Censo 2022 por bairro (IBGE), IVS municipal do IPEA (2000 e 2010) e série energética estadual da EPE (2011 a 2025).
- Catálogo de indicadores, pipeline de importação, esquema PostgreSQL/Supabase e dashboard React preparados.
- O app identifica os registros carregados pela fonte e pelo ano; não cria valores de bairro a partir de dados estaduais.
- Conexões com Supabase, GitHub e Vercel exigem as contas/credenciais correspondentes.

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Para carregar dados no Supabase, execute `supabase/schema.sql` no SQL Editor, configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, depois siga `etl/README.md`. O relatório analítico, o relatório de qualidade e o roteiro de apresentação estão em `docs/`.

## Dados e método

O recorte inicial é o Censo Demográfico 2022 agregado por bairro. As variáveis `v0001` e `v0002` são identificadas conforme o dicionário oficial do IBGE guardado em `docs/fontes-e-indicadores.md`. Variáveis ainda sem validação no dicionário não aparecem como métricas publicadas.

O catálogo registra classificação (observado, derivado ou proxy), escala e limitações. A EPE contextualiza o estado da Bahia; um indicador estadual nunca é repetido como observação de bairro. O bairro do IBGE aparece como **Beiru / Tancredo Neves**, preservando a denominação oficial.

## Tecnologias

React, Vite, TypeScript, Recharts, Leaflet, Supabase/PostgreSQL e Vercel.

## Entregas planejadas

Visão geral, comparação territorial, mapa, contexto energético da Bahia e página de fontes/metodologia. Veja [plano de projeto](docs/plano-do-projeto.md) e [contribuição e branches](CONTRIBUTING.md).
