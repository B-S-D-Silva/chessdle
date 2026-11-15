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

## 2026-10-15

16. Adicionar uma página de dashboard de desempenho do Chessdle com Chart.js v4, resumo, série temporal, distribuição de tentativas, desempenho por modo e calendário de atividade; criar o endpoint agregado `GET /estatisticas` em routes/controllers/models, integrar a página à navegação, exigir login conforme o padrão existente, manter acessibilidade e responsividade, criar dados demonstrativos SQL e documentar a API, a demonstração e a relação com a origem Web Data Viz sem alterar os desafios, o limite de tentativas nem os fluxos de login/cadastro.
17. Adicionar dez conquistas persistentes ao Chessdle, com catálogo extensível, migração e atualização do schema inicial, desbloqueio retroativo e automático ao salvar partidas, consulta `GET /conquistas`, cartões acessíveis em SVG na página de perfil já existente, resumo do jogador e toast sequencial no jogo; manter a descrição, o rating, o histórico, o cabeçalho, a sequência, as regras dos desafios e a autenticação atuais, documentar a API e como testar/desbloquear uma conquista.
18. Permitir cadastrar várias citações de xadrez no banco e selecionar uma automaticamente por dia, mantendo a citação do dia estável mesmo quando novas forem adicionadas; criar migração para bancos existentes, atualizar o schema inicial e documentar como cadastrar citações com autor e duas pistas.
19. Adicionar uma célula de continente às comparações dos palpites nos modos Jogador e Citação, com uma divisão geográfica intuitiva; persistir o continente dos enxadristas e migrar os dados existentes.
20. Melhorar o seletor de respostas com uma lista personalizada, busca instantânea, opções ordenadas alfabeticamente, rolagem limitada, navegação por teclado e layout responsivo, mantendo a lista dinâmica da API e permitindo digitação manual.
21. Ao clicar em “Enviar” no último desafio, aguardar cinco segundos antes de sair da tela do jogo e exibir o gráfico de resultados.
22. Limitar o histórico do perfil a dez partidas por vez e adicionar um botão para carregar mais dez partidas.
23. Exigir autenticação para jogar no Chessdle e encaminhar diretamente ao login quem tentar acessar os desafios sem entrar na conta.

## 2026-11-14

24. Ler os arquivos Markdown e o código do projeto e criar uma home sobre a história do xadrez em formato de narrativa pessoal.
25. Planejar, antes de alterar arquivos, uma refatoração completa do Chessdle para um site pessoal em primeira pessoa: introdução ao xadrez, minha história com textos de exemplo, ranking de jogadores favoritos e quiz. Manter apenas banco e autenticação essenciais; mover questões, alternativas e respostas para uma lista no código e usar laços for para exibir e corrigir. Remover perfil, sequência, progresso, tabelas e código sem uso. Redesenhar home, login e cadastro com identidade autoral inspirada no xadrez, CSS simples e layout responsivo. Mostrar o plano de remoções, alterações, criações e tabelas antes de implementar; aguardar aprovação e assumir a opção mais simples em ambiguidades, informando as escolhas.
26. Aprovar o plano apresentado e autorizar sua implementação, com home pública, quiz protegido por login e somente a tabela usuario no banco.
27. Investigar e corrigir o erro de JSON exibido no cadastro quando o servidor retorna uma mensagem em texto: Unexpected token 'N', "Não foi po"... is not valid JSON.
28. Investigar e corrigir a mensagem do quiz: “Não foi possível verificar sua sessão. Tente novamente.”
29. Resolver o erro EADDRINUSE na porta 8080 ao executar npm start, causado por uma instância do servidor já em execução.
30. Mover o ranking de favoritos para uma página separada, incluir fotos de todos, substituir Garry Kasparov por Hikaru Nakamura e adicionar à minha história a frase sobre saber jogar xadrez ser sinal de um cavalheiro e jogar bem ser sinal de uma vida desperdiçada, pesquisando sua referência e indicando a atribuição adequada.
31. Substituir Capablanca por Bobby Fischer no ranking e colocar Fischer em primeiro lugar, atualizando também a foto, os créditos e o texto correspondente.
32. Criar uma página separada “Minha história” em formato de linha do tempo, como uma trilha percorrida ao rolar. Começar pela infância, quando meu pai aprendeu xadrez só para me ensinar porque eu tinha um tabuleiro de damas. Depois, explicar o significado do jogo, abrindo com a frase atribuída a Paul Morphy e brincando que amo minha vida porque não a desperdicei, já que não jogo tão bem. Destacar as conversas e o tempo significativo com amigos e família. Encerrar com meu reencontro com o amor pelo xadrez após o fim de um relacionamento, quando voltei a olhar para mim, retomar meus interesses e me descobrir, melhorando a redação.
33. Tornar a trilha de “Minha história” literal e visível, como um caminho contínuo ligando as etapas, e criar espaços para fotos pessoais e de momentos, com uma aparência caseira de álbum de lembranças.
34. Redesenhar a identidade visual de todo o site com inspiração em recortes de jornal e álbuns de lembranças, trazendo uma estética nostálgica, caseira, menos clássica e mais informal para todas as páginas.
35. Refatorar e simplificar o site: organizar todos os HTMLs com a estrutura padrão do Emmet (!), tags indentadas e espaços entre seções; simplificar e formatar o CSS com propriedades em linhas separadas; simplificar muito o JavaScript do front-end, priorizando listas, for, while e if/else, sem bibliotecas externas ou getElementById, lendo campos com .value. Preservar a API Web Data Viz/backend.
36. Usar interpolação em vez de concatenar strings, substituir var por let e retirar os comentários do front-end. Explicar se querySelector é necessário e se textContent pode ser substituído por innerHTML para exibir conteúdo em uma div.

## 2026-11-15

37. Criar um dashboard com base nos resultados do preenchimento do quiz, incluindo KPIs interessantes, um gráfico e persistência no banco, com criação das tabelas necessárias.
38. Informar que executará a migração das tabelas no MySQL Workbench.
39. Interromper temporariamente o trabalho.
40. Informar que as tabelas foram criadas e retomar a verificação e conclusão do dashboard.
41. Recuperar a aparência anterior de “Minha história”, com a trilha mais curvada, e explicar como ela funciona.
