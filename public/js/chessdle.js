var modo = 0;
var maxTentativas = 6;
var tentativas = [0, 0, 0];
var pistasUsadas = [0, 0, 0];
var terminou = [false, false, false];
var tipoMensagem = "";

// Os itens dos vetores seguem a ordem das abas no HTML.
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
var respostas = [
  "",
  "Abertura Italiana",
  "José Raúl Capablanca"
];
var opcoes = [
  [],
  ["Abertura Italiana", "Defesa Siciliana", "Ruy López", "Gambito da Dama"],
  ["Bobby Fischer", "Garry Kasparov", "Magnus Carlsen", "José Raúl Capablanca"]
];
var dicas = [
  ["É um grande mestre norueguês.", "Nasceu em 1990."],
  ["O bispo branco vai para c4.", "A abertura começa com 1. e4 e5."],
  ["Nasceu em Cuba.", "Foi campeão mundial entre 1921 e 1927."]
];
var jogadores = [
  ["Magnus Carlsen", "É um grande mestre norueguês.", 1990],
  ["Garry Kasparov", "Foi campeão mundial por quinze anos.", 1963],
  ["Bobby Fischer", "Enfrentou Spassky no match de 1972.", 1943],
  ["Judit Polgár", "É considerada a maior enxadrista da história.", 1976],
  ["Hikaru Nakamura", "É um dos maiores nomes do xadrez online.", 1987],
  ["José Raúl Capablanca", "Foi um grande enxadrista cubano.", 1888],
  ["Viswanathan Anand", "Foi o primeiro campeão mundial indiano.", 1969],
  ["Fabiano Caruana", "Disputou o título mundial em 2018.", 1992]
];
var abas = ["tab-player", "tab-opening", "tab-quote"];
var hoje = new Date();
var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
var diasDosMeses = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var diaDoAno = hoje.getDate();
var i = 0;
while (i < hoje.getMonth()) {
  diaDoAno = diaDoAno + diasDosMeses[i];
  i++;
}
var jogadorDoDia = diaDoAno % jogadores.length;
var mensagem = "";

function respostaDoDia() {
  if (modo == 0) {
    return jogadores[jogadorDoDia][0];
  }
  return respostas[modo];
}

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

function mostrarJogo() {
  var texto = "";
  var extra = "";
  var dica = "";
  var resto = maxTentativas - tentativas[modo];
  var i = 0;

  document.getElementById("mode-kicker").innerHTML = "Desafio " + (modo + 1) + " de 3";
  document.getElementById("mode-title").innerHTML = titulos[modo];
  document.getElementById("mode-description").innerHTML = descricoes[modo];
  document.getElementById("game-content").setAttribute("aria-labelledby", abas[modo]);

  while (i < abas.length) {
    document.getElementById(abas[i]).setAttribute("aria-selected", i == modo);
    i++;
  }

  if (resto == 1) {
    texto = "tentativa";
  } else {
    texto = "tentativas";
  }
  document.getElementById("tries-counter").innerHTML = "<strong>" + resto + "</strong> " + texto;

  if (modo == 2) {
    extra = '<blockquote class="quote-card">“O xadrez é a vida em miniatura.”</blockquote>';
  }

  texto = '<p class="prompt">' + perguntas[modo] + "</p>" + extra;
  texto = texto + '<form class="guess-form" id="guess-form">';
  texto = texto + '<input class="guess-input" id="guess-input" list="guess-options" autocomplete="off" required';
  texto = texto + ' placeholder="Digite sua resposta..."';
  if (terminou[modo] == true) {
    texto = texto + " disabled";
  }
  texto = texto + '><button class="submit-button" id="send-button" type="submit">Enviar →</button></form>';

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

  texto = texto + '<div class="below-form"><button class="hint-button" id="hint-button" type="button">';
  texto = texto + "Revelar pista (" + (2 - pistasUsadas[modo]) + " restantes)</button>";
  texto = texto + '<span class="hint-text">' + dica + "</span></div>";
  texto = texto + '<p class="feedback ' + tipoMensagem + '" id="feedback" role="status">' + mensagem + "</p>";
  document.getElementById("challenge-content").innerHTML = texto;
  montarOpcoes();
  document.getElementById("guess-history").innerHTML = "";

  document.getElementById("guess-form").onsubmit = function(evento) {
    evento.preventDefault();
    enviarResposta();
  };
  document.getElementById("hint-button").onclick = function() {
    if (pistasUsadas[modo] < 2 && terminou[modo] == false) {
      pistasUsadas[modo] = pistasUsadas[modo] + 1;
      mostrarJogo();
    }
  };

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

function enviarResposta() {
  var tentativa = document.getElementById("guess-input").value.trim().toLowerCase();
  var resposta = respostaDoDia().toLowerCase();

  if (tentativa == "") {
    return;
  }
  tentativas[modo] = tentativas[modo] + 1;
  if (tentativa == resposta) {
    terminou[modo] = true;
    mensagem = "Boa! Você acertou! ♟";
    tipoMensagem = "success";
  } else {
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

function trocarModo(numero) {
  modo = numero;
  mensagem = "";
  tipoMensagem = "";
  mostrarJogo();
}

document.getElementById("reset-button").onclick = function() {
  tentativas[modo] = 0;
  pistasUsadas[modo] = 0;
  terminou[modo] = false;
  mensagem = "";
  tipoMensagem = "";
  mostrarJogo();
};

document.getElementById("tab-player").onclick = function() { trocarModo(0); };
document.getElementById("tab-opening").onclick = function() { trocarModo(1); };
document.getElementById("tab-quote").onclick = function() { trocarModo(2); };

document.getElementById("today-date").innerHTML = hoje.getDate() + " de " +
  meses[hoje.getMonth()] + " de " + hoje.getFullYear();
if (nomeUsuario != null && nomeUsuario != "") {
  document.getElementById("header-user").innerHTML = "Olá, " + nomeUsuario;
  document.getElementById("header-user").hidden = false;
}
mostrarJogo();
