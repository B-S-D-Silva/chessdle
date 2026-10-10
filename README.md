<p align="center">
  <img src="public/assets/chessdle-logo.svg" alt="Logo Chessdle" width="320">
</p>

<h1 align="center">Chessdle</h1>

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

A API ainda contém nomes e recursos herdados da aplicação Web Data Viz, como empresas, aquários, avisos e medidas. Esses elementos fazem parte da base adaptada e não representam modos de jogo do Chessdle. Os desafios apresentados na página principal são implementados no JavaScript do front-end; eles ainda não são servidos nem salvos como partidas pela API.

## Como executar

1. Instale o [Node.js](https://nodejs.org/) e o MySQL.
2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Configure as credenciais de conexão com o banco no arquivo `.env.dev` para desenvolvimento ou `.env` para produção. Não publique esses arquivos nem compartilhe suas credenciais.
4. Configure o ambiente usado pelo servidor em `app.js`.
5. Prepare o banco de dados e as tabelas necessárias. O arquivo `src/database/script-tabelas.sql` serve como referência inicial; confira se o schema corresponde às consultas e relacionamentos usados atualmente pelo projeto.
6. Inicie o servidor:

   ```bash
   npm start
   ```

7. Abra no navegador o endereço exibido no terminal, normalmente `http://localhost:8080`.

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
