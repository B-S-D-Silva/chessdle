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
  - `AQUARIOS`
- A verificação da sessão é feita em `public/js/sessao.js`

### Jogo Chessdle
- A lógica do jogo fica em `public/js/chessdle.js`
- O site usa modos:
  - jogador
  - abertura
  - citação
- Há um sistema de tentativas, pistas e histórico de palpites
- O “desafio do dia” é calculado em função da data atual

### Dashboard / área interna
- O projeto tem páginas dedicadas para administração e listagem de avisos, empresas, aquários e medidas
- Há referências a `empresa`, `aquario`, `aviso`, `medida` e `usuario`
- Nem todos os módulos estão diretamente ligados ao gameplay principal, mas fazem parte da base do app

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
- As queries são montadas em template string diretamente no model

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

1. Este projeto foi montado sobre um template inicial e ainda conserva alguns nomes genéricos (empresa/aquário/medida) que não são totalmente exclusivos do Chessdle.
2. O front-end é estático; não há framework (React/Vue/Angular) aparente no projeto atual.
3. A autenticação e o jogo usam `sessionStorage`, então qualquer alteração no fluxo de login pode quebrar o carregamento da página inicial.
4. O acesso ao banco é feito diretamente com SQL em strings; qualquer modificação na camada de acesso deve preservar a conexão e o tratamento de erro.
5. Algumas telas e módulos parecem parcialmente desacoplados do gameplay principal; quando alterar a arquitetura, vale preservar o fluxo de login e a página principal do jogo.

## Arquivos de referência importantes
- `app.js`
- `public/index.html`
- `public/login.html`
- `public/cadastro.html`
- `public/js/chessdle.js`
- `src/routes/usuarios.js`
- `src/controllers/usuarioController.js`
- `src/models/usuarioModel.js`
- `src/database/config.js`
- `src/database/script-tabelas.sql`

## Dicas para agentes/IA

- Mantenha a linguagem em português do Brasil nos textos de interface.
- Preserve o padrão de HTML/JS vanilla em vez de introduzir framework sem necessidade.
- Antes de mexer em autenticação, verifique o fluxo de `sessionStorage` e o endpoint `/usuarios/autenticar`.
- Ao alterar o banco, consulte `script-tabelas.sql` e os models correspondentes.
- Se for preciso rodar o app, sempre verifique primeiro as variáveis de ambiente e o arquivo `.env`/`.env.dev`.

## Resumo executivo

O projeto é um site de jogo diário de xadrez com login, cadastro, dashboard e API Express conectada a MySQL. A parte principal do jogo está em `public/js/chessdle.js`, enquanto a aplicação web em si é servida via `app.js` e páginas estáticas em `public/`.
