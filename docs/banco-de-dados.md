# Banco de Dados — Observatório de Vulnerabilidade Socioenergética de Salvador

## 1. Visão geral

O projeto utiliza PostgreSQL por meio do Supabase como banco de dados para armazenar e disponibilizar informações socioeconômicas, demográficas, habitacionais, energéticas e urbanas dos territórios analisados.

O banco foi estruturado para permitir consultas e comparações entre territórios, indicadores, fontes e anos de referência, alimentando o dashboard desenvolvido em React.

## 2. Estrutura do banco de dados

Foram criadas quatro tabelas principais:

| Tabela | Descrição |
|---|---|
| `territories` | Armazena os territórios analisados e suas informações geográficas. |
| `sources` | Armazena as fontes oficiais utilizadas na coleta dos dados. |
| `indicators` | Armazena os indicadores e suas respectivas dimensões e unidades. |
| `observations` | Armazena os valores dos indicadores associados aos territórios, fontes e anos. |

As tabelas possuem relacionamentos para manter a integridade e a organização das informações.

## 3. Dados importados

Após a execução do processo de importação, foram cadastrados:

| Elemento | Quantidade |
|---|---:|
| Territórios | 4 |
| Fontes | 6 |
| Indicadores | 23 |
| Observações | 72 |


## 4. Dimensões dos indicadores

Os indicadores foram organizados nas seguintes dimensões:

- Demográfica;
- Econômica;
- Energética;
- Habitacional;
- Urbana.

Essa classificação permite organizar e consultar os indicadores de acordo com suas respectivas áreas de análise.

## 5. View do dashboard

Foi criada a view `dashboard_observations`, responsável por disponibilizar os dados organizados para consulta pelo frontend.

A view reúne informações como:

- Código e nome do território;
- Fonte dos dados;
- Código e nome do indicador;
- Unidade de medida;
- Ano de referência;
- Valor do indicador;
- Dimensão do indicador;
- Nível geográfico.

Essa estrutura facilita a consulta e a utilização dos dados pelo dashboard.

## 6. Segurança e permissões

Foi habilitado o Row Level Security (RLS) nas quatro tabelas principais.

Foram configuradas políticas de leitura (`SELECT`) para os papéis `anon` e `authenticated`, permitindo que o dashboard consulte os dados públicos.

Não foram identificadas políticas de escrita (`INSERT`, `UPDATE` e `DELETE`) nas consultas realizadas às políticas existentes.

## 7. Integração com o frontend

A integração entre React e Supabase foi realizada principalmente no arquivo `src/lib/data.ts`.

O frontend utiliza as variáveis de ambiente:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

Os dados são consultados por meio da view `dashboard_observations` e disponibilizados para utilização no dashboard.

O arquivo `src/App.tsx` utiliza a função de carregamento dos dados e apresenta o estado da conexão.

Durante os testes, foram obtidos os seguintes resultados:

- 72 registros recebidos do Supabase;
- 4 territórios recebidos;
- Conexão estabelecida com sucesso.

A aplicação também mantém um mecanismo de fallback utilizando os dados locais do projeto.

## 8. Validação dos dados

Foram realizadas consultas SQL para verificar:

- Distribuição dos registros por território e ano;
- Disponibilidade das dimensões dos indicadores;
- Associação entre territórios, fontes e indicadores;
- Existência de observações duplicadas;
- Funcionamento de consultas combinando território, ano e dimensão;
- Configuração do RLS e das políticas de leitura.

Também foi testada uma consulta para Pernambués, no ano de 2022, na dimensão urbana, que retornou quatro registros.

## 9. Arquivos relacionados

Os principais arquivos envolvidos na implementação são:

| Arquivo | Responsabilidade |
|---|---|
| `schema.sql` | Definição da estrutura do banco de dados. |
| `etl/load_supabase.mjs` | Importação dos dados para o Supabase. |
| `src/lib/data.ts` | Integração e carregamento dos dados. |
| `src/App.tsx` | Utilização dos dados no dashboard. |
| `.env.example` | Exemplo de configuração das variáveis de ambiente, sem credenciais reais. |

## 10. Execução e manutenção

Para preparar o banco de dados:

1. Criar ou acessar o projeto no Supabase.
2. Executar o arquivo `schema.sql` no SQL Editor.
3. Configurar as variáveis de ambiente necessárias no arquivo `.env`.
4. Executar o processo de importação dos dados.

Com o Node.js instalado e as variáveis de ambiente configuradas, a importação pode ser executada pelo comando:

```powershell
node --env-file=.env etl/load_supabase.mjs
```

O banco utiliza o Supabase hospedado na nuvem, não sendo necessária a execução de containers Docker para esse processo.

---

**Responsabilidade:** Banco de Dados / Supabase — Projeto Observatório de Vulnerabilidade Socioenergética de Salvador.