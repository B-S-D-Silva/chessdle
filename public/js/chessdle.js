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
var enviandoResultado = false;
var falhaAoSalvarResultado = false;
// Classe usada para apresentar o estado da mensagem de feedback.
var tipoMensagem = "";

// Conteúdo carregado da API /desafios antes de iniciar a interface.
var titulos = [];
var descricoes = [];
var perguntas = [];
var respostas = [];
var conteudos = [];
var opcoes = [[], [], []];
var dicas = [[], [], []];
var jogadores = [];
var aberturas = [];
var jogadoresPorNome = {};
// IDs das abas no HTML, na mesma ordem dos índices de modo.
var abas = ["tab-player", "tab-opening", "tab-quote"];
// Data local usada para mostrar a data e selecionar o desafio diário.
var hoje = new Date();
// Nome da pessoa armazenado durante a sessão de acesso.
var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");
// Nomes dos meses e quantidade de dias de cada mês para calcular o dia do ano.
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
var jogadorDoDia = 0;
// Texto e classe apresentados abaixo do formulário após um palpite.
var mensagem = "";
var animarPalpiteAbertura = false;

function carregarConteudoDoBanco(conteudo) {
  var modos = ["jogador", "abertura", "citacao"];
  if (!conteudo || !Array.isArray(conteudo.desafios) || conteudo.desafios.length != 3 ||
      !Array.isArray(conteudo.jogadores) || conteudo.jogadores.length == 0 ||
      !Array.isArray(conteudo.aberturas) || conteudo.aberturas.length == 0) {
    throw new Error("O conteúdo retornado pelo banco está incompleto.");
  }

  conteudo.desafios.forEach(function(desafio, indice) {
    if (!desafio || desafio.modo != modos[indice] || !desafio.titulo ||
        !desafio.descricao || !desafio.pergunta || !Array.isArray(desafio.opcoes) ||
        desafio.opcoes.length == 0 || !Array.isArray(desafio.dicas)) {
      throw new Error("A configuração do desafio " + modos[indice] + " está inválida.");
    }
    titulos.push(desafio.titulo);
    descricoes.push(desafio.descricao);
    perguntas.push(desafio.pergunta);
    respostas.push(desafio.resposta);
    conteudos.push(desafio.conteudo);
    opcoes[indice] = desafio.opcoes;
    dicas[indice] = desafio.dicas;
  });

  jogadores = conteudo.jogadores.map(function(jogador) {
    return [jogador.nome, jogador.dica, Number(jogador.nascimento), jogador.pais];
  });
  aberturas = conteudo.aberturas.map(function(abertura) {
    return {
      nome: abertura.nome,
      classificacao: abertura.classificacao,
      lances: abertura.lances,
      eco: abertura.eco
    };
  });

  jogadoresPorNome = {};
  jogadores.forEach(function(jogador) {
    jogadoresPorNome[jogador[0]] = jogador;
  });

  var diaDoAno = Math.floor((Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) -
    Date.UTC(hoje.getFullYear(), 0, 0)) / 86400000);
  jogadorDoDia = diaDoAno % jogadores.length;
}

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

  while (i < lista.length) {
    texto = texto + "<option>" + escaparHTML(lista[i]) + "</option>";
    i++;
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

function aberturaPorNome(nome) {
  var i = 0;

  while (i < aberturas.length) {
    if (aberturas[i].nome.toLowerCase() == nome.toLowerCase()) {
      return aberturas[i];
    }
    i++;
  }
  return null;
}

function montarFichaLance(valor, status, descricao, indice) {
  return '<span class="opening-move-tile ' + status + '" style="--reveal-delay:' +
    (indice * 150) + 'ms" title="' + escaparHTML(descricao) + '" aria-label="' +
    escaparHTML(descricao) + '">' + escaparHTML(valor) +
    (status == "correct" ? " ✓" : status == "incorrect" ? " ✗" : "") + "</span>";
}

function compararAbertura(palpite, aberturaAlvo, animar) {
  var aberturaPalpite = aberturaPorNome(palpite);
  var lancesPalpite = aberturaPalpite ? aberturaPalpite.lances : [];
  var quantidade = Math.max(lancesPalpite.length, aberturaAlvo.lances.length);
  var lances = "";
  var divergido = false;
  var linhaCorreta = aberturaPalpite != null &&
    aberturaPalpite.nome.toLowerCase() == aberturaAlvo.nome.toLowerCase();
  var movimento = 0;
  var linha = '<div class="opening-guess-row' +
    (linhaCorreta ? " victory" : "") + (animar ? " reveal" : "") + '">';
  var nome = aberturaPalpite ? aberturaPalpite.nome : palpite;
  var direcaoECO = aberturaPalpite ?
    aberturaAlvo.eco.localeCompare(aberturaPalpite.eco, undefined, { numeric: true }) : 0;
  var ecoExibido = aberturaPalpite ? aberturaPalpite.eco +
    (direcaoECO < 0 ? " ↓" : direcaoECO > 0 ? " ↑" : "") : "—";
  var descricaoECO = !aberturaPalpite ? "ECO indisponível" :
    direcaoECO < 0 ? "A resposta tem um ECO anterior" :
    direcaoECO > 0 ? "A resposta tem um ECO posterior" : "Mesmo código ECO";

  while (movimento < quantidade) {
    var lancePalpite = lancesPalpite[movimento];
    var lanceAlvo = aberturaAlvo.lances[movimento];
    var status = "unknown";
    var valor = lancePalpite || lanceAlvo || "—";
    var descricao = valor == "—" ? "Sem lance para comparar" :
      valor + ", sem lance para comparar";

    if (lancePalpite && lanceAlvo) {
      if (lancePalpite == lanceAlvo && !divergido) {
        status = "correct";
        descricao = valor + ", correto";
      } else {
        divergido = true;
        status = "incorrect";
        descricao = valor + ", divergiu";
      }
    }
    if (linhaCorreta && lancePalpite && lanceAlvo) {
      status = "correct";
      descricao = valor + ", correto";
    }

    if (movimento % 2 == 0) {
      lances += '<span class="opening-move-pair"><span class="opening-move-number">' +
        (Math.floor(movimento / 2) + 1) + '.</span>';
    }
    lances += montarFichaLance(valor, status, descricao, movimento);
    if (movimento % 2 == 1 || movimento == quantidade - 1) {
      lances += "</span>";
    }
    movimento++;
  }

  return linha + '<span class="opening-guess-name">' + escaparHTML(nome) +
    (linhaCorreta ? '<span class="opening-win-mark" aria-label="Resposta correta">✓</span>' : "") +
    '</span><div class="opening-guess-details"><div class="opening-move-list" aria-label="Lances da abertura">' +
    lances + '</div><span class="opening-badge">' +
    escaparHTML(aberturaPalpite ? aberturaPalpite.classificacao : "—") +
    '</span><span class="opening-badge opening-eco" title="' + escaparHTML(descricaoECO) +
    '">' + escaparHTML(ecoExibido) + "</span></div></div>";
}

// Reconstrói a grade de palpites do modo ativo sem apagar o histórico dos
// outros modos, mantendo as tentativas na ordem em que foram feitas.
function montarHistorico() {
  var historico = document.getElementById("guess-history");
  var linhas = "";
  var cabecalho = "";
  var i = 0;
  var animarUltimoPalpite = modo == 1 && animarPalpiteAbertura;

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
      linhas = compararAbertura(palpite, aberturaPorNome(respostas[1]) || aberturas[0],
        animarUltimoPalpite && i == palpites[modo].length - 1) + linhas;
    }
    i++;
  }

  if (modo == 0 || modo == 2) {
    cabecalho = '<span class="clue-heading">' + (modo == 0 ? "Enxadrista" : "Autor") +
      "</span><span class=\"clue-heading\">País</span><span class=\"clue-heading\">Nascimento</span>";
  }
  if (modo == 1) {
    animarPalpiteAbertura = false;
    historico.innerHTML = '<p class="history-title">Seus palpites</p><div class="opening-guess-list">' +
      linhas + '</div><p class="clue-legend">🟩 lance correto&nbsp; · &nbsp;🟥 divergiu&nbsp; · &nbsp;⬜ sem lance para comparar</p>';
  } else {
    historico.innerHTML = '<p class="history-title">Seus palpites</p><div class="clue-grid">' +
      cabecalho + linhas + '</div><p class="clue-legend">🟩 correto&nbsp; · &nbsp;🟥 diferente&nbsp; · &nbsp;🟨 próximo&nbsp; · &nbsp;↑/↓ indica se a resposta nasceu depois/antes</p>';
  }
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
  document.getElementById("mode-title").textContent = titulos[modo];
  document.getElementById("mode-description").textContent = descricoes[modo];
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
    extra = '<blockquote class="quote-card">' + escaparHTML(conteudos[modo]) + '</blockquote>';
  }

  // Cria o campo de palpite e impede novas entradas após o encerramento.
  texto = '<p class="prompt">' + escaparHTML(perguntas[modo]) + "</p>" + extra;
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
  if (dica != "") {
    texto = texto + '<aside class="hint-card" aria-label="Pista revelada" aria-live="polite">';
    texto = texto + '<p class="hint-card-title">Pista revelada</p>';
    texto = texto + '<p class="hint-text">' + escaparHTML(dica) + "</p></aside>";
  }
  texto = texto + "</div>";
  texto = texto + '<p class="feedback ' + tipoMensagem + '" id="feedback" role="status">' +
    escaparHTML(mensagem) + "</p>";
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
  if (modo == 1) {
    animarPalpiteAbertura = true;
  }
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

  if (terminou[0] && terminou[1] && terminou[2]) {
    exibirResultadoDiario();
  }
}

