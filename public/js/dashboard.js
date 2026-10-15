(function() {
  var usuarioId = Number(sessionStorage.getItem("ID_USUARIO"));
  var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");
  var loading = document.getElementById("loading-state");
  var loginPrompt = document.getElementById("login-prompt");
  var errorState = document.getElementById("request-error");
  var errorMessage = errorState.querySelector("p");
  var content = document.getElementById("dashboard-content");
  var periodo = document.getElementById("period-select");
  var graficos = {};
  var localeInteiro = new Intl.NumberFormat("pt-BR");
  var localeDecimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  var nomesModos = {
    jogador: "Adivinhe o jogador",
    abertura: "Adivinhe a abertura",
    citacao: "Citação"
  };
  var cores = {
    verde: "#a3d160",
    verdeEscuro: "#547b3e",
    azul: "#78c7b5",
    texto: "#f0f2ef",
    suave: "#a6b3aa",
    grade: "rgba(255,255,255,.09)"
  };

  if (nomeUsuario) {
    var cabecalhoUsuario = document.getElementById("header-user");
    cabecalhoUsuario.textContent = "Olá, " + nomeUsuario;
    cabecalhoUsuario.hidden = false;
    document.querySelector(".logout-button").hidden = false;
  }

  if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
    loginPrompt.hidden = false;
    return;
  }

  function formatoPercentual(valor) {
    return localeDecimal.format(Number(valor) || 0) + "%";
  }

  function formatoTentativas(valor) {
    return valor == null ? "—" : localeDecimal.format(Number(valor));
  }

  function dataHojeSaoPaulo() {
    var partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var data = {};
    partes.forEach(function(parte) {
      data[parte.type] = parte.value;
    });
    return data.year + "-" + data.month + "-" + data.day;
  }

  function deslocarData(dataTexto, dias) {
    var data = new Date(dataTexto + "T00:00:00Z");
    data.setUTCDate(data.getUTCDate() + dias);
    return data.toISOString().slice(0, 10);
  }

  function dataLegivel(dataTexto) {
    var partes = dataTexto.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function nomeDia(dataTexto) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC"
    }).format(new Date(dataTexto + "T12:00:00Z"));
  }

  function destruirGraficos() {
    Object.keys(graficos).forEach(function(chave) {
      graficos[chave].destroy();
    });
    graficos = {};
  }

  function alternarEstadoGrafico(chave, temDados) {
    document.querySelector('[data-empty="' + chave + '"]').hidden = temDados;
    document.querySelector('[data-plot="' + chave + '"]').hidden = !temDados;
  }

  function limparTabela(id) {
    document.querySelector("#" + id + " tbody").textContent = "";
  }

  function adicionarLinha(id, valores) {
    var linha = document.createElement("tr");
    valores.forEach(function(valor) {
      var celula = document.createElement("td");
      celula.textContent = valor;
      linha.appendChild(celula);
    });
    document.querySelector("#" + id + " tbody").appendChild(linha);
  }

  function opcoesComuns() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : {
        duration: 300
      },
      plugins: {
        legend: {
          labels: { color: cores.text, usePointStyle: true, boxWidth: 8 }
        },
        tooltip: {
          callbacks: {
            label: function(contexto) {
              var valor = contexto.parsed.y;
              if (valor == null) {
                return contexto.dataset.label + ": sem partidas";
              }
              var sufixo = contexto.dataset.yAxisID == "yRate" ? "%" : "";
              return contexto.dataset.label + ": " + localeDecimal.format(valor) + sufixo;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: cores.suave, maxRotation: 0, autoSkip: true },
          grid: { color: cores.grade }
        },
        y: {
          beginAtZero: true,
          ticks: { color: cores.suave, precision: 0 },
          grid: { color: cores.grade }
        }
      }
    };
  }

  function montarTabelaSerie(pontos) {
    limparTabela("series-table");
    pontos.forEach(function(ponto) {
      adicionarLinha("series-table", [
        dataLegivel(ponto.data),
        localeInteiro.format(ponto.partidas),
        localeInteiro.format(ponto.acertos),
        ponto.taxaAcerto == null ? "—" : formatoPercentual(ponto.taxaAcerto),
        formatoTentativas(ponto.mediaTentativas)
      ]);
    });
  }

  function montarSerie(dados, dias) {
    var mapa = {};
    dados.forEach(function(item) {
      mapa[item.data] = item;
    });

    var hoje = dataHojeSaoPaulo();
    var inicio;
    if (dias == "todos") {
      inicio = dados.length ? dados[0].data : hoje;
    } else {
      inicio = deslocarData(hoje, 1 - Number(dias));
    }

    var pontos = [];
    for (var data = inicio; data <= hoje; data = deslocarData(data, 1)) {
      var item = mapa[data];
      pontos.push({
        data: data,
        partidas: item ? item.partidas : 0,
        acertos: item ? item.acertos : 0,
        taxaAcerto: item ? item.taxaAcerto : null,
        mediaTentativas: item ? item.mediaTentativas : null
      });
    }
    return pontos;
  }

  function desenharSerie(dados, dias) {
    var pontos = montarSerie(dados, dias);
    var temDados = dados.length > 0;
    alternarEstadoGrafico("series", temDados);
    montarTabelaSerie(pontos);
    if (!temDados) {
      return;
    }

    var opcoes = opcoesComuns();
    opcoes.interaction = { mode: "index", intersect: false };
    opcoes.scales.y = {
      type: "linear",
      position: "left",
      min: 0,
      max: 100,
      title: { display: true, text: "Taxa de acerto (%)", color: cores.suave },
      ticks: { color: cores.suave, callback: function(valor) { return valor + "%"; } },
      grid: { color: cores.grade }
    };
    opcoes.scales.yTentativas = {
      type: "linear",
      position: "right",
      beginAtZero: true,
      title: { display: true, text: "Tentativas nas vitórias", color: cores.suave },
      ticks: { color: cores.suave, precision: 0 },
      grid: { drawOnChartArea: false }
    };
    opcoes.plugins.tooltip.callbacks.label = function(contexto) {
      var valor = contexto.parsed.y;
      if (valor == null) {
        return contexto.dataset.label + ": sem partidas";
      }
      return contexto.dataset.label + ": " + localeDecimal.format(valor) +
        (contexto.datasetIndex == 0 ? "%" : " tentativas");
    };
    opcoes.plugins.tooltip.callbacks.title = function(contextos) {
      return contextos.length ? dataLegivel(pontos[contextos[0].dataIndex].data) : "";
    };
    opcoes.scales.x.ticks.callback = function(valor, indice) {
      return nomeDia(pontos[indice].data);
    };
    graficos.serie = new Chart(document.getElementById("series-chart"), {
      type: "line",
      data: {
        labels: pontos.map(function(item) { return item.data; }),
        datasets: [
          {
            label: "Taxa de acerto",
            data: pontos.map(function(item) { return item.taxaAcerto; }),
            borderColor: cores.verde,
            backgroundColor: "rgba(163,209,96,.16)",
            pointBackgroundColor: cores.verde,
            pointRadius: 3,
            tension: .25,
            spanGaps: false,
            yAxisID: "y"
          },
          {
            label: "Média de tentativas nas vitórias",
            data: pontos.map(function(item) { return item.mediaTentativas; }),
            borderColor: cores.azul,
            backgroundColor: "rgba(120,199,181,.12)",
            pointBackgroundColor: cores.azul,
            pointRadius: 3,
            tension: .25,
            spanGaps: false,
            yAxisID: "yTentativas"
          }
        ]
      },
      options: opcoes
    });
  }

  function desenharDistribuicao(dados) {
    var temDados = dados.some(function(item) { return item.quantidade > 0; });
    alternarEstadoGrafico("distribution", temDados);
    limparTabela("distribution-table");
    dados.forEach(function(item) {
      adicionarLinha("distribution-table", [item.rotulo, localeInteiro.format(item.quantidade)]);
    });
    if (!temDados) {
      return;
    }

    var valores = dados.map(function(item) { return item.quantidade; });
    var maior = Math.max.apply(null, valores);
    var opcoes = opcoesComuns();
    opcoes.plugins.legend.display = false;
    opcoes.plugins.tooltip.callbacks.label = function(contexto) {
      return "Desafios: " + localeInteiro.format(contexto.parsed.y);
    };
    opcoes.scales.x.ticks.maxRotation = 35;
    graficos.distribuicao = new Chart(document.getElementById("distribution-chart"), {
      type: "bar",
      data: {
        labels: dados.map(function(item) { return item.rotulo; }),
        datasets: [{
          label: "Desafios",
          data: valores,
          backgroundColor: valores.map(function(valor) {
            return valor > 0 && valor == maior ? cores.verde : cores.verdeEscuro;
          }),
          borderColor: valores.map(function(valor) {
            return valor > 0 && valor == maior ? "#d5f2a7" : "#76a94c";
          }),
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: opcoes
    });
  }

  function desenharModos(dados) {
    var temDados = dados.some(function(item) { return item.partidas > 0; });
    alternarEstadoGrafico("modes", temDados);
    limparTabela("modes-table");
    dados.forEach(function(item) {
      adicionarLinha("modes-table", [
        nomesModos[item.modo],
        localeInteiro.format(item.partidas),
        localeInteiro.format(item.acertos),
        formatoPercentual(item.taxaAcerto)
      ]);
    });
    if (!temDados) {
      return;
    }

    var opcoes = opcoesComuns();
    opcoes.plugins.legend.display = false;
    opcoes.plugins.tooltip.callbacks.label = function(contexto) {
      return "Taxa de acerto: " + formatoPercentual(contexto.parsed.y);
    };
    opcoes.scales.y.max = 100;
    opcoes.scales.y.ticks.callback = function(valor) { return valor + "%"; };
    graficos.modos = new Chart(document.getElementById("modes-chart"), {
      type: "bar",
      data: {
        labels: dados.map(function(item) { return nomesModos[item.modo]; }),
        datasets: [{
          label: "Taxa de acerto",
          data: dados.map(function(item) { return item.taxaAcerto; }),
          backgroundColor: [cores.verde, cores.azul, "#d9b65b"],
          borderColor: [cores.verde, cores.azul, "#f0d27c"],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: opcoes
    });
  }

  function desenharAtividade(dados) {
    var grade = document.getElementById("activity-grid");
    var mapa = {};
    var total = 0;
    dados.forEach(function(item) {
      mapa[item.data] = item.partidas;
      total += item.partidas;
    });

    var temDados = total > 0;
    alternarEstadoGrafico("activity", temDados);
    limparTabela("activity-table");
    if (!temDados) {
      grade.textContent = "";
      return;
    }

    var hoje = dataHojeSaoPaulo();
    var diaSemana = new Date(hoje + "T00:00:00Z").getUTCDay();
    var diasDesdeSegunda = (diaSemana + 6) % 7;
    var inicio = deslocarData(hoje, -(diasDesdeSegunda + 77));
    var maior = 0;
    for (var dia = 0; dia < 84; dia++) {
      maior = Math.max(maior, mapa[deslocarData(inicio, dia)] || 0);
    }
    grade.textContent = "";

    for (var indice = 0; indice < 84; indice++) {
      var data = deslocarData(inicio, indice);
      var quantidade = mapa[data] || 0;
      var celula = document.createElement("div");
      var nivel = quantidade == 0 ? 0 : quantidade == maior ? 3 :
        quantidade >= Math.ceil(maior * .67) ? 2 : 1;
      celula.className = "activity-cell level-" + nivel;
      celula.setAttribute("role", "gridcell");
      celula.title = dataLegivel(data) + ": " + localeInteiro.format(quantidade) +
        (quantidade == 1 ? " partida" : " partidas");
      celula.setAttribute("aria-label", celula.title);
      if (data > hoje) {
        celula.className = "activity-cell";
        celula.removeAttribute("aria-label");
        celula.removeAttribute("title");
        celula.setAttribute("aria-hidden", "true");
      } else {
        adicionarLinha("activity-table", [dataLegivel(data), localeInteiro.format(quantidade)]);
      }
      grade.appendChild(celula);
    }
  }

  function atualizarResumo(resumo) {
    document.getElementById("summary-games").textContent = localeInteiro.format(resumo.partidas);
    document.getElementById("summary-rate").textContent = formatoPercentual(resumo.taxaAcerto);
    document.getElementById("summary-attempts").textContent =
      formatoTentativas(resumo.mediaTentativasVitorias);
    document.getElementById("summary-streak").textContent =
      localeInteiro.format(resumo.sequenciaAtual) + " dias";
    document.getElementById("summary-best-streak").textContent =
      localeInteiro.format(resumo.maiorSequencia) + " dias";
  }

  function carregarEstatisticas() {
    destruirGraficos();
    content.hidden = true;
    errorState.hidden = true;
    loading.hidden = false;

    fetch("/estatisticas?usuarioId=" + encodeURIComponent(usuarioId) +
      "&dias=" + encodeURIComponent(periodo.value), { cache: "no-store" })
      .then(function(resposta) {
        if (!resposta.ok) {
          return resposta.text().then(function(texto) {
            throw new Error(texto || "A requisição de estatísticas falhou (" + resposta.status + ").");
          });
        }
        return resposta.json();
      })
      .then(function(dados) {
        if (typeof Chart == "undefined") {
          throw new Error("A biblioteca Chart.js não foi carregada. Verifique sua conexão e tente novamente.");
        }
        atualizarResumo(dados.resumo);
        content.hidden = false;
        desenharSerie(dados.serie, periodo.value);
        desenharDistribuicao(dados.distribuicao);
        desenharModos(dados.porModo);
        desenharAtividade(dados.atividade);
        loading.hidden = true;
      })
      .catch(function(erro) {
        console.error("Não foi possível carregar o dashboard de desempenho.", erro);
        loading.hidden = true;
        content.hidden = true;
        errorMessage.textContent = erro.message || "Não foi possível carregar suas estatísticas agora.";
        errorState.hidden = false;
      });
  }

  periodo.addEventListener("change", carregarEstatisticas);
  document.getElementById("retry-button").addEventListener("click", carregarEstatisticas);
  carregarEstatisticas();
})();
