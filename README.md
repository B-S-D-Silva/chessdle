# Entre lances

Site pessoal em primeira pessoa sobre xadrez. Home pública com introdução ao jogo, história pessoal e ranking de favoritos; quiz de múltipla escolha disponível após login.

## Executar

Requer Node.js 20+ e MySQL.

1. Execute `npm install`.
2. Configure `.env.dev` (desenvolvimento) ou `.env` (produção) com `APP_PORT`, `APP_HOST`, `AMBIENTE_PROCESSO`, `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` e `DB_PORT`. Não publique credenciais.
3. Para um banco novo, execute `src/database/script-tabelas.sql`. Ele cria o banco e a tabela sem apagar dados. Se escolher outro nome de banco, ajuste o SQL e `DB_DATABASE`.
4. Para o banco Chessdle anterior, faça backup e aplique manualmente `src/database/migracao-site-pessoal.sql`. Ela preserva as contas e remove os dados e campos das funcionalidades antigas. O schema mínimo sozinho não remove as tabelas antigas.
5. Execute `npm start` ou `npm run dev`. O endereço é mostrado no terminal.

O ambiente padrão é desenvolvimento (`.env.dev`). Para produção, defina `AMBIENTE_PROCESSO=producao` no processo antes de iniciar. Produção requer HTTPS, porque o cookie de sessão usa `Secure`.

## Estrutura

- `public/index.html`: introdução ao xadrez, textos pessoais e citação atribuída a Paul Morphy com referência.
- `public/ranking.html`: página independente de favoritos com os cinco retratos.
- `public/assets/jogadores/`: fotos locais da Wikimedia Commons; autor, fonte e licença aparecem em cada cartão.
- `public/js/site.js`: lista de jogadores favoritos e estado da conta.
- `public/login.html`, `public/cadastro.html`, `public/js/autenticacao.js`: formulários.
- `public/quiz.html`, `public/js/questoes.js`, `public/js/quiz.js`: perguntas, renderização e correção.
- `public/css/site.css`: identidade visual compartilhada e responsiva.
- `src/routes/usuarios.js`, `src/controllers/usuarioController.js`, `src/models/usuarioModel.js`: API de contas.
- `src/services/senha.js`, `src/middleware/sessao.js`: hash e sessão.
- `src/database/`: conexão e SQL mínimo.
- `test/`: testes executados com `npm test`.

## Personalizar

Os relatos em `index.html` estão marcados como exemplos. Substitua os três parágrafos da seção Minha história e a frase em destaque pelas suas memórias. O nome editorial “Entre lances” também pode ser trocado nos HTMLs.

O array `favoritos` em `site.js` contém um ranking ilustrativo. Edite a ordem, nome, país, motivo e feito marcante.

O array `fotosFavoritos` relaciona os cinco retratos, na mesma ordem, aos créditos e às licenças. A lista inclui Judit Polgár, José Raúl Capablanca, Mikhail Tal, Magnus Carlsen e Hikaru Nakamura. Preserve os créditos ao trocar imagens.

A frase na história usa tradução livre e a indicação “atribuída a Paul Morphy”: o [Marshall Chess Club](https://themarshallspectator.substack.com/p/5767081_marshall-spectator-4-6-2022) reproduz essa atribuição, mas não foi localizada uma fonte primária que confirme a autoria. A própria seção inclui os links de referência.

O array `questoes` em `questoes.js` contém enunciado, alternativas, índice da resposta correta (começa em zero) e explicação. Laços `for` renderizam as perguntas e fazem a correção. O quiz é educativo: as respostas estão no código entregue ao navegador. Não há histórico, ranking de visitantes ou resultado gravado no banco.

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