// Salva o desempenho da sessão e abre o dashboard assim que os três modos
// forem concluídos.
function exibirResultadoDiario() {
  if (enviandoResultado) {
    return;
  }
  enviandoResultado = true;

  var nomesModos = ["jogador", "abertura", "citacao"];
  var resultados = [];
  var i = 0;

  while (i < nomesModos.length) {
    resultados.push({
      modo: nomesModos[i],
      tentativas: tentativas[i],
      acertou: palpites[i][palpites[i].length - 1].toLowerCase() == respostaDoModo(i).toLowerCase(),
      pistas: pistasUsadas[i]
    });
    i++;
  }

  fetch("/partidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuarioId: Number(sessionStorage.getItem("ID_USUARIO")),
      data: hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") +
        "-" + String(hoje.getDate()).padStart(2, "0"),
      resultados: resultados
    })
  }).then(function(resposta) {
    if (!resposta.ok) {
      return resposta.text().then(function(texto) {
        var erro = new Error(texto || "Falha ao salvar o resultado.");
        erro.status = resposta.status;
        throw erro;
      });
    }
    return resposta.json();
  }).then(function(partida) {
    if (!partida || !Number.isSafeInteger(Number(partida.id)) || Number(partida.id) < 1) {
      throw new Error("A resposta do servidor não informou a partida salva.");
    }
    window.location.href = "dashboard/resultado.html?id=" + encodeURIComponent(partida.id);
  }).catch(function(erro) {
    enviandoResultado = false;
    if (erro.status == 401) {
      window.alert(erro.message);
      sessionStorage.removeItem("ID_USUARIO");
      sessionStorage.removeItem("EMAIL_USUARIO");
      sessionStorage.removeItem("NOME_USUARIO");
      window.location.replace("login.html");
      return;
    }
    falhaAoSalvarResultado = true;
    console.error("Não foi possível salvar o resultado do Chessdle.", erro);
    mensagem = "Não foi possível salvar sua partida. Verifique a conexão e tente novamente.";
    tipoMensagem = "error";
    document.getElementById("feedback").textContent = mensagem;
    document.getElementById("feedback").className = "feedback " + tipoMensagem;
    document.getElementById("reset-button").textContent = "Tentar salvar resultado";
  });
}

