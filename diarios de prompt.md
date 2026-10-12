# Diários de prompt

Prompts do projeto registrados em português revisado, preservando a intenção original.

## 2026-10-12

1. Criar um arquivo `AGENTS.md` com o contexto do projeto e as informações já compartilhadas.
2. Ao concluir o Chessdle, gerar e exibir um gráfico para a pessoa usuária, adaptando a estrutura da pasta `dashboard`.
3. Confirmar se o gráfico usa Chart.js e, caso não use, refazê-lo com essa biblioteca.
4. Investigar por que as informações de host, porta e ambiente aparecem como `undefined` ao iniciar o servidor e corrigir a configuração.
5. Atualizar o banco para que seus dados façam sentido para o Chessdle, persistir os resultados das partidas e usar esses dados para gerar o gráfico.
6. Simplificar a modelagem do banco, removendo as tabelas existentes e aceitando a perda dos dados por se tratar do ambiente de desenvolvimento.
7. Fazer com que os títulos, descrições, perguntas, respostas, opções, dicas, jogadores e aberturas do Chessdle sejam carregados do banco de dados.
8. Investigar e corrigir o erro de chave estrangeira ao persistir uma partida associada ao usuário de ID `1`.
9. Destacar a dica do jogo em um card mais evidente para facilitar a leitura.
10. Adicionar uma aba **Perfil** onde a pessoa possa informar uma descrição e seu rating no Chess.com, seguida do histórico das próprias partidas. Criar este diário e atualizar o `AGENTS.md` para registrar todos os prompts enviados ao assistente; quando necessário, revisar a redação sem alterar a intenção e registrar a versão revisada.
11. Mover o acesso ao perfil para o nome de usuário exibido no canto superior direito (por exemplo, “Olá, Bruno”) e apresentar o perfil em um arquivo HTML separado, em vez de como uma aba dentro da página do jogo.
12. Criar um botão para que a pessoa usuária possa sair da conta.
