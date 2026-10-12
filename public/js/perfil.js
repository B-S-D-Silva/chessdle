(function() {
  var usuarioId = Number(sessionStorage.getItem("ID_USUARIO"));
  var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");
  var form = document.getElementById("profile-form");

  document.getElementById("header-user").textContent = "Olá, " + nomeUsuario;

  function escaparHTML(texto) {
    return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function mostrarMensagem(texto, erro) {
    var mensagem = document.getElementById("profile-message");
    mensagem.textContent = texto;
    mensagem.className = erro ? "profile-message error" : "profile-message";
  }

  function renderizarHistorico(partidas) {
    var lista = document.getElementById("profile-history-list");
    if (!Array.isArray(partidas)) {
      throw new Error("O histórico retornado pelo servidor está inválido.");
    }
    if (partidas.length == 0) {
      lista.innerHTML = '<p class="profile-empty">Você ainda não concluiu nenhuma partida.</p>';
      return;
    }

    var nomesModos = { jogador: "Jogador", abertura: "Abertura", citacao: "Citação" };
    var html = "";
    partidas.forEach(function(partida) {
      var partesData = String(partida.data).split("-");
      var dataFormatada = partesData.length == 3 ?
        partesData[2] + "/" + partesData[1] + "/" + partesData[0] : partida.data;
      html += '<article class="profile-game"><p class="profile-game-date">' +
        escaparHTML(dataFormatada) + '</p><div class="profile-game-results">';
      partida.resultados.forEach(function(resultado) {
        var situacao = resultado.acertou ? "Acertou" : "Não acertou";
        html += '<div class="profile-game-result"><strong>' +
          escaparHTML(nomesModos[resultado.modo] || resultado.modo) +
          '</strong><span>' + situacao + " em " + escaparHTML(resultado.tentativas) +
          (resultado.tentativas == 1 ? " tentativa" : " tentativas") +
          " · " + escaparHTML(resultado.pistas) +
          (resultado.pistas == 1 ? " pista" : " pistas") + "</span></div>";
      });
      html += "</div></article>";
    });
    lista.innerHTML = html;
  }

  function carregarPerfil() {
    var lista = document.getElementById("profile-history-list");
    mostrarMensagem("Carregando perfil...", false);

    return Promise.all([
      fetch("/usuarios/" + encodeURIComponent(usuarioId) + "/perfil", { cache: "no-store" }),
      fetch("/partidas/historico/" + encodeURIComponent(usuarioId), { cache: "no-store" })
    ]).then(function(respostas) {
      if (!respostas[0].ok || !respostas[1].ok) {
        return Promise.all(respostas.map(function(resposta) {
          return resposta.ok ? resposta.json() : resposta.text().then(function(texto) {
            throw new Error(texto || "Não foi possível carregar os dados do perfil.");
          });
        }));
      }
      return Promise.all(respostas.map(function(resposta) { return resposta.json(); }));
    }).then(function(dados) {
      var perfil = dados[0];
      if (!perfil || perfil.id != usuarioId) {
        throw new Error("O perfil retornado pelo servidor está inválido.");
      }
      document.getElementById("profile-description").value = perfil.descricao || "";
      document.getElementById("profile-rating").value =
        perfil.ratingChessCom == null ? "" : perfil.ratingChessCom;
      mostrarMensagem("", false);
      renderizarHistorico(dados[1]);
    }).catch(function(erro) {
      console.error("Não foi possível carregar perfil e histórico.", erro);
      mostrarMensagem(erro.message, true);
      lista.innerHTML = '<p class="profile-empty">Não foi possível carregar o histórico. Tente novamente.</p>';
    });
  }

  form.onsubmit = function(evento) {
    evento.preventDefault();
    var descricao = document.getElementById("profile-description").value;
    var valorRating = document.getElementById("profile-rating").value;
    var ratingChessCom = valorRating == "" ? null : Number(valorRating);
    var botao = form.querySelector("button[type=submit]");
    botao.disabled = true;
    mostrarMensagem("Salvando...", false);

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
      mostrarMensagem("Perfil salvo com sucesso.", false);
    }).catch(function(erro) {
      console.error("Não foi possível salvar o perfil.", erro);
      mostrarMensagem(erro.message, true);
    }).finally(function() {
      botao.disabled = false;
    });
  };

  carregarPerfil();
})();
