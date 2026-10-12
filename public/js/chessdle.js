// Modo atualmente aberto: 0 = jogador, 1 = abertura e 2 = citação.
var modo = 0;
// Número máximo de respostas que cada desafio aceita.
var maxTentativas = 6;
// Contadores separados para cada modo de jogo.
var tentativas = [0, 0, 0];
// Quantas pistas já foram reveladas em cada desafio.
var pistasUsadas = [0, 0, 0];
// Indica se o jogador já concluiu cada desafio.
var terminou = [false, false, false];
// Guarda as respostas enviadas em cada modo para montar o histórico visual.
var palpites = [[], [], []];
// Classe usada para apresentar o estado da mensagem de feedback.
var tipoMensagem = "";

// Textos dos desafios; os índices seguem a ordem das abas definidas no HTML.
var titulos = [
  "Adivinhe o jogador",
  "Adivinhe a abertura",
  "De quem é a citação?"
];
var descricoes = [
  "Descubra qual grande nome do xadrez está escondido.",
  "Reconheça a abertura pelos lances.",
  "Descubra quem disse esta frase."
];
var perguntas = [
  "Quem é o enxadrista misterioso?",
  "1. e4 e5  2. Nf3 Nc6  3. Bc4",
  "Quem disse esta frase?"
];
// Respostas dos modos de abertura e citação. A do jogador é selecionada
// diariamente a partir da lista jogadores.
var respostas = [
  "",
  "Abertura Italiana",
  "José Raúl Capablanca"
];
// Alternativas mostradas pelo datalist nos modos de abertura e citação.
// As alternativas do modo jogador vêm diretamente da lista jogadores.
var opcoes = [
  [],
  ["Abertura Italiana", "Defesa Siciliana", "Ruy López", "Gambito da Dama"],
  ["Bobby Fischer", "Garry Kasparov", "Magnus Carlsen", "José Raúl Capablanca"]
];
// Duas pistas disponíveis em cada modo, na ordem em que são reveladas.
var dicas = [
  ["É um grande mestre norueguês.", "Nasceu em 1990."],
  ["O bispo branco vai para c4.", "A abertura começa com 1. e4 e5."],
  ["Nasceu em Cuba.", "Foi campeão mundial entre 1921 e 1927."]
];
// Dados dos enxadristas: nome, primeira pista, ano de nascimento e país.
// O índice desta lista também é usado para escolher o jogador do dia.
var jogadores = [
  ["Magnus Carlsen", "É um grande mestre norueguês.", 1990, "Noruega"],
  ["Garry Kasparov", "Foi campeão mundial por quinze anos.", 1963, "Rússia"],
  ["Bobby Fischer", "Enfrentou Spassky no match de 1972.", 1943, "Estados Unidos"],
  ["Judit Polgár", "É considerada a maior enxadrista da história.", 1976, "Hungria"],
  ["Hikaru Nakamura", "É um dos maiores nomes do xadrez online.", 1987, "Estados Unidos"],
  ["José Raúl Capablanca", "Foi um grande enxadrista cubano.", 1888, "Cuba"],
  ["Viswanathan Anand", "Foi o primeiro campeão mundial indiano.", 1969, "Índia"],
  ["Fabiano Caruana", "Disputou o título mundial em 2018.", 1992, "Estados Unidos"]
];
// Dados usados para comparar cada palpite de abertura com a resposta:
// nome, classificação, primeiro lance e resposta das pretas.
var aberturas = [
  ["Abertura Italiana", "Aberta", "1. e4", "1... e5"],
  ["Defesa Siciliana", "Semiaberta", "1. e4", "1... c5"],
  ["Ruy López", "Aberta", "1. e4", "1... e5"],
  ["Gambito da Dama", "Fechada", "1. d4", "1... d5"]
];
// IDs das abas no HTML, na mesma ordem dos índices de modo.
var abas = ["tab-player", "tab-opening", "tab-quote"];
// Data local usada para mostrar a data e selecionar o desafio diário.
var hoje = new Date();
// Nome da pessoa armazenado durante a sessão de acesso.
var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");
// Nomes dos meses e quantidade de dias de cada mês para calcular o dia do ano.
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
var diasDosMeses = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// Soma os dias dos meses anteriores para obter uma posição diária previsível.
var diaDoAno = hoje.getDate();
var i = 0;
while (i < hoje.getMonth()) {
  diaDoAno = diaDoAno + diasDosMeses[i];
  i++;
}
// A posição varia a cada dia e percorre ciclicamente a lista de enxadristas.
var jogadorDoDia = diaDoAno % jogadores.length;
// Texto e classe apresentados abaixo do formulário após um palpite.
var mensagem = "";

