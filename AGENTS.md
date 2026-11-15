# AGENTS.md

## Contexto atual
Entre lances é um site pessoal de xadrez em português do Brasil. Usa Node.js/Express, HTML/CSS/JavaScript vanilla e MySQL. A home é pública; o quiz exige sessão validada no servidor.

## Estrutura
- `app.js`: configuração do Express e proteção do quiz antes dos arquivos estáticos.
- `public/index.html`: básico do xadrez e chamadas para a história e o ranking.
- `public/historia.html`, `public/css/historia.css`: história pessoal em uma trilha vertical de três capítulos, sem JavaScript. Infância com o pai, significado afetivo do jogo e reencontro após um término são relatos fornecidos pelo usuário; não invente datas ou eventos.
- `public/ranking.html`: ranking público de favoritos com fotos locais e créditos.
- `public/assets/jogadores/`: retratos licenciados da Wikimedia Commons.
- `public/assets/memorias/`: fotos pessoais da história. Cinco molduras em historia.html usam placeholders até o autor inserir imagens; LEIA-ME.md explica a troca. A trilha é um SVG decorativo estático ao lado dos capítulos; mantenha as fotos no celular e não invente retratos pessoais.
- `public/login.html`, `public/cadastro.html`, `public/quiz.html`: páginas.
- `public/dashboard.html`, `public/js/dashboard.js`, `public/css/dashboard.css`: dashboard autenticado com KPIs, gráfico SVG, revisão e histórico.
- `public/css/site.css`: todos os estilos, inclusive responsividade.
- `public/js/site.js`: somente navegação da conta; favoritos e créditos estão diretamente em ranking.html.
- `public/js/autenticacao.js`: cadastro e login.
- `public/js/questoes.js`: lista com enunciado, alternativas, respostaCorreta e explicacao.
- `public/js/quiz.js`: exibição e correção usando laços for.
- `src/routes/usuarios.js`, `src/controllers/usuarioController.js`, `src/models/usuarioModel.js`: API.
- `src/routes/quiz.js`, `src/controllers/quizController.js`, `src/models/quizModel.js`: gravação transacional do quiz e agregação dos resultados por sessão.
- `src/services/quiz.js`: correção no servidor usando a mesma lista de perguntas do front-end.
- `src/middleware/sessao.js`: cookie HTTP-only e sessão em memória por oito horas.
- `src/services/senha.js`: scrypt e conversão de senhas legadas.
- `src/database/config.js`: consultas parametrizadas.
- `src/database/script-tabelas.sql`: schema com usuario, quiz_tentativa e quiz_resposta.
- `src/database/migracao-dashboard-quiz.sql`: cria somente as duas tabelas do quiz, sem apagar dados.
- `src/database/migracao-site-pessoal.sql`: remove dados antigos preservando contas.

## Convenções
Priorize código didático: HTML indentado, CSS com uma propriedade por linha e espaços entre blocos. No JavaScript do front-end, use listas, for, while e if/else; funções nomeadas e fetch nativo atendem aos eventos e à API. Leia campos com querySelector(...).value. Não use getElementById, bibliotecas externas, arrow functions, map, filter, forEach, async/await nem observers. Use textContent para exibir texto; value é para campos de formulário.
Use let em vez de var, interpolação com template literals em vez de concatenar strings e não inclua comentários no código do front-end. innerHTML pode ser usado para marcação e textos fixos do quiz; nomes de usuários e mensagens vindas da API continuam com textContent. querySelector e querySelectorAll localizam os elementos explicitamente.
Identidade visual: caderno de recortes nostálgico, com papel creme, vermelho desbotado, verde antigo, fitas, polaroides e tipografia de máquina de escrever/manuscrita. O tema compartilhado fica em site.css; historia.css complementa a trilha. Use fontes locais do sistema e CSS, sem bibliotecas ou fontes externas.
Mantenha HTML/CSS/JS vanilla, textos em português e SQL com placeholders. A história usa fatos fornecidos pelo usuário com redação autoral; os motivos do ranking ainda são exemplos personalizáveis. O dashboard do quiz foi solicitado posteriormente; não reintroduza perfil, streak, conquistas ou desafios diários.

## Ambiente e execução
Antes de iniciar, verifique a presença das variáveis em .env.dev/.env sem expor credenciais. O processo usa .env.dev por padrão; AMBIENTE_PROCESSO=producao seleciona .env. Variáveis: APP_PORT, APP_HOST, AMBIENTE_PROCESSO, DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD e DB_PORT.
Comandos: npm install, npm start, npm run dev, npm test.
Produção requer HTTPS. Sessões em memória são reiniciadas com o servidor.

## Manutenção
- A autenticação depende do cookie e da validação no servidor; sessionStorage não comprova identidade.
- O banco usa usuario, quiz_tentativa e quiz_resposta. As perguntas continuam no código; as tabelas registram apenas tentativas e respostas, com textos históricos.
- O quiz envia alternativas e chaveTentativa para POST /quiz/resultados; o servidor calcula a nota, usa o usuário da sessão e salva em uma transação. Repetir o mesmo envio não duplica a tentativa. GET /quiz/dashboard retorna indicadores de toda a conta e as últimas dez tentativas.
- O gráfico usa SVG nativo sem biblioteca. Datas são gravadas em UTC e exibidas em America/Sao_Paulo.
- npm test usa dados simulados; TESTE_MYSQL=1 habilita test/mysql.test.js, que valida a integração real e desfaz todos os dados de teste com rollback.
- Nunca execute a migração destrutiva automaticamente. Ela apaga dados de partidas, conquistas e desafios; faça backup e confira o banco alvo.
- Registre em `diarios de prompt.md` todo prompt enviado pelo usuário. Revise a redação quando necessário sem alterar a intenção.
- Preserve alterações preexistentes não relacionadas à tarefa.
