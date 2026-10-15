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

## 2026-10-14

13. Atualizar a seção **SEUS PALPITES** do modo Abertura para comparar os lances em sequência, com cores de acerto, divergência e ausência de lance, além de exibir o tipo e o código ECO. Incluir linhas principais em notação algébrica em português para todas as aberturas cadastradas, selos com direção do ECO, destaque e animação da resposta correta, responsividade e rótulos acessíveis, sem alterar o formulário, as pistas, o limite de tentativas nem a lógica de vitória e derrota.
14. Investigar o erro `ER_BAD_FIELD_ERROR: Unknown column 'lances' in 'field list'` recebido ao carregar os desafios, identificar a migração necessária e orientar como aplicá-la ao banco usado pela aplicação.
15. Adicionar ao Chessdle uma sequência de dias consecutivos em que a pessoa conclui ao menos um dos três desafios diários, com melhor sequência, garantia/em risco, cálculo de datas em `America/Sao_Paulo`, persistência transacional, consulta `GET /streak`, migração com aproveitamento do histórico, indicador acessível e responsivo no cabeçalho, popover dos últimos sete dias e animação. Permitir a visualização da página por visitantes, sem alterar as regras dos desafios, o limite de tentativas nem login/cadastro, e documentar como migrar e testar.