// Devolve a resposta correspondente ao modo que está aberto.
function respostaDoDia() {
  if (modo == 0) {
    return jogadores[jogadorDoDia][0];
  }
  return respostas[modo];
}

// Preenche a lista de sugestões do campo de resposta para o modo atual.
function montarOpcoes() {
  var lista = opcoes[modo];
  var texto = "";
  var i = 0;

  if (modo == 0) {
    while (i < jogadores.length) {
      texto = texto + "<option>" + jogadores[i][0] + "</option>";
      i++;
    }
  } else {
    while (i < lista.length) {
      texto = texto + "<option>" + lista[i] + "</option>";
      i++;
    }
  }
  document.getElementById("guess-options").innerHTML = texto;
}

// Procura um enxadrista pelo nome, ignorando diferenças entre maiúsculas e
// minúsculas. No modo de citação, considera apenas autores oferecidos ali.
function jogadorPorNome(nome) {
  var lista = modo == 2 ? opcoes[2] : jogadores;
  var i = 0;

  while (i < lista.length) {
    var jogador = modo == 2 ? jogadoresPorNome[lista[i]] : jogadores[i];
    if (jogador[0].toLowerCase() == nome.toLowerCase()) {
      return jogador;
    }
    i++;
  }
  return null;
}

// Cria um índice pelo nome para localizar rapidamente os dados de cada jogador.
var jogadoresPorNome = {};
var indiceJogador = 0;
while (indiceJogador < jogadores.length) {
  jogadoresPorNome[jogadores[indiceJogador][0]] = jogadores[indiceJogador];
  indiceJogador++;
}

// Gera um quadradinho de pista com classe de cor, texto acessível e conteúdo
// escapado para que o palpite não seja interpretado como marcação HTML.
function montarCelula(rotulo, valor, status, titulo) {
  return '<span class="clue-tile ' + status + '" title="' + escaparHTML(titulo) +
    '" aria-label="' + escaparHTML(rotulo + ": " + titulo) + '">' + escaparHTML(valor) + "</span>";
}

