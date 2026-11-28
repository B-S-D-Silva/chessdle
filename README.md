# Entre lances

Site pessoal em primeira pessoa sobre xadrez. Home pública com introdução ao jogo, história pessoal e ranking de favoritos; quiz de múltipla escolha disponível após login.

A identidade visual mistura recortes de jornal e álbum caseiro: papéis em tons creme, vermelho desbotado e verde antigo, fitas, molduras de fotos, títulos recortados e anotações manuscritas. O tema é compartilhado por todas as páginas em `public/css/site.css`; usa somente fontes do sistema e efeitos em CSS.

## Executar

Requer Node.js 20+ e MySQL.

1. Execute `npm install`.
2. Configure `.env.dev` (desenvolvimento) ou `.env` (produção) com `APP_PORT`, `APP_HOST`, `AMBIENTE_PROCESSO`, `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` e `DB_PORT`. Não publique credenciais.
3. Para um banco novo, execute `src/database/script-tabelas.sql`. Ele cria o banco e a tabela sem apagar dados. Se escolher outro nome de banco, ajuste o SQL e `DB_DATABASE`.
4. Execute `npm start` ou `npm run dev`. O endereço é mostrado no terminal.

O ambiente padrão é desenvolvimento (`.env.dev`). Para produção, defina `AMBIENTE_PROCESSO=producao` no processo antes de iniciar. Produção requer HTTPS, porque o cookie de sessão usa `Secure`.

## Estrutura

- `public/index.html`: introdução ao xadrez e chamadas para as páginas pessoais.
- `public/historia.html`, `public/css/historia.css`: história com três capítulos, fotos e trilha decorativa em SVG, sem JavaScript.
- `public/ranking.html`: página independente de favoritos com os cinco retratos.
- `public/assets/jogadores/`: fotos locais da Wikimedia Commons; autor, fonte e licença aparecem em cada cartão.
- `public/js/site.js`: estado da conta e botão Sair.
- `public/login.html`, `public/cadastro.html`, `public/js/autenticacao.js`: formulários.
- `public/quiz.html`, `public/js/questoes.js`, `public/js/quiz.js`: perguntas, renderização e correção.
- `public/dashboard.html`, `public/js/dashboard.js`, `public/css/dashboard.css`: indicadores e gráfico dos quizzes salvos.
- `src/routes/quiz.js`, `src/controllers/quizController.js`, `src/models/quizModel.js`, `src/services/quiz.js`: API, correção e persistência dos resultados.
- `public/css/site.css`: identidade visual compartilhada e responsiva.
- `src/routes/usuarios.js`, `src/controllers/usuarioController.js`, `src/models/usuarioModel.js`: API de contas.
- `src/services/senha.js`, `src/middleware/sessao.js`: hash e sessão.
- `src/database/`: conexão e SQL mínimo.

## Personalizar

Os relatos em `historia.html` foram redigidos com base nas memórias fornecidas pelo autor: o pai que aprendeu xadrez para ensiná-lo, os encontros com amigos e família e a retomada do jogo após um término. Edite os textos diretamente nos três capítulos; não são usadas datas inventadas. A home só apresenta uma chamada para a história completa. O nome editorial “Entre lances” também pode ser trocado nos HTMLs.

A história usa uma trilha em SVG e fotos locais em `public/assets/memorias/`. Para preencher a moldura restante, substitua o `div.espaco-foto` em `public/historia.html` por uma imagem com a classe `foto-memoria` e um texto alternativo.

O ranking e os créditos estão diretamente nos blocos article de `ranking.html`. Edite a ordem, nome, país, motivo, feito e foto no próprio HTML.

A lista inclui Bobby Fischer (1º), Judit Polgár, Mikhail Tal, Magnus Carlsen e Hikaru Nakamura. Preserve os créditos ao trocar imagens.

