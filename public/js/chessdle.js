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
// Evita repetir o registro de conclusão de um modo na mesma página.
var conclusoesEnviadas = [false, false, false];
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
var partesHojeSaoPaulo = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).formatToParts(new Date());
var dataHojeSaoPaulo = {};
partesHojeSaoPaulo.forEach(function(parte) {
  dataHojeSaoPaulo[parte.type] = parte.value;
});
var anoHoje = Number(dataHojeSaoPaulo.year);
var mesHoje = Number(dataHojeSaoPaulo.month);
var diaHoje = Number(dataHojeSaoPaulo.day);
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
    return [jogador.nome, jogador.dica, Number(jogador.nascimento), jogador.pais, jogador.continente];
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

  var diaDoAno = Math.floor((Date.UTC(anoHoje, mesHoje - 1, diaHoje) -
    Date.UTC(anoHoje, 0, 0)) / 86400000);
  jogadorDoDia = diaDoAno % jogadores.length;
}

// Devolve a resposta correspondente ao modo que está aberto.
function respostaDoDia() {
  if (modo == 0) {
    return jogadores[jogadorDoDia][0];
  }
  return respostas[modo];
}

// Renderiza as opções disponíveis no seletor pesquisável do modo atual.
function montarOpcoes() {
  var campo = document.getElementById("guess-input");
  var lista = document.getElementById("guess-options");
  var busca = normalizarBusca(campo.value.trim());
  var opcoesOrdenadas = opcoes[modo].slice().sort(function(a, b) {
    return a.localeCompare(b, "pt-BR");
  });
  var encontradas = 0;

  lista.textContent = "";
  opcoesOrdenadas.forEach(function(valor, indice) {
    if (normalizarBusca(valor).indexOf(busca) == -1) {
      return;
    }

    var opcao = document.createElement("div");
    opcao.id = "guess-option-" + indice;
    opcao.className = "guess-option";
    opcao.setAttribute("role", "option");
    opcao.setAttribute("aria-selected", normalizarBusca(valor) == busca);
    opcao.textContent = valor;
    opcao.onmousedown = function(evento) {
      evento.preventDefault();
    };
    opcao.onclick = function() {
      selecionarOpcao(valor);
    };
    lista.appendChild(opcao);
    encontradas++;
  });

  if (encontradas == 0) {
    var vazio = document.createElement("p");
    vazio.className = "guess-options-empty";
    vazio.textContent = "Nenhuma opção encontrada. Você ainda pode enviar seu palpite.";
    lista.appendChild(vazio);
  }

  return encontradas;
}

