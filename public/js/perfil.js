(function() {
  var usuarioId = Number(sessionStorage.getItem("ID_USUARIO"));
  var nomeUsuario = sessionStorage.getItem("NOME_USUARIO") || "";
  var profileContent = document.getElementById("profile-content");
  var loginPrompt = document.getElementById("profile-login");
  var form = document.getElementById("profile-form");
  var catalogoIcones = {
    peao: '<path d="M24 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm-4 14-2 7-7 7v3h26v-3l-7-7-2-7M11 41h26v3H11z"/>',
    alvo: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3"/><path d="m24 24 13-13m-6 0h6v6"/>',
    escudo: '<path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11l15-6Z"/><path d="m16 24 5 5 11-12"/>',
    chama: '<path d="M25 4c2 10-4 12-4 19 0 3 2 5 5 5 4 0 6-4 4-9 7 5 10 11 8 17-2 7-8 10-14 9-8-1-14-7-13-15 0-7 5-11 8-15 3-3 4-7 6-11Zm0 21c-1 5-6 7-6 12 0 3 2 5 5 5 3 0 5-2 5-5 0-4-2-7-4-12Z"/>',
    coroa: '<path d="m6 14 10 8 8-13 8 13 10-8-4 25H10L6 14Z"/><path d="M10 34h28M6 42h36"/>',
    torre: '<path d="M12 7h7v7h10V7h7v12h-4v18l5 4v3H11v-3l5-4V19h-4V7Z"/><path d="M16 25h16M16 32h16"/>',
    citacao: '<path d="M8 10h32v23H23l-9 8v-8H8V10Z"/><path d="M17 18h7v8h-7zm10 0h7v8h-7z"/>',
    lupa: '<circle cx="20" cy="20" r="12"/><path d="m29 29 11 11M16 20h8m-4-4v8"/>',
    "tres-pecas": '<path d="M11 39h26v4H11zM15 34h18l-2-5H17l-2 5Zm-2-9h22v4H13zM24 5l4 5-4 5-4-5 4-5Zm-10 7 3 4-3 4-3-4 3-4Zm20 0 3 4-3 4-3-4 3-4Z"/><path d="M18 15h12v14H18zM8 21h10v9H8zm22 0h10v9H30z"/>',
    trofeu: '<path d="M15 7h18v10c0 8-4 13-9 13s-9-5-9-13V7Zm0 4H7v5c0 7 4 10 11 10m15-15h8v5c0 7-4 10-11 10M24 30v8m-8 4h16v-4H16z"/>'
  };

  function formatarData(data) {
    if (typeof data != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return "";
    }
    var partes = data.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function buscarJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function(resposta) {
      if (!resposta.ok) {
        return resposta.text().then(function(texto) {
          throw new Error(texto || "Não foi possível carregar os dados do perfil.");
        });
      }
      return resposta.json();
    });
  }

  function mostrarErro(texto) {
    var mensagem = document.getElementById("profile-message");
    mensagem.textContent = texto;
    mensagem.className = "profile-message error";
  }

  function criarIcone(chave, classe) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("class", classe);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = catalogoIcones[chave] || catalogoIcones.trofeu;
    return svg;
  }

  function criarStatusIcone(desbloqueada) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("class", "achievement-state-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = desbloqueada ?
      '<path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' :
      '<rect x="4" y="9" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 9V6a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/>';
    return svg;
  }

  function criarCartao(conquista) {
    var data = conquista.desbloqueada ? formatarData(conquista.dataDesbloqueio) : "";
    var estado = conquista.desbloqueada ?
      "desbloqueada" + (data ? " em " + data : "") : "bloqueada";
    var cartao = document.createElement("article");
    cartao.className = "achievement-card " +
      (conquista.desbloqueada ? "is-unlocked" : "is-locked");
    cartao.setAttribute("aria-label", conquista.nome + ", " + estado);
    cartao.appendChild(criarIcone(conquista.icone, "achievement-art"));

    var conteudo = document.createElement("div");
    conteudo.className = "achievement-copy";
    var nome = document.createElement("h3");
    nome.textContent = conquista.nome;
    var descricao = document.createElement("p");
    descricao.textContent = conquista.descricao;
    conteudo.appendChild(nome);
    conteudo.appendChild(descricao);

    var status = document.createElement("p");
    status.className = "achievement-status";
    status.appendChild(criarStatusIcone(conquista.desbloqueada));
    var statusTexto = document.createElement("span");
    statusTexto.textContent = conquista.desbloqueada ?
      (data ? "Desbloqueada em " + data : "Desbloqueada") : "Bloqueada";
    status.appendChild(statusTexto);
    conteudo.appendChild(status);
    cartao.appendChild(conteudo);
    return cartao;
  }

  function renderizarConquistas(resposta) {
    if (!resposta || !Array.isArray(resposta.conquistas) || !resposta.resumo) {
      throw new Error("A resposta de conquistas está inválida.");
    }
    var grade = document.getElementById("achievement-grid");
    var desbloqueadas = Number(resposta.resumo.desbloqueadas) || 0;
    var total = Number(resposta.resumo.total) || resposta.conquistas.length;
    grade.textContent = "";
    resposta.conquistas.forEach(function(conquista) {
      grade.appendChild(criarCartao(conquista));
    });

    document.getElementById("achievement-count").textContent =
      desbloqueadas + " de " + total + " conquistas";
    var progresso = document.getElementById("achievement-progress");
    progresso.setAttribute("aria-valuemax", String(total));
    progresso.setAttribute("aria-valuenow", String(desbloqueadas));
    document.getElementById("achievement-progress-fill").style.width =
      (total ? Math.min(100, desbloqueadas / total * 100) : 0) + "%";
    document.getElementById("profile-message").textContent =
      total == 0 ? "Nenhuma conquista disponível no momento." : "";
  }

  function renderizarHistorico(partidas) {
    var lista = document.getElementById("profile-history-list");
    if (!Array.isArray(partidas)) {
      throw new Error("O histórico retornado pelo servidor está inválido.");
    }
    if (partidas.length == 0) {
      var vazio = document.createElement("p");
      vazio.className = "profile-empty";
      vazio.textContent = "Você ainda não concluiu nenhuma partida.";
      lista.replaceChildren(vazio);
      return;
    }

    var nomesModos = { jogador: "Jogador", abertura: "Abertura", citacao: "Citação" };
    var fragmento = document.createDocumentFragment();
    partidas.forEach(function(partida) {
      var cartao = document.createElement("article");
      cartao.className = "profile-game";
      var data = document.createElement("p");
      data.className = "profile-game-date";
      data.textContent = formatarData(String(partida.data)) || String(partida.data);
      cartao.appendChild(data);

      var resultados = document.createElement("div");
      resultados.className = "profile-game-results";
      partida.resultados.forEach(function(resultado) {
        var item = document.createElement("div");
        item.className = "profile-game-result";
        var modo = document.createElement("strong");
        modo.textContent = nomesModos[resultado.modo] || resultado.modo;
        var resumo = document.createElement("span");
        resumo.textContent = (resultado.acertou ? "Acertou" : "Não acertou") +
          " em " + resultado.tentativas +
          (resultado.tentativas == 1 ? " tentativa" : " tentativas") +
          " · " + resultado.pistas + (resultado.pistas == 1 ? " pista" : " pistas");
        item.appendChild(modo);
        item.appendChild(resumo);
        resultados.appendChild(item);
      });
      cartao.appendChild(resultados);
      fragmento.appendChild(cartao);
    });
    lista.replaceChildren(fragmento);
  }

  function carregarPerfil() {
    var urlUsuario = encodeURIComponent(usuarioId);
    return Promise.all([
      buscarJSON("/usuarios/" + urlUsuario + "/perfil"),
      buscarJSON("/partidas/historico/" + urlUsuario),
      buscarJSON("/streak?usuarioId=" + urlUsuario),
      buscarJSON("/conquistas?usuarioId=" + urlUsuario)
    ]).then(function(dados) {
      var perfil = dados[0];
      if (!perfil || Number(perfil.id) != usuarioId) {
        throw new Error("O perfil retornado pelo servidor está inválido.");
      }

      var nome = perfil.nome || nomeUsuario;
      document.getElementById("profile-name").textContent = nome;
      document.getElementById("header-user").textContent = "Olá, " + nome;
      document.getElementById("header-user").hidden = false;
      document.querySelector(".logout-button").hidden = false;
      document.getElementById("profile-avatar").textContent =
        nome.trim().charAt(0).toLocaleUpperCase("pt-BR");
      document.getElementById("profile-description").value = perfil.descricao || "";
      document.getElementById("profile-rating").value =
        perfil.ratingChessCom == null ? "" : perfil.ratingChessCom;

      if (perfil.criadoEm || perfil.dataCadastro) {
        var dataMembro = formatarData(perfil.criadoEm || perfil.dataCadastro);
        if (dataMembro) {
          var membro = document.getElementById("member-since");
          membro.textContent = "Membro desde " + dataMembro;
          membro.hidden = false;
        }
      }

      document.getElementById("profile-streak").textContent =
        new Intl.NumberFormat("pt-BR").format(Number(dados[2].atual) || 0);
      document.getElementById("profile-games").textContent =
        new Intl.NumberFormat("pt-BR").format(dados[1].length);
      renderizarConquistas(dados[3]);
      renderizarHistorico(dados[1]);
      document.getElementById("profile-form-message").textContent = "";
      profileContent.hidden = false;
    });
  }

  if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 || !nomeUsuario) {
    loginPrompt.hidden = false;
    return;
  }

  document.getElementById("header-user").textContent = "Olá, " + nomeUsuario;
  document.getElementById("header-user").hidden = false;
  document.querySelector(".logout-button").hidden = false;

  form.addEventListener("submit", function(evento) {
    evento.preventDefault();
    var descricao = document.getElementById("profile-description").value;
    var valorRating = document.getElementById("profile-rating").value;
    var ratingChessCom = valorRating == "" ? null : Number(valorRating);
    var botao = form.querySelector("button[type=submit]");
    var mensagem = document.getElementById("profile-form-message");
    botao.disabled = true;
    mensagem.textContent = "Salvando...";
    mensagem.className = "profile-message";

    fetch("/usuarios/" + encodeURIComponent(usuarioId) + "/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao: descricao, ratingChessCom: ratingChessCom })
    }).then(function(resposta) {
      if (!resposta.ok) {
        return resposta.text().then(function(texto) {
          throw new Error(texto || "Não foi possível salvar o perfil.");
        });
      }
      return resposta.json();
    }).then(function(perfil) {
      document.getElementById("profile-description").value = perfil.descricao || "";
      document.getElementById("profile-rating").value =
        perfil.ratingChessCom == null ? "" : perfil.ratingChessCom;
      mensagem.textContent = "Perfil salvo com sucesso.";
    }).catch(function(erro) {
      console.error("Não foi possível salvar o perfil.", erro);
      mensagem.textContent = erro.message;
      mensagem.className = "profile-message error";
    }).finally(function() {
      botao.disabled = false;
    });
  });

  carregarPerfil().catch(function(erro) {
    console.error("Não foi possível carregar perfil, histórico e conquistas.", erro);
    profileContent.hidden = false;
    mostrarErro(erro.message || "Não foi possível carregar os dados do perfil.");
    document.getElementById("profile-history-list").textContent = "";
  });
})();