// Retorna a resposta associada a um modo sem depender da aba atualmente aberta.
function respostaDoModo(numero) {
  return numero == 0 ? jogadores[jogadorDoDia][0] : respostas[numero];
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
  if (falhaAoSalvarResultado && terminou[0] && terminou[1] && terminou[2]) {
    falhaAoSalvarResultado = false;
    mensagem = "Salvando seu resultado...";
    tipoMensagem = "";
    document.getElementById("feedback").textContent = mensagem;
    document.getElementById("feedback").className = "feedback";
    exibirResultadoDiario();
    return;
  }

  tentativas[modo] = 0;
  pistasUsadas[modo] = 0;
  terminou[modo] = false;
  palpites[modo] = [];
  mensagem = "";
  tipoMensagem = "";
  document.getElementById("reset-button").textContent = "Jogar novamente";
  mostrarJogo();
};

function inicializarJogo() {
  document.getElementById("tab-player").onclick = function() { trocarModo(0); };
  document.getElementById("tab-opening").onclick = function() { trocarModo(1); };
  document.getElementById("tab-quote").onclick = function() { trocarModo(2); };

  document.getElementById("today-date").textContent = hoje.getDate() + " de " +
    meses[hoje.getMonth()] + " de " + hoje.getFullYear();
  mostrarJogo();
}

if (nomeUsuario != null && nomeUsuario != "") {
  document.getElementById("header-user").textContent = "Olá, " + nomeUsuario;
  document.getElementById("header-user").hidden = false;
}
document.getElementById("challenge-content").textContent = "Carregando desafios...";
fetch("/desafios", { cache: "no-store" })
  .then(function(resposta) {
    if (!resposta.ok) {
      return resposta.text().then(function(texto) {
        throw new Error(texto || "Não foi possível carregar os desafios.");
      });
    }
    return resposta.json();
  })
  .then(function(conteudo) {
    carregarConteudoDoBanco(conteudo);
    inicializarJogo();
  })
  .catch(function(erro) {
    console.error("Não foi possível carregar os dados dos desafios do banco.", erro);
    document.getElementById("mode-title").textContent = "Desafios indisponíveis";
    document.getElementById("mode-description").textContent = "";
    document.getElementById("challenge-content").textContent =
      "Não foi possível carregar os desafios do banco. Verifique o servidor e o banco de dados e recarregue a página.";
    document.getElementById("tries-counter").textContent = "";
  });