A frase na história usa tradução livre e a indicação “atribuída a Paul Morphy”: o [Marshall Chess Club](https://themarshallspectator.substack.com/p/5767081_marshall-spectator-4-6-2022) reproduz essa atribuição, mas não foi localizada uma fonte primária que confirme a autoria. A própria seção inclui os links de referência.

O array `questoes` em `questoes.js` contém enunciado, alternativas, índice da resposta correta (começa em zero) e explicação. Laços `for` renderizam as perguntas e mostram a correção. A mesma lista é usada no servidor para calcular a nota e salvar o resultado. O quiz é educativo: as respostas estão no código entregue ao navegador. Não existe ranking entre visitantes; cada conta acessa somente seu histórico.

O front-end usa funções nomeadas, listas, for e if/else. Os campos são lidos por querySelector(...).value, sem getElementById ou FormData. As chamadas à API usam fetch e then nativos, com funções tradicionais. Não há bibliotecas, animações, observers, arrow functions ou async/await no JavaScript do site. O backend e sua autenticação foram preservados.

As variáveis do front-end usam let e os textos dinâmicos usam interpolação com template literals. O código do front-end não contém comentários. innerHTML monta o quiz e suas mensagens fixas; textContent mantém nomes e respostas da API como texto. Os avisos de login/cadastro e do quiz são exibidos em divs com role de status.

Referência para as regras: [Leis do Xadrez da FIDE](https://handbook.fide.com/chapter/E012023).

## Dashboard do quiz

Depois de responder, use **Ver meu desempenho** ou o link **Dashboard** no cabeçalho. A gravação precisa ser confirmada antes de o quiz mostrar o resultado como salvo. Se houver falha, as alternativas permanecem na tela para repetir o envio.

- **Quizzes concluídos:** total de tentativas salvas.
- **Média de acertos:** média dos percentuais de todas as tentativas.
- **Melhor resultado:** maior percentual registrado.
- **Última evolução:** percentual da última tentativa menos o da anterior, em pontos percentuais. Só aparece com duas ou mais tentativas.
- **Gráfico:** últimas dez tentativas em ordem cronológica; tabela correspondente em ordem inversa.
- **Revisão:** até três perguntas com maior proporção de erros em todo o histórico.

Sem tentativas, a página mostra um convite para responder, sem gráfico fictício. Os horários são exibidos em America/Sao_Paulo.

As tabelas são quiz_tentativa (usuário, chave única de envio, versão do quiz, acertos, total e horário UTC) e quiz_resposta (tentativa, ordem, enunciado, alternativa escolhida, alternativa correta e acerto). Os textos são preservados como registro histórico; não há tabela de perguntas nem de alternativas.

`POST /quiz/resultados` recebe `{ chaveTentativa: "1800000000000-123", respostas: [1, 2, 0, 1, 2, 0, 1, 2] }`. A API ignora notas ou IDs de usuário enviados pelo navegador: corrige as alternativas e usa a sessão. Uma restrição única por usuário/chave evita duplicar o mesmo envio. Reutilizar a chave com outras respostas retorna 409.

`GET /quiz/dashboard` retorna `{ resumo: { tentativas, mediaAcertos, melhorResultado, evolucao }, recentes: [...], revisao: [...] }`. Todos os dados são filtrados pelo usuário autenticado. O gráfico é SVG nativo, com valores também disponíveis em tabela.

## Autenticação

- `POST /usuarios/cadastrar`: `nomeServer`, `emailServer`, `senhaServer`.
- `POST /usuarios/autenticar`: `emailServer`, `senhaServer`.
- `GET /usuarios/sessao`: dados públicos da sessão ou 401.
- `POST /usuarios/sair`: encerra a sessão e limpa o cookie.
- As páginas e perguntas são arquivos estáticos em public. O navegador encaminha ao login quando a sessão expira. As rotas de resultados e dados do dashboard validam a sessão no servidor.

As senhas novas usam scrypt com sal aleatório (módulo nativo do Node). Senhas antigas em texto puro são aceitas e substituídas por hash após login válido, sem apagar contas. Nome, e-mail e senha são validados no servidor; o e-mail tem restrição de unicidade e o SQL usa parâmetros.

A sessão usa token aleatório em cookie HTTP-only, SameSite=Lax, com prazo de oito horas. O servidor guarda apenas o hash do token e os dados públicos do usuário em memória. Reiniciar o processo encerra todas as sessões; esta solução é destinada a uma única instância. Não usa sessionStorage como prova de identidade. Requisições de escrita com origem externa são recusadas.

## Verificar


Para validar o MySQL do seu ambiente, cadastre uma conta, teste e-mail duplicado, login incorreto e correto, abra o quiz, envie respostas, confira as explicações, reinicie o quiz e saia. Depois do logout, o endereço direto do quiz deve redirecionar para o login.