function normalizarBusca(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function selecionarOpcao(valor) {
  var campo = document.getElementById("guess-input");
  campo.value = valor;
  fecharSeletor();
  campo.focus();
}

function fecharSeletor() {
  var campo = document.getElementById("guess-input");
  var lista = document.getElementById("guess-options");
  var seletor = campo.closest(".guess-picker");
  if (lista.hidden) {
    return;
  }
  campo.setAttribute("aria-expanded", "false");
  campo.removeAttribute("aria-activedescendant");
  seletor.classList.remove("is-open");
  seletor.classList.add("is-closing");
  window.setTimeout(function() {
    if (seletor.classList.contains("is-closing")) {
      lista.hidden = true;
      seletor.classList.remove("is-closing", "opens-up");
    }
  }, 130);
}

function configurarSeletor() {
  var campo = document.getElementById("guess-input");
  var lista = document.getElementById("guess-options");
  var opcaoAtiva = -1;

  function abrirSeletor() {
    opcaoAtiva = -1;
    montarOpcoes();
    var limitesCampo = campo.getBoundingClientRect();
    var espacoAbaixo = window.innerHeight - limitesCampo.bottom;
    var espacoAcima = limitesCampo.top;
    campo.closest(".guess-picker").classList.toggle(
      "opens-up",
      espacoAbaixo < Math.min(260, window.innerHeight * 0.4) && espacoAcima > espacoAbaixo
    );
    lista.hidden = false;
    campo.setAttribute("aria-expanded", "true");
    campo.closest(".guess-picker").classList.remove("is-closing");
    campo.closest(".guess-picker").classList.add("is-open");
  }

  function definirOpcaoAtiva(indice) {
    var opcoesVisiveis = lista.querySelectorAll('[role="option"]');
    if (opcoesVisiveis.length == 0) {
      opcaoAtiva = -1;
      campo.removeAttribute("aria-activedescendant");
      return;
    }
    opcaoAtiva = ((indice % opcoesVisiveis.length) + opcoesVisiveis.length) %
      opcoesVisiveis.length;
    opcoesVisiveis.forEach(function(opcao, indiceOpcao) {
      opcao.classList.toggle("is-active", indiceOpcao == opcaoAtiva);
    });
    campo.setAttribute("aria-activedescendant", opcoesVisiveis[opcaoAtiva].id);
    opcoesVisiveis[opcaoAtiva].scrollIntoView({ block: "nearest" });
  }

  campo.onfocus = abrirSeletor;
  campo.onclick = abrirSeletor;
  campo.oninput = function() {
    opcaoAtiva = -1;
    abrirSeletor();
    definirOpcaoAtiva(0);
  };
  campo.onkeydown = function(evento) {
    var opcoesVisiveis;
    if (evento.key == "ArrowDown" || evento.key == "ArrowUp") {
      evento.preventDefault();
      if (campo.getAttribute("aria-expanded") != "true") {
        abrirSeletor();
      }
      opcoesVisiveis = lista.querySelectorAll('[role="option"]');
      var direcao = evento.key == "ArrowDown" ? 1 : -1;
      definirOpcaoAtiva(opcaoAtiva < 0 ?
        (direcao > 0 ? 0 : opcoesVisiveis.length - 1) : opcaoAtiva + direcao);
    } else if (evento.key == "Enter" && campo.getAttribute("aria-expanded") == "true") {
      opcoesVisiveis = lista.querySelectorAll('[role="option"]');
      if (opcaoAtiva >= 0 && opcoesVisiveis[opcaoAtiva]) {
        evento.preventDefault();
        selecionarOpcao(opcoesVisiveis[opcaoAtiva].textContent);
      } else if (opcoesVisiveis.length == 0) {
        fecharSeletor();
      }
    } else if (evento.key == "Escape" && campo.getAttribute("aria-expanded") == "true") {
      evento.preventDefault();
      fecharSeletor();
    }
  };
  campo.onblur = function() {
    window.setTimeout(function() {
      if (!campo.closest(".guess-picker").contains(document.activeElement)) {
        fecharSeletor();
      }
    }, 0);
  };
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

// Compara o jogador enviado com o jogador correto usando nome, país,
// continente e ano de nascimento.
function compararJogador(nome, jogadorAlvo, rotulo) {
  var jogadorPalpite = jogadorPorNome(nome);

  if (jogadorPalpite == null) {
    return montarCelula(rotulo, nome, "incorrect", "Palpite não encontrado na lista") +
      montarCelula("País", "—", "unknown", "Sem dados para comparar") +
      montarCelula("Continente", "—", "unknown", "Sem dados para comparar") +
      montarCelula("Nascimento", "—", "unknown", "Sem dados para comparar");
  }

  var nomeCerto = jogadorPalpite[0].toLowerCase() == jogadorAlvo[0].toLowerCase();
  var paisCerto = jogadorPalpite[3] == jogadorAlvo[3];
  var continenteCerto = jogadorPalpite[4] == jogadorAlvo[4];
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
    montarCelula("Continente", jogadorPalpite[4], continenteCerto ? "correct" : "incorrect",
      continenteCerto ? "Mesmo continente" : "Continente diferente") +
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
      "</span><span class=\"clue-heading\">País</span><span class=\"clue-heading\">Continente</span>" +
      "<span class=\"clue-heading\">Nascimento</span>";
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
  texto = texto + '<div class="guess-picker"><input class="guess-input" id="guess-input" role="combobox"';
  texto = texto + ' aria-label="Buscar uma resposta" aria-autocomplete="list" aria-haspopup="listbox"';
  texto = texto + ' aria-controls="guess-options" aria-expanded="false" autocomplete="off" required';
  texto = texto + ' placeholder="Digite sua resposta..."';
  if (terminou[modo] == true) {
    texto = texto + " disabled";
  }
  texto = texto + '><div class="guess-options" id="guess-options" role="listbox"';
  texto = texto + ' aria-label="Opções de resposta" hidden></div></div>';
  texto = texto + '<button class="submit-button" id="send-button" type="submit">Enviar →</button></form>';

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
  configurarSeletor();
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

  registrarConclusoesPendentes().then(function() {
    if (terminou[0] && terminou[1] && terminou[2]) {
      exibirResultadoDiario();
    }
  });
}

function registrarConclusoesPendentes() {
  var usuarioId = Number(sessionStorage.getItem("ID_USUARIO"));
  var nomesModos = ["jogador", "abertura", "citacao"];
  var requisicoes = [];
  var indice = 0;

  if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
    return Promise.resolve();
  }

  while (indice < terminou.length) {
    if (terminou[indice] && !conclusoesEnviadas[indice]) {
      conclusoesEnviadas[indice] = true;
      (function(indiceAtual) {
        var requisicao = fetch("/partidas/concluir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId: usuarioId, modo: nomesModos[indiceAtual] })
        }).then(function(resposta) {
          if (!resposta.ok) {
            return resposta.text().then(function(texto) {
              throw new Error(texto || "Não foi possível salvar a conclusão do desafio.");
            });
          }
          return resposta.json();
        }).then(function(resultado) {
          if (!resultado || !resultado.sequencia) {
            throw new Error("A resposta do servidor não informou a sequência atualizada.");
          }
          if (window.ChessdleStreak) {
            window.ChessdleStreak.atualizar(resultado.sequencia, resultado.sequencia.aumentou);
          }
        }).catch(function(erro) {
          conclusoesEnviadas[indiceAtual] = false;
          console.error("Não foi possível registrar a conclusão do desafio.", erro);
          if (window.ChessdleStreak) {
            window.ChessdleStreak.mostrarErro("Não foi possível salvar sua sequência. Ela será tentada novamente ao concluir outro desafio.");
          }
        });
        requisicoes.push(requisicao);
      })(indice);
    }
    indice++;
  }

  return Promise.all(requisicoes);
}

