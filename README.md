<p align="center">
  <img src="public/assets/chessdle-logo.svg" alt="Logo Chessdle" width="320">
</p>

<h1 align="center"></h1>

<p align="center">
  Desafios de xadrez para testar seus conhecimentos, uma partida por vez.
</p>

## Sobre o projeto

O **Chessdle** é um projeto acadêmico individual desenvolvido para a matéria de **PI (Projeto e Inovação)**. A proposta é criar uma experiência inspirada em jogos de adivinhação diária, com uma interface visual baseada no Chess.com.

O projeto está em desenvolvimento. Atualmente, a página principal apresenta três modos:

- **Adivinhe o jogador:** descubra o enxadrista usando pistas.
- **Adivinhe a abertura:** identifique a abertura a partir dos lances apresentados.
- **Citação:** descubra qual enxadrista disse uma frase famosa.

A aplicação também conta com telas de cadastro e login. O nome da pessoa autenticada é exibido no cabeçalho da página inicial.

## Tecnologias

- HTML, CSS e JavaScript no front-end.
- Node.js e Express no servidor.
- MySQL para persistência e autenticação.

## Adaptação da API Web Data Viz

O projeto parte da estrutura da API Web Data Viz, utilizada como referência acadêmica, e adapta essa base para o Chessdle. A estrutura do servidor Express e a organização em **routes**, **controllers** e **models** foram aproveitadas como ponto de partida. As telas e a identidade visual foram modificadas para o tema de xadrez, e os fluxos de cadastro e autenticação foram conectados à interface do Chessdle.

A API ainda contém nomes e recursos herdados da aplicação Web Data Viz, como empresas, aquários, avisos e medidas. Esses elementos fazem parte da base adaptada e não representam modos de jogo do Chessdle. Os desafios da página principal são carregados pelo endpoint `/desafios`, as conclusões individuais atualizam a sequência por `POST /partidas/concluir`, e a partida completa continua sendo salva por `POST /partidas`. `GET /streak?usuarioId=<id>` retorna a sequência e os últimos sete dias.

### Estatísticas do Chessdle

O endpoint `GET /estatisticas?usuarioId=<id>&dias=30` agrega as partidas no MySQL e alimenta `public/dashboard.html` com Chart.js v4. `usuarioId` segue o padrão de identidade já usado pelo projeto; `dias` aceita `7`, `30`, `90` ou `todos` (padrão: `30`). A série, distribuição e desempenho por modo respeitam o período; atividade mostra aproximadamente 12 semanas. As datas usam o dia civil de `America/Sao_Paulo`.

Exemplo resumido de resposta:

```json
{
  "resumo": {
    "partidas": 12,
    "taxaAcerto": 72.22,
    "mediaTentativasVitorias": 2.46,
    "sequenciaAtual": 4,
    "maiorSequencia": 9
  },
  "serie": [
    {
      "data": "2026-10-14",
      "partidas": 1,
      "acertos": 2,
      "taxaAcerto": 66.67,
      "mediaTentativas": 2.5
    }
  ],
  "distribuicao": [
    { "tentativas": 1, "rotulo": "1 tentativa", "quantidade": 3 },
    { "tentativas": null, "rotulo": "Não acertou", "quantidade": 5 }
  ],
  "porModo": [
    {
      "modo": "jogador",
      "partidas": 12,
      "acertos": 9,
      "taxaAcerto": 75,
      "mediaTentativas": 2.4
    }
  ],
  "atividade": [
    { "data": "2026-10-14", "partidas": 1 }
  ]
}
```

O dashboard relaciona a origem acadêmica Web Data Viz com o Chessdle ao transformar os registros persistidos em visualizações de dados: as consultas agregam por data, modo e tentativas no backend, enquanto a página apresenta os resultados em gráficos e calendário de atividade.

## Como executar

1. Instale o [Node.js](https://nodejs.org/) e o MySQL.
2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Configure as credenciais de conexão com o banco no arquivo `.env.dev` para desenvolvimento ou `.env` para produção. Não publique esses arquivos nem compartilhe suas credenciais.
4. Configure o ambiente usado pelo servidor em `app.js`.
5. Prepare o banco de dados e as tabelas necessárias. Para criar o banco do zero, use `src/database/script-tabelas.sql` **somente em desenvolvimento**, pois o script apaga o banco `chessdle`. Em bancos existentes, execute `src/database/migracao-lances-abertura.sql` somente se as colunas `lances` e `eco` ainda não existirem; depois execute uma vez `src/database/migracao-streak.sql`. A migração de sequência requer MySQL 8.0+ e inicializa os valores com as datas históricas existentes em `partida` (a melhor estimativa disponível para partidas antigas).
6. Inicie o servidor:

   ```bash
   npm start
   ```

7. Abra no navegador o endereço exibido no terminal, normalmente `http://localhost:8080`.

### Demonstrar o dashboard

Crie uma conta de demonstração pelo fluxo normal de cadastro usando o e-mail `dashboard.demo@chessdle.local` e entre nela. Em um banco local/de teste, execute uma vez `src/database/seed-partidas-demo.sql` para inserir até seis semanas de partidas fictícias, com variação entre modos, acertos e tentativas, além de popular a sequência. O script não apaga partidas e ignora datas que já têm registros. Acesse **Estatísticas** na página inicial. Não use essa massa de dados em produção.

### Testar a sequência

Entre com uma conta, conclua qualquer um dos três modos e abra o indicador de chama no cabeçalho: o dia deve aparecer como garantido. Concluir outros modos na mesma data não adiciona outro dia. Para simular que a última conclusão foi ontem ou anteontem, ajuste a data da conta no MySQL e atualize a página:

```sql
-- Substitua as datas pelas datas atuais em America/Sao_Paulo.
-- Remova o marcador de hoje apenas no ambiente de teste.
DELETE FROM streak_dia
WHERE usuario_id = 1 AND data_conclusao = '2026-10-14';

-- Defina a última conclusão como ontem para testar o estado "em risco".
UPDATE usuario
SET streak_atual = 4, streak_maior = 8, streak_ultima_data = '2026-10-13'
WHERE id = 1;
```

Uma data de ontem deve exibir a sequência em risco; uma data anterior a ontem deve exibir sequência atual 0. Ao concluir um modo, a primeira condição incrementa a sequência e a segunda reinicia em 1. Os exemplos de datas precisam ser adaptados ao dia atual de Brasília.

O projeto mantém a identidade do usuário no `sessionStorage` e ainda não tem sessão ou token validado no servidor. Os endpoints de sequência seguem o padrão existente de receber `usuarioId`; isso atende à integração atual, mas não equivale a autenticação segura no backend.

## Estrutura principal

```text
public/
  assets/          Imagens e recursos estáticos
  css/             Estilos das páginas
  js/              Lógica do front-end
  index.html       Desafios do Chessdle
  login.html       Autenticação
  cadastro.html    Cadastro de usuário
src/
  controllers/     Lógica das rotas da API
  database/        Conexão e scripts do banco
  models/          Consultas e acesso a dados
  routes/          Endpoints da API
app.js             Configuração do servidor Express
```

## Próximos passos

- Alinhar o schema do banco com os recursos usados no cadastro e na autenticação.
- Adaptar ou remover os recursos restantes da API que pertencem ao projeto de referência.
- Evoluir os desafios de xadrez e integrar seu estado à API, caso necessário.

---

Projeto acadêmico individual para a matéria de PI.