// Escapa caracteres especiais antes de inserir texto dinâmico no HTML.
function escaparHTML(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Compara o jogador enviado com o jogador correto e cria as células de
// nome, país e ano de nascimento, incluindo a indicação de direção do ano.
function compararJogador(nome, jogadorAlvo, rotulo) {
  var jogadorPalpite = jogadorPorNome(nome);

  if (jogadorPalpite == null) {
    return montarCelula(rotulo, nome, "incorrect", "Palpite não encontrado na lista") +
      montarCelula("País", "—", "unknown", "Sem dados para comparar") +
      montarCelula("Nascimento", "—", "unknown", "Sem dados para comparar");
  }

  var nomeCerto = jogadorPalpite[0].toLowerCase() == jogadorAlvo[0].toLowerCase();
  var paisCerto = jogadorPalpite[3] == jogadorAlvo[3];
  var diferencaAno = jogadorAlvo[2] - jogadorPalpite[2];
  var anoStatus = diferencaAno == 0 ? "correct" :
    Math.abs(diferencaAno) <= 10 ? "partial" : "incorrect";
  var anoValor = jogadorPalpite[2];
  var anoTitulo = "Mesmo ano de nascimento";

  // Uma diferença de até dez anos recebe cor de proximidade; a seta mostra
  // se o jogador correto nasceu antes ou depois do palpite.
  if (diferencaAno > 0) {
    anoValor = anoValor + " ↑";
    anoTitulo = "A resposta nasceu depois";
  } else if (diferencaAno < 0) {
    anoValor = anoValor + " ↓";
    anoTitulo = "A resposta nasceu antes";
  }

  return montarCelula(rotulo, jogadorPalpite[0], nomeCerto ? "correct" : "incorrect",
      nomeCerto ? "Resposta correta" : "Nome diferente") +
    montarCelula("País", jogadorPalpite[3], paisCerto ? "correct" : "incorrect",
      paisCerto ? "Mesmo país" : "País diferente") +
    montarCelula("Nascimento", anoValor, anoStatus, anoTitulo + ": " + jogadorAlvo[2]);
}

// Reconstrói a grade de palpites do modo ativo sem apagar o histórico dos
// outros modos, mantendo as tentativas na ordem em que foram feitas.
function montarHistorico() {
  var historico = document.getElementById("guess-history");
  var linhas = "";
  var cabecalho = "";
  var i = 0;

  if (palpites[modo].length == 0) {
    historico.innerHTML = "";
    return;
  }

  // Calcula as cores e os valores comparáveis de cada tentativa.
  while (i < palpites[modo].length) {
    var palpite = palpites[modo][i];
    if (modo == 0 || modo == 2) {
      linhas = compararJogador(palpite, modo == 0 ? jogadores[jogadorDoDia] : jogadoresPorNome[respostas[2]],
        modo == 0 ? "Enxadrista" : "Autor") + linhas;
    } else {
      // Localiza os dados da abertura tentada e da resposta correta.
      var aberturaPalpite = null;
      var aberturaAlvo = aberturas[0];
      var j = 0;

      while (j < aberturas.length) {
        if (aberturas[j][0].toLowerCase() == palpite.toLowerCase()) {
          aberturaPalpite = aberturas[j];
        }
        if (aberturas[j][0].toLowerCase() == respostas[1].toLowerCase()) {
          aberturaAlvo = aberturas[j];
        }
        j++;
      }

      // Se o texto não corresponde a uma opção, mostra o palpite e informa
      // que os demais atributos não podem ser comparados.
      if (aberturaPalpite == null) {
        cabecalho = '<span class="clue-heading">Abertura</span><span class="clue-heading">Tipo</span>' +
          '<span class="clue-heading">1º lance</span><span class="clue-heading">Resposta</span>';
        linhas = montarCelula("Abertura", palpite, "incorrect", "Palpite não encontrado na lista") +
          montarCelula("Tipo", "—", "unknown", "Sem dados para comparar") +
          montarCelula("1º lance", "—", "unknown", "Sem dados para comparar") +
          montarCelula("Resposta", "—", "unknown", "Sem dados para comparar") + linhas;
      } else {
        cabecalho = '<span class="clue-heading">Abertura</span><span class="clue-heading">Tipo</span>' +
          '<span class="clue-heading">1º lance</span><span class="clue-heading">Resposta</span>';
        linhas = montarCelula("Abertura", aberturaPalpite[0],
            aberturaPalpite[0] == aberturaAlvo[0] ? "correct" : "incorrect",
            aberturaPalpite[0] == aberturaAlvo[0] ? "Resposta correta" : "Abertura diferente") +
          montarCelula("Tipo", aberturaPalpite[1],
            aberturaPalpite[1] == aberturaAlvo[1] ? "correct" : "incorrect",
            aberturaPalpite[1] == aberturaAlvo[1] ? "Mesmo tipo" : "Tipo diferente") +
          montarCelula("1º lance", aberturaPalpite[2],
            aberturaPalpite[2] == aberturaAlvo[2] ? "correct" : "incorrect",
            aberturaPalpite[2] == aberturaAlvo[2] ? "Mesmo primeiro lance" : "Primeiro lance diferente") +
          montarCelula("Resposta", aberturaPalpite[3],
            aberturaPalpite[3] == aberturaAlvo[3] ? "correct" : "incorrect",
            aberturaPalpite[3] == aberturaAlvo[3] ? "Mesma resposta" : "Resposta diferente") + linhas;
      }
    }
    i++;
  }

  if (modo == 0 || modo == 2) {
    cabecalho = '<span class="clue-heading">' + (modo == 0 ? "Enxadrista" : "Autor") +
      "</span><span class=\"clue-heading\">País</span><span class=\"clue-heading\">Nascimento</span>";
  }
  // Os cabeçalhos de colunas e todas as células formam uma grade responsiva.
  historico.innerHTML = '<p class="history-title">Seus palpites</p><div class="clue-grid ' +
    (modo == 1 ? "opening-grid" : "") + '">' +
    cabecalho + linhas + '</div><p class="clue-legend">🟩 correto&nbsp; · &nbsp;🟥 diferente&nbsp; · &nbsp;🟨 próximo&nbsp; · &nbsp;↑/↓ indica se a resposta nasceu depois/antes</p>';
}

// Atualiza textos, formulário, contador, pistas, histórico e eventos da tela
// conforme o modo e o estado atual do desafio.
function mostrarJogo() {
  var texto = "";
  var extra = "";
  var dica = "";
  var resto = maxTentativas - tentativas[modo];
  var i = 0;

  // Mantém acessibilidade e seleção visual das abas sincronizadas com o modo.
  document.getElementById("mode-kicker").innerHTML = "Desafio " + (modo + 1) + " de 3";
  document.getElementById("mode-title").innerHTML = titulos[modo];
  document.getElementById("mode-description").innerHTML = descricoes[modo];
  document.getElementById("game-content").setAttribute("aria-labelledby", abas[modo]);

  while (i < abas.length) {
    document.getElementById(abas[i]).setAttribute("aria-selected", i == modo);
    i++;
  }

  // Atualiza o contador e usa o singular somente quando resta uma tentativa.
  if (resto == 1) {
    texto = "tentativa";
  } else {
    texto = "tentativas";
  }
  document.getElementById("tries-counter").innerHTML = "<strong>" + resto + "</strong> " + texto;

  // Apresenta o conteúdo específico da citação nesse modo.
  if (modo == 2) {
    extra = '<blockquote class="quote-card">“O xadrez é a vida em miniatura.”</blockquote>';
  }

  // Cria o campo de palpite e impede novas entradas após o encerramento.
  texto = '<p class="prompt">' + perguntas[modo] + "</p>" + extra;
  texto = texto + '<form class="guess-form" id="guess-form">';
  texto = texto + '<input class="guess-input" id="guess-input" list="guess-options" autocomplete="off" required';
  texto = texto + ' placeholder="Digite sua resposta..."';
  if (terminou[modo] == true) {
    texto = texto + " disabled";
  }
  texto = texto + '><button class="submit-button" id="send-button" type="submit">Enviar →</button></form>';

  // Seleciona a pista revelada mais recentemente. No modo jogador, as pistas
  // são personalizadas para o enxadrista escolhido para o dia.
  if (pistasUsadas[modo] == 1) {
    dica = dicas[modo][0];
    if (modo == 0) {
      dica = jogadores[jogadorDoDia][1];
    }
  }
  if (pistasUsadas[modo] == 2) {
    dica = dicas[modo][1];
    if (modo == 0) {
      dica = "Nasceu em " + jogadores[jogadorDoDia][2] + ".";
    }
  }

  // Monta a área de pistas e feedback antes de atualizar o DOM.
  texto = texto + '<div class="below-form"><button class="hint-button" id="hint-button" type="button">';
  texto = texto + "Revelar pista (" + (2 - pistasUsadas[modo]) + " restantes)</button>";
  texto = texto + '<span class="hint-text">' + dica + "</span></div>";
  texto = texto + '<p class="feedback ' + tipoMensagem + '" id="feedback" role="status">' + mensagem + "</p>";
  document.getElementById("challenge-content").innerHTML = texto;
  montarOpcoes();
  montarHistorico();

  // Intercepta o envio para validar a tentativa sem recarregar a página.
  document.getElementById("guess-form").onsubmit = function(evento) {
    evento.preventDefault();
    enviarResposta();
  };
  // Revela uma pista e redesenha a tela enquanto o desafio ainda estiver ativo.
  document.getElementById("hint-button").onclick = function() {
    if (pistasUsadas[modo] < 2 && terminou[modo] == false) {
      pistasUsadas[modo] = pistasUsadas[modo] + 1;
      mostrarJogo();
    }
  };

  // Desabilita controles ao terminar; caso contrário, esconde o botão de
  // reinício e desativa a solicitação de pistas quando todas forem usadas.
  if (terminou[modo] == true) {
    document.getElementById("guess-input").disabled = true;
    document.getElementById("send-button").disabled = true;
    document.getElementById("hint-button").disabled = true;
    document.getElementById("reset-button").className = "reset-button visible";
  } else {
    document.getElementById("reset-button").className = "reset-button";
    if (pistasUsadas[modo] == 2) {
      document.getElementById("hint-button").disabled = true;
    }
  }
}

// Valida e registra o palpite atual, atualiza o estado do desafio e redesenha
// a interface com a mensagem e o histórico correspondentes.
function enviarResposta() {
  // Normaliza a resposta para a comparação e mantém o texto original no histórico.
  var tentativaOriginal = document.getElementById("guess-input").value.trim();
  var tentativa = tentativaOriginal.toLowerCase();
  var resposta = respostaDoDia().toLowerCase();

  if (tentativa == "") {
    return;
  }
  // Cada envio conta como tentativa e aparece como uma nova linha de pistas.
  tentativas[modo] = tentativas[modo] + 1;
  palpites[modo].push(tentativaOriginal);
  if (tentativa == resposta) {
    terminou[modo] = true;
    mensagem = "Boa! Você acertou! ♟";
    tipoMensagem = "success";
  } else {
    // Ao atingir o limite, encerra o desafio e revela a resposta correta.
    if (tentativas[modo] == maxTentativas) {
      terminou[modo] = true;
      mensagem = "Fim das tentativas! A resposta era: " + respostaDoDia() + ".";
    } else {
      mensagem = "Ainda não é essa. Tente outra vez!";
    }
    tipoMensagem = "error";
  }
  mostrarJogo();
}

// Troca o modo ativo e limpa apenas o feedback temporário da tela.
function trocarModo(numero) {
  modo = numero;
  mensagem = "";
  tipoMensagem = "";
  mostrarJogo();
}

// Reinicia o desafio atual, incluindo tentativas, pistas e histórico.
document.getElementById("reset-button").onclick = function() {
  tentativas[modo] = 0;
  pistasUsadas[modo] = 0;
  terminou[modo] = false;
  palpites[modo] = [];
  mensagem = "";
  tipoMensagem = "";
  mostrarJogo();
};

// Associa cada aba ao índice correspondente nos vetores de dados.
document.getElementById("tab-player").onclick = function() { trocarModo(0); };
document.getElementById("tab-opening").onclick = function() { trocarModo(1); };
document.getElementById("tab-quote").onclick = function() { trocarModo(2); };

// Exibe a data do desafio no formato usado pela interface.
document.getElementById("today-date").innerHTML = hoje.getDate() + " de " +
  meses[hoje.getMonth()] + " de " + hoje.getFullYear();
// Mostra o nome da pessoa quando há um nome salvo na sessão.
if (nomeUsuario != null && nomeUsuario != "") {
  document.getElementById("header-user").innerHTML = "Olá, " + nomeUsuario;
  document.getElementById("header-user").hidden = false;
}
// Renderização inicial do modo selecionado ao carregar o script.
mostrarJogo();
