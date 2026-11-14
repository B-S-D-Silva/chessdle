# AGENTS.md

## Contexto atual
Entre lances é um site pessoal de xadrez em português do Brasil. Usa Node.js/Express, HTML/CSS/JavaScript vanilla e MySQL. A home é pública; o quiz exige sessão validada no servidor.

## Estrutura
- `app.js`: configuração do Express e proteção do quiz antes dos arquivos estáticos.
- `public/index.html`: básico do xadrez, história pessoal de exemplo e chamada para o ranking.
- `public/ranking.html`: ranking público de favoritos com fotos locais e créditos.
- `public/assets/jogadores/`: retratos licenciados da Wikimedia Commons.
- `public/login.html`, `public/cadastro.html`, `public/quiz.html`: páginas.
- `public/css/site.css`: todos os estilos, inclusive responsividade.
- `public/js/site.js`: favoritos, créditos das fotos e navegação da conta.
- `public/js/autenticacao.js`: cadastro e login.
- `public/js/questoes.js`: lista com enunciado, alternativas, respostaCorreta e explicacao.
- `public/js/quiz.js`: exibição e correção usando laços for.
- `src/routes/usuarios.js`, `src/controllers/usuarioController.js`, `src/models/usuarioModel.js`: API.
- `src/middleware/sessao.js`: cookie HTTP-only e sessão em memória por oito horas.
- `src/services/senha.js`: scrypt e conversão de senhas legadas.
- `src/database/config.js`: consultas parametrizadas.
- `src/database/script-tabelas.sql`: banco mínimo com usuario (id, nome, email, senha).
- `src/database/migracao-site-pessoal.sql`: remove dados antigos preservando contas.

## Convenções
Mantenha HTML/CSS/JS vanilla, textos em português e SQL com placeholders. Textos pessoais e ranking são exemplos personalizáveis, não dados biográficos confirmados. Não reintroduza perfil, dashboard, streak, conquistas ou desafios diários.

## Ambiente e execução
Antes de iniciar, verifique a presença das variáveis em .env.dev/.env sem expor credenciais. O processo usa .env.dev por padrão; AMBIENTE_PROCESSO=producao seleciona .env. Variáveis: APP_PORT, APP_HOST, AMBIENTE_PROCESSO, DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD e DB_PORT.
Comandos: npm install, npm start, npm run dev, npm test.
Produção requer HTTPS. Sessões em memória são reiniciadas com o servidor.

## Manutenção
- A autenticação depende do cookie e da validação no servidor; sessionStorage não comprova identidade.
- Somente usuario deve permanecer no banco simplificado. O quiz não persiste progresso.
- Nunca execute a migração destrutiva automaticamente. Ela apaga dados de partidas, conquistas e desafios; faça backup e confira o banco alvo.
- Registre em `diarios de prompt.md` todo prompt enviado pelo usuário. Revise a redação quando necessário sem alterar a intenção.
- Preserve alterações preexistentes não relacionadas à tarefa.
