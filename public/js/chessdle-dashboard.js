(function() {
  var usuario = sessionStorage.getItem("NOME_USUARIO");
  var usuarioId = Number(sessionStorage.getItem("ID_USUARIO"));
  var partidaId = new URLSearchParams(window.location.search).get("id");
  var nomesModos = ["jogador", "abertura", "citacao"];
  var rotulosModos = {
    jogador: "Jogador",
    abertura: "Abertura",
    citacao: "Citação"
  };
  var chartStatus = document.getElementById("chart-status");

  document.getElementById("header-user").textContent = "Olá, " + (usuario || "jogador");

  function exibirErro(mensagem) {
    console.error(mensagem);
    chartStatus.textContent = mensagem;
    chartStatus.className = "chart-status chart-error";
  }

  function validarResultados(resultados) {
    if (!Array.isArray(resultados) || resultados.length != nomesModos.length) {
      return false;
    }
    return resultados.every(function(resultado, indice) {
      return resultado && resultado.modo == nomesModos[indice] &&
        Number.isInteger(resultado.tentativas) && resultado.tentativas >= 1 && resultado.tentativas <= 6 &&
        Number.isInteger(resultado.pistas) && resultado.pistas >= 0 && resultado.pistas <= 2 &&
        typeof resultado.acertou == "boolean";
    });
  }

  function renderizarResultado(partida) {
    if (!partida || !validarResultados(partida.resultados)) {
      exibirErro("O servidor retornou um resultado de partida inválido.");
      return;
    }

    if (partida.data) {
      var partesData = partida.data.split("-");
      document.getElementById("result-date").textContent =
        "Finalizado em " + partesData[2] + "/" + partesData[1] + "/" + partesData[0];
    }

    var vitorias = 0;
    var totalTentativas = 0;
    var totalPistas = 0;
    partida.resultados.forEach(function(resultado) {
      if (resultado.acertou) {
        vitorias++;
      }
      totalTentativas += resultado.tentativas;
      totalPistas += resultado.pistas;
    });

    if (typeof Chart == "undefined") {
      exibirErro("Não foi possível carregar o Chart.js. Verifique sua conexão e recarregue a página.");
    } else {
      Chart.defaults.color = "#a6b3aa";
      Chart.defaults.font.family = "Inter, system-ui, sans-serif";

      new Chart(document.getElementById("attempt-chart"), {
        type: "bar",
        data: {
          labels: partida.resultados.map(function(resultado) {
            return rotulosModos[resultado.modo];
          }),
          datasets: [{
            label: "Tentativas",
            data: partida.resultados.map(function(resultado) {
              return resultado.tentativas;
            }),
            backgroundColor: partida.resultados.map(function(resultado) {
              return resultado.acertou ? "#a3d160" : "#e46f66";
            }),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.72
          }]
        },
        options: {
          indexAxis: "y",
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  var resultado = partida.resultados[context.dataIndex];
                  return context.parsed.x + " de 6 tentativas · " +
                    (resultado.acertou ? "acertou" : "não acertou");
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 6,
              ticks: { stepSize: 1, precision: 0 },
              grid: { color: "rgba(255, 255, 255, .08)" }
            },
            y: { grid: { display: false } }
          }
        }
      });
      chartStatus.hidden = true;
    }

    var mediaTentativas = (totalTentativas / partida.resultados.length).toFixed(1).replace(".", ",");
    var resumo = document.getElementById("results-summary");
    [
      [vitorias + "/3", "desafios acertados"],
      [mediaTentativas, "tentativas por desafio, em média"],
      [String(totalPistas), "pistas reveladas"]
    ].forEach(function(metrica) {
      var item = document.createElement("div");
      item.className = "summary-item";
      var valor = document.createElement("strong");
      valor.textContent = metrica[0];
      var rotulo = document.createElement("span");
      rotulo.textContent = metrica[1];
      item.appendChild(valor);
      item.appendChild(rotulo);
      resumo.appendChild(item);
    });
  }

  if (!partidaId || !/^\d+$/.test(partidaId) || !Number.isSafeInteger(usuarioId) || usuarioId < 1) {
    exibirErro("Não foi possível identificar a partida salva. Volte ao jogo e conclua os desafios novamente.");
    return;
  }

  fetch("/partidas/" + encodeURIComponent(partidaId) +
      "?usuarioId=" + encodeURIComponent(usuarioId), { cache: "no-store" })
    .then(function(resposta) {
      if (!resposta.ok) {
        throw new Error("Não foi possível carregar a partida salva (HTTP " + resposta.status + ").");
      }
      return resposta.json();
    })
    .then(renderizarResultado)
    .catch(function(erro) {
      exibirErro(erro.message);
    });
})();
