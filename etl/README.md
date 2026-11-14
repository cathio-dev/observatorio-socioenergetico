# Pipeline IBGE

O script baixa tabelas censitárias de população, domicílios, rendimento e entorno, além da malha oficial de bairros do IBGE; filtra os códigos de Salvador `2927408018` e `2927408117`; e produz `src/data/seed.json` e `src/data/bairros.geojson`. Também extrai da tabela 4.17 do Anuário EPE 2026 as séries estaduais de consumo residencial e consumidores (2011-2025), e da Base IVS Municipal do IPEA as quatro séries municipais de Salvador (2000 e 2010).

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r etl/requirements.txt
python etl/prepare_census.py
```

Os arquivos brutos são guardados em `data/raw/` e ignorados pelo Git. O dataset processado contém somente os dois bairros do projeto, uma unidade municipal para Salvador e uma unidade estadual para a Bahia. As taxas derivadas registram a variável numeradora e o denominador usado. Os valores do IPEA não são atribuídos aos bairros, e a série de energia nunca é desagregada artificialmente.

Para carregar no Supabase, copie URL, chave anônima e chave de serviço para `.env.local` (a chave de serviço deve ficar somente na máquina local; nunca use prefixo `VITE_` nela). Execute `supabase/schema.sql` no SQL Editor e rode:

```bash
node --env-file=.env.local etl/load_supabase.mjs
```

O `service_role` ignora RLS; use-o somente no processo local de ingestão. Não o salve no Git, no frontend ou na Vercel. A aplicação usa apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para leitura pública.

Antes de atualizar o snapshot, compare cabeçalhos e definições com o dicionário vigente do IBGE. Não altere os códigos dos bairros para contornar discrepância nominal.