// Salva o desempenho da sessão e abre o dashboard assim que os três modos
// forem concluídos.
function exibirResultadoDiario() {
  if (enviandoResultado) {
    return;
  }
  if (!sessionStorage.getItem("ID_USUARIO")) {
    mensagem = "Você concluiu os desafios! Entre na sua conta para salvar sua sequência.";
    tipoMensagem = "success";
    mostrarJogo();
    return;
  }
  var inicioConclusao = Date.now();
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
      data: anoHoje + "-" + String(mesHoje).padStart(2, "0") +
        "-" + String(diaHoje).padStart(2, "0"),
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
    var novasConquistas = Array.isArray(partida.novasConquistas) ? partida.novasConquistas : [];
    if (partida.sequencia && window.ChessdleStreak) {
      window.ChessdleStreak.atualizar(partida.sequencia, partida.sequencia.aumentou);
    }
    var destino = "dashboard/resultado.html?id=" + encodeURIComponent(partida.id);
    function irParaResultado() {
      var tempoRestante = Math.max(0, 3000 - (Date.now() - inicioConclusao));
      window.setTimeout(function() {
        window.location.href = destino;
      }, tempoRestante);
    }
    if (novasConquistas.length > 0) {
      mostrarToastConquistas(novasConquistas).then(irParaResultado);
    } else if (partida.sequencia && partida.sequencia.aumentou) {
      window.setTimeout(irParaResultado, 700);
    } else {
      irParaResultado();
    }
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

function mostrarToastConquistas(conquistas) {
  var toast = document.getElementById("achievement-toast");
  if (!toast || !Array.isArray(conquistas) || conquistas.length == 0) {
    return Promise.resolve();
  }

  var indice = 0;
  return new Promise(function(resolve) {
    function mostrarProxima() {
      if (indice >= conquistas.length) {
        toast.hidden = true;
        toast.textContent = "";
        resolve();
        return;
      }

      var conquista = conquistas[indice];
      var icone = document.createElement("span");
      icone.className = "achievement-toast-icon";
      icone.setAttribute("aria-hidden", "true");
      icone.textContent = "🏆";

      var mensagemToast = document.createElement("span");
      mensagemToast.className = "achievement-toast-message";
      mensagemToast.textContent = "Conquista desbloqueada: " + conquista.nome;

      var link = document.createElement("a");
      link.className = "achievement-toast-link";
      link.href = "perfil.html";
      link.textContent = "Ver no perfil";

      toast.textContent = "";
      toast.appendChild(icone);
      toast.appendChild(mensagemToast);
      toast.appendChild(link);
      toast.hidden = false;

      indice++;
      window.setTimeout(mostrarProxima, 2800);
    }

    mostrarProxima();
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

  document.getElementById("today-date").textContent = diaHoje + " de " +
    meses[mesHoje - 1] + " de " + anoHoje;
  mostrarJogo();
}

if (nomeUsuario != null && nomeUsuario != "") {
  document.getElementById("header-user").textContent = "Olá, " + nomeUsuario;
  document.getElementById("header-user").hidden = false;
  document.querySelector(".logout-button").hidden = false;
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
