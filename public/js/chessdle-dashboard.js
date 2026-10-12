(function() {
  var usuario = sessionStorage.getItem("NOME_USUARIO");
  var dadosSalvos = sessionStorage.getItem("CHESSDLE_RESULTADO");
  var dados;

  try {
    dados = JSON.parse(dadosSalvos);
  } catch (erro) {
    console.error("Os dados do resultado do Chessdle estão inválidos.", erro);
    window.location.replace("../index.html");
    return;
  }

  if (!dados || !Array.isArray(dados.resultados) || dados.resultados.length != 3) {
    window.location.replace("../index.html");
    return;
  }

  var nomesEsperados = ["Jogador", "Abertura", "Citação"];
  var vitorias = 0;
  var totalTentativas = 0;
  var totalPistas = 0;
  var canvas = document.getElementById("attempt-chart");
  var resultadoValido = true;

  document.getElementById("header-user").textContent = "Olá, " + usuario;

  dados.resultados.forEach(function(resultado, indice) {
    if (!resultado || resultado.modo != nomesEsperados[indice] ||
        !Number.isInteger(resultado.tentativas) || resultado.tentativas < 1 || resultado.tentativas > 6 ||
        !Number.isInteger(resultado.pistas) || resultado.pistas < 0 || resultado.pistas > 2 ||
        typeof resultado.acertou != "boolean") {
      resultadoValido = false;
    }
  });

  if (!resultadoValido) {
    window.location.replace("../index.html");
    return;
  }

  if (dados.data) {
    var partesData = dados.data.split("-");
    document.getElementById("result-date").textContent =
      "Finalizado em " + partesData[2] + "/" + partesData[1] + "/" + partesData[0];
  }

  dados.resultados.forEach(function(resultado) {
    if (resultado.acertou) {
      vitorias++;
    }
    totalTentativas += resultado.tentativas;
    totalPistas += resultado.pistas;
  });

  if (typeof Chart == "undefined") {
    console.error("Não foi possível carregar o Chart.js para exibir o gráfico.");
    var chartError = document.getElementById("chart-error");
    chartError.textContent = "Não foi possível carregar o gráfico. Verifique sua conexão e recarregue a página.";
    chartError.hidden = false;
  } else {
    Chart.defaults.color = "#a6b3aa";
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: dados.resultados.map(function(resultado) {
          return resultado.modo;
        }),
        datasets: [{
          label: "Tentativas",
          data: dados.resultados.map(function(resultado) {
            return resultado.tentativas;
          }),
          backgroundColor: dados.resultados.map(function(resultado) {
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
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                var resultado = dados.resultados[context.dataIndex];
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
            ticks: {
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: "rgba(255, 255, 255, .08)"
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  var mediaTentativas = (totalTentativas / dados.resultados.length).toFixed(1).replace(".", ",");
  var resumo = document.getElementById("results-summary");
  var metricas = [
    [vitorias + "/3", "desafios acertados"],
    [mediaTentativas, "tentativas por desafio, em média"],
    [String(totalPistas), "pistas reveladas"]
  ];

  metricas.forEach(function(metrica) {
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

  document.getElementById("restart-game").addEventListener("click", function() {
    sessionStorage.removeItem("CHESSDLE_RESULTADO");
  });
})();
