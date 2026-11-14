# Como contribuir

## Fluxo de branches

- `main`: versão estável para publicação.
- `develop`: integração da equipe; branches de funcionalidade partem daqui e voltam por pull request.
- `feature/member-1-dados`: fontes, catálogo, ETL e qualidade dos dados.
- `feature/member-2-supabase`: PostgreSQL, Supabase, políticas e carga.
- `feature/member-3-dashboard`: telas, filtros, gráficos, mapa e acessibilidade.
- `feature/member-4-integracao-deploy`: documentação, interpretação, apresentação e Vercel.

Cada pessoa deve entrar no GitHub com a própria conta e fazer ao menos uma contribuição substantiva, com commit próprio, em sua branch ou pull request. Não assine commits em nome de colegas. No repositório local preparado, os commits foram feitos pela identidade Git já configurada nesta máquina; a equipe deve acrescentar suas contribuições reais antes de entregar.

## Trabalhar em uma feature

```bash
git switch develop
git pull origin develop
git switch -c feature/member-4-integracao-deploy
# editar, revisar e salvar arquivos
git add docs/ CONTRIBUTING.md
git commit -m "docs: document integration and presentation plan"
git push -u origin feature/member-4-integracao-deploy
```

Abra um pull request para `develop`, descreva as alterações, informe as fontes e peça revisão de outro integrante. Após a integração e a demonstração, publique a versão aprovada de `develop` em `main`.

## Mensagens de commit

Use Conventional Commits em português ou inglês: `feat:`, `fix:`, `docs:`, `data:`, `chore:`. Cada commit deve ser pequeno e explicar a mudança.

## Revisão de dados

- Preserve código do território, fonte, ano e escala.
- Mantenha arquivos brutos fora do Git; o pipeline baixa novamente as fontes públicas.
- Não exponha `SUPABASE_SERVICE_ROLE_KEY` nem qualquer chave privilegiada no frontend.
- Mudanças no modelo devem atualizar o schema, o loader, a interface e o dicionário metodológico.
- Não publique inferências sobre energia ou pobreza energética que o indicador não sustenta.
