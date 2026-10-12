# AGENTS.md

## Visão geral do projeto

Este repositório é uma aplicação web em Node.js/Express com front-end em HTML/CSS/JS e integração com MySQL. O objetivo principal é um jogo de xadrez em estilo daily challenge (Chessdle), com login, cadastro, autenticação e páginas de dashboard.

O projeto mistura:
- front-end estático em `public/`
- API REST em `src/routes/`, `src/controllers/` e `src/models/`
- banco MySQL em `src/database/`
- ambiente configurado via `.env` e `.env.dev`

## Stack e arquitetura

### Backend
- `app.js`: ponto de entrada da aplicação
- `express`: servidor HTTP
- `cors`: habilita CORS
- `dotenv`: leitura dos arquivos de ambiente
- `mysql2`: conexão com banco

### Front-end
- `public/index.html`: landing page do jogo principal
- `public/login.html`: tela de login
- `public/cadastro.html`: tela de cadastro
- `public/dashboard/`: páginas internas do painel/admin
- `public/js/`: scripts do front-end (`chessdle.js`, `sessao.js`, `alerta.js`)
- `public/css/`: estilos do site

### Estrutura de dados e camadas
- `src/routes/*.js`: rotas HTTP da API
- `src/controllers/*.js`: lógica de requisição/resposta
- `src/models/*.js`: consultas SQL por entidade
- `src/database/config.js`: configuração da conexão com o MySQL
- `src/database/script-tabelas.sql`: script de apoio para criação das tabelas

## Fluxo principal do app

### Autenticação
- O login é realizado por `POST /usuarios/autenticar`
- O cadastro é realizado por `POST /usuarios/cadastrar`
- Os dados do usuário são armazenados em `sessionStorage` no navegador:
  - `EMAIL_USUARIO`
  - `NOME_USUARIO`
  - `ID_USUARIO`
- A verificação da sessão é feita em `public/js/sessao.js`
- Cadastro e autenticação usam apenas nome, e-mail e senha; não dependem de empresas ou códigos de ativação

### Jogo Chessdle
- A lógica do jogo fica em `public/js/chessdle.js`
- O site usa modos:
  - jogador
  - abertura
  - citação
- Há um sistema de tentativas, pistas e histórico de palpites
- O “desafio do dia” é calculado em função da data atual
- Títulos, descrições, perguntas, respostas, opções, pistas, jogadores e aberturas são carregados de `GET /desafios`
- O conteúdo inicial dos desafios está em `src/database/script-tabelas.sql`
- Ao concluir os três modos, o desempenho completo é persistido em uma linha de `partida` pela API `POST /partidas`
- O dashboard carrega pela API `GET /partidas/:id?usuarioId=...` a partida recém-salva
- O gráfico de tentativas usa Chart.js, carregado via CDN em `public/dashboard/resultado.html`
- Os dados e o resumo são apresentados por `public/js/chessdle-dashboard.js`, com estilos em `public/css/chessdle-dashboard.css`

### Dashboard / área interna
- O banco usa as tabelas `usuario`, `partida`, `desafio_config`, `opcao_desafio`, `dica_desafio`, `jogador` e `abertura`
- Cada partida guarda tentativas, acertos e pistas dos três modos em uma única linha
- As tabelas e rotas antigas de empresas, aquários, medidas e avisos são legadas e não fazem parte do fluxo principal

## Convenções do código

### Linguagem e padrão visual
- O código e as telas estão em português do Brasil
- A interface usa HTML puro + CSS + JavaScript vanilla
- Os nomes de variáveis e IDs no front-end costumam ser em português

### Padrão do backend
- O projeto segue um modelo MVC simplificado:
  - `routes` recebe a requisição
  - `controllers` valida e orquestra a operação
  - `models` executa query SQL
- Use placeholders SQL (`?`) e parâmetros em `database.executar`

### Variáveis de ambiente
O servidor usa os seguintes parâmetros do ambiente:
- `APP_PORT`
- `APP_HOST`
- `AMBIENTE_PROCESSO`
- `DB_HOST`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`
- `DB_PORT`

O arquivo `app.js` alterna entre:
- `.env` para produção
- `.env.dev` para desenvolvimento

## Como rodar o projeto

### Instalar dependências
```bash
npm install
```

### Iniciar em modo normal
```bash
npm start
```

### Iniciar em desenvolvimento com nodemon
```bash
npm run dev
```

## Observações importantes para manutenção

1. O front-end é estático; não há framework (React/Vue/Angular) aparente no projeto atual.
2. A autenticação usa `sessionStorage`; qualquer alteração nesse fluxo pode quebrar o acesso ao jogo e à partida salva.
3. `src/database/script-tabelas.sql` apaga e recria o banco `chessdle`; só execute no ambiente de desenvolvimento, pois todos os dados serão perdidos.
4. O gráfico depende da API e da tabela `partida`; não use dados temporários do navegador como fonte do gráfico.

## Arquivos de referência importantes
- `app.js`
- `public/index.html`
- `public/login.html`
- `public/cadastro.html`
- `public/js/chessdle.js`
- `public/dashboard/resultado.html`
- `public/js/chessdle-dashboard.js`
- `public/css/chessdle-dashboard.css`
- `src/routes/partidas.js`
- `src/routes/desafios.js`
- `src/controllers/desafioController.js`
- `src/models/desafioModel.js`
- `src/routes/desafios.js`
- `src/controllers/partidaController.js`
- `src/controllers/desafioController.js`
- `src/models/partidaModel.js`
- `src/models/desafioModel.js`
- `src/routes/usuarios.js`
- `src/controllers/usuarioController.js`
- `src/models/usuarioModel.js`
- `src/database/config.js`
- `src/database/script-tabelas.sql`

## Dicas para agentes/IA

- Mantenha a linguagem em português do Brasil nos textos de interface.
- Preserve o padrão de HTML/JS vanilla em vez de introduzir framework sem necessidade.
- Antes de mexer em autenticação, verifique o fluxo de `sessionStorage` e os endpoints `/usuarios/autenticar` e `/usuarios/cadastrar`.
- Ao alterar o banco, consulte `src/database/script-tabelas.sql` e os models correspondentes.
- Se for preciso rodar o app, sempre verifique primeiro as variáveis de ambiente e o arquivo `.env`/`.env.dev`.

## Resumo executivo

O projeto é um site de jogo diário de xadrez com login, cadastro, dashboard e API Express conectada a MySQL. A parte principal do jogo está em `public/js/chessdle.js`, enquanto a aplicação web em si é servida via `app.js` e páginas estáticas em `public/`.
