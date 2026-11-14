# Entre lances

Site pessoal em primeira pessoa sobre xadrez. Home pública com introdução ao jogo, história pessoal e ranking de favoritos; quiz de múltipla escolha disponível após login.

A identidade visual mistura recortes de jornal e álbum caseiro: papéis em tons creme, vermelho desbotado e verde antigo, fitas, molduras de fotos, títulos recortados e anotações manuscritas. O tema é compartilhado por todas as páginas em `public/css/site.css`; usa somente fontes do sistema e efeitos em CSS.

## Executar

Requer Node.js 20+ e MySQL.

1. Execute `npm install`.
2. Configure `.env.dev` (desenvolvimento) ou `.env` (produção) com `APP_PORT`, `APP_HOST`, `AMBIENTE_PROCESSO`, `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` e `DB_PORT`. Não publique credenciais.
3. Para um banco novo, execute `src/database/script-tabelas.sql`. Ele cria o banco e a tabela sem apagar dados. Se escolher outro nome de banco, ajuste o SQL e `DB_DATABASE`.
4. Para o banco Chessdle anterior, faça backup e aplique manualmente `src/database/migracao-site-pessoal.sql`. Ela preserva as contas e remove os dados e campos das funcionalidades antigas. O schema mínimo sozinho não remove as tabelas antigas.
5. Execute `npm start` ou `npm run dev`. O endereço é mostrado no terminal.

O ambiente padrão é desenvolvimento (`.env.dev`). Para produção, defina `AMBIENTE_PROCESSO=producao` no processo antes de iniciar. Produção requer HTTPS, porque o cookie de sessão usa `Secure`.

## Estrutura

- `public/index.html`: introdução ao xadrez e chamadas para as páginas pessoais.
- `public/historia.html`, `public/css/historia.css`: história com três capítulos, fotos e trilha decorativa em SVG, sem JavaScript.
- `public/ranking.html`: página independente de favoritos com os cinco retratos.
- `public/assets/jogadores/`: fotos locais da Wikimedia Commons; autor, fonte e licença aparecem em cada cartão.
- `public/js/site.js`: estado da conta e botão Sair.
- `public/login.html`, `public/cadastro.html`, `public/js/autenticacao.js`: formulários.
- `public/quiz.html`, `public/js/questoes.js`, `public/js/quiz.js`: perguntas, renderização e correção.
- `public/css/site.css`: identidade visual compartilhada e responsiva.
- `src/routes/usuarios.js`, `src/controllers/usuarioController.js`, `src/models/usuarioModel.js`: API de contas.
- `src/services/senha.js`, `src/middleware/sessao.js`: hash e sessão.
- `src/database/`: conexão e SQL mínimo.
- `test/`: testes executados com `npm test`.

## Personalizar

Os relatos em `historia.html` foram redigidos com base nas memórias fornecidas pelo autor: o pai que aprendeu xadrez para ensiná-lo, os encontros com amigos e família e a retomada do jogo após um término. Edite os textos diretamente nos três capítulos; não são usadas datas inventadas. A home só apresenta uma chamada para a história completa. O nome editorial “Entre lances” também pode ser trocado nos HTMLs.

A história tem uma trilha decorativa em SVG e cinco espaços de foto em estilo de álbum caseiro. Para colocar suas fotos, salve os arquivos em `public/assets/memorias/` e substitua o `div.espaco-foto` de cada moldura por `<img class="foto-memoria" src="/assets/memorias/sua-foto.jpg" alt="Descrição da lembrança">`. Preserve o `figure` e personalize o `figcaption`. Há exemplos em `public/assets/memorias/LEIA-ME.md`. Os espaços continuam visíveis no celular; não existe upload nem armazenamento no navegador.

O ranking e os créditos estão diretamente nos blocos article de `ranking.html`. Edite a ordem, nome, país, motivo, feito e foto no próprio HTML.

A lista inclui Bobby Fischer (1º), Judit Polgár, Mikhail Tal, Magnus Carlsen e Hikaru Nakamura. Preserve os créditos ao trocar imagens.

A frase na história usa tradução livre e a indicação “atribuída a Paul Morphy”: o [Marshall Chess Club](https://themarshallspectator.substack.com/p/5767081_marshall-spectator-4-6-2022) reproduz essa atribuição, mas não foi localizada uma fonte primária que confirme a autoria. A própria seção inclui os links de referência.

O array `questoes` em `questoes.js` contém enunciado, alternativas, índice da resposta correta (começa em zero) e explicação. Laços `for` renderizam as perguntas e fazem a correção. O quiz é educativo: as respostas estão no código entregue ao navegador. Não há histórico, ranking de visitantes ou resultado gravado no banco.

O front-end usa funções nomeadas, listas, for e if/else. Os campos são lidos por querySelector(...).value, sem getElementById ou FormData. As chamadas à API usam fetch e then nativos, com funções tradicionais. Não há bibliotecas, animações, observers, arrow functions ou async/await no JavaScript do site. O backend e sua autenticação foram preservados.

As variáveis do front-end usam let e os textos dinâmicos usam interpolação com template literals. O código do front-end não contém comentários. innerHTML monta o quiz e suas mensagens fixas; textContent mantém nomes e respostas da API como texto. Os avisos de login/cadastro e do quiz são exibidos em divs com role de status.

Referência para as regras: [Leis do Xadrez da FIDE](https://handbook.fide.com/chapter/E012023).

## Autenticação

- `POST /usuarios/cadastrar`: `nomeServer`, `emailServer`, `senhaServer`.
- `POST /usuarios/autenticar`: `emailServer`, `senhaServer`.
- `GET /usuarios/sessao`: dados públicos da sessão ou 401.
- `POST /usuarios/sair`: encerra a sessão e limpa o cookie.
- `GET /quiz.html` e `GET /js/questoes.js`: protegidos pelo servidor.

As senhas novas usam scrypt com sal aleatório (módulo nativo do Node). Senhas antigas em texto puro são aceitas e substituídas por hash após login válido, sem apagar contas. Nome, e-mail e senha são validados no servidor; o e-mail tem restrição de unicidade e o SQL usa parâmetros.

A sessão usa token aleatório em cookie HTTP-only, SameSite=Lax, com prazo de oito horas. O servidor guarda apenas o hash do token e os dados públicos do usuário em memória. Reiniciar o processo encerra todas as sessões; esta solução é destinada a uma única instância. Não usa sessionStorage como prova de identidade. Requisições de escrita com origem externa são recusadas.

## Verificar

`npm test` verifica autenticação por HTTP com model simulado, hash, migração de senha legada, logout e proteção do quiz. Não altera o banco real. A correção, as explicações e o reinício do quiz também foram verificados no navegador com uma conta simulada em memória.

Para validar o MySQL do seu ambiente, cadastre uma conta, teste e-mail duplicado, login incorreto e correto, abra o quiz, envie respostas, confira as explicações, reinicie o quiz e saia. Depois do logout, o endereço direto do quiz deve redirecionar para o login.

A migração SQL não é executada ao iniciar o site. As tabelas legadas de aquários/empresas/avisos/medidas não constam no schema Chessdle fornecido; seus arquivos foram removidos do código. Se estiverem em outro banco histórico, revise as dependências desse banco antes de descartá-las.
