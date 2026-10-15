(function() {
  var botao = document.getElementById("streak-button");
  var widget = document.getElementById("streak-widget");
  var popover = document.getElementById("streak-popover");
  var contador = document.getElementById("streak-count");
  var atual = document.getElementById("streak-current");
  var maior = document.getElementById("streak-best");
  var semana = document.getElementById("streak-week");
  var mensagem = document.getElementById("streak-message");
  var fechado = document.getElementById("streak-close");
  var usuarioId = sessionStorage.getItem("ID_USUARIO");
  var conclusaoRecebida = false;

  function abrirPopover(aberto) {
    popover.hidden = !aberto;
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
  }

  function criarDia(dia) {
    var item = document.createElement("span");
    var descricao = dia.data.slice(8, 10) + "/" + dia.data.slice(5, 7);
    item.className = "streak-day" + (dia.jogou ? " played" : "") + (dia.hoje ? " today" : "");
    item.setAttribute("aria-label", descricao + (dia.jogou ? ", desafio concluído" : ", sem desafio concluído"));
    item.title = descricao;

    if (dia.jogou) {
      item.innerHTML = '<svg viewBox="0 0 32 40" aria-hidden="true" focusable="false">' +
        '<path d="M17.4 1.5c1.2 7.6-1.1 10.5-4.6 14.1-2.2 2.3-3.8 4.8-3.8 8.3a7 7 0 0 0 14 0c0-2.8-1.2-5.2-3.2-7.6 6.4 2.7 10.1 8.1 10.1 14.1A13.9 13.9 0 0 1 16 44.3 13.9 13.9 0 0 1 2.1 30.4c0-7.6 4.1-12.5 8.8-17.2 2.7-2.7 5.1-6.1 6.5-11.7Z" transform="translate(0 -4)"/>' +
        '</svg>';
    } else {
      item.textContent = dia.data.slice(8, 10);
    }
    semana.appendChild(item);
  }

  function atualizar(sequencia, animar) {
    var classe = sequencia.jogouHoje ? "guaranteed" : sequencia.emRisco ? "risk" : "zero";
    var dias = Array.isArray(sequencia.dias) ? sequencia.dias : [];

    botao.className = "streak-button " + classe;
    contador.textContent = String(sequencia.atual);
    atual.textContent = String(sequencia.atual);
    maior.textContent = String(sequencia.maior);
    botao.setAttribute("aria-label", sequencia.jogouHoje ?
      "Sequência de " + sequencia.atual + " dias, garantida hoje" :
      sequencia.emRisco ? "Sequência de " + sequencia.atual + " dias, em risco: ainda não jogou hoje" :
        "Sequência de " + sequencia.atual + " dias");

    semana.textContent = "";
    dias.forEach(criarDia);

    if (!usuarioId) {
      mensagem.textContent = "";
      var convite = document.createElement("a");
      convite.className = "streak-login-link";
      convite.href = "login.html";
      convite.textContent = "Entre para salvar sua sequência.";
      mensagem.appendChild(convite);
    } else if (sequencia.jogouHoje) {
      mensagem.textContent = "Sequência garantida hoje!";
    } else if (sequencia.emRisco) {
      mensagem.textContent = "Conclua um desafio hoje para manter sua sequência!";
    } else {
      mensagem.textContent = "Conclua um desafio hoje para começar sua sequência!";
    }

    if (animar) {
      botao.classList.remove("streak-animate");
      void botao.offsetWidth;
      botao.classList.add("streak-animate");
      window.setTimeout(function() {
        botao.classList.remove("streak-animate");
      }, 800);
    }
  }

  function mostrarErro(texto) {
    mensagem.textContent = texto;
    abrirPopover(true);
  }

  botao.addEventListener("click", function() {
    abrirPopover(popover.hidden);
  });
  fechado.addEventListener("click", function() {
    abrirPopover(false);
    botao.focus();
  });
  document.addEventListener("click", function(evento) {
    if (!widget.contains(evento.target)) {
      abrirPopover(false);
    }
  });
  document.addEventListener("keydown", function(evento) {
    if (evento.key == "Escape" && !popover.hidden) {
      abrirPopover(false);
      botao.focus();
    }
  });

  window.ChessdleStreak = {
    atualizar: function(sequencia, animar) {
      conclusaoRecebida = true;
      atualizar(sequencia, animar || Number(sequencia.atual) > Number(contador.textContent));
    },
    mostrarErro: mostrarErro
  };

  var estadoInicial = {
    atual: 0,
    maior: 0,
    ultimaData: null,
    jogouHoje: false,
    emRisco: false,
    dias: []
  };
  atualizar(estadoInicial, false);

  if (usuarioId) {
    fetch("/streak?usuarioId=" + encodeURIComponent(usuarioId), { cache: "no-store" })
      .then(function(resposta) {
        if (!resposta.ok) {
          return resposta.text().then(function(texto) {
            throw new Error(texto || "Não foi possível carregar a sequência.");
          });
        }
        return resposta.json();
      })
      .then(function(sequencia) {
        if (!conclusaoRecebida) {
          atualizar(sequencia, false);
        }
      })
      .catch(function(erro) {
        console.error("Não foi possível carregar a sequência de dias.", erro);
        mensagem.textContent = "Não foi possível carregar sua sequência. Recarregue a página para tentar novamente.";
      });
  }
})();
