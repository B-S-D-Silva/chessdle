let mensagemDashboard = document.querySelector("#mensagem-dashboard");
let botaoAtualizar = document.querySelector("#atualizar-dashboard");
let tabela = document.querySelector("#historico-quiz");
let grafico = document.querySelector("#grafico-quiz");
let revisao = document.querySelector("#lista-revisao");

function mostrarResumo(resumo) {
    document.querySelector("#kpi-tentativas").textContent = resumo.tentativas;
    document.querySelector("#kpi-media").textContent = "—";
    document.querySelector("#kpi-melhor").textContent = "—";
    document.querySelector("#kpi-evolucao").textContent = "—";

    if (resumo.tentativas > 0) {
        document.querySelector("#kpi-media").textContent = `${Number(resumo.mediaAcertos).toFixed(1)}%`;
        document.querySelector("#kpi-melhor").textContent = `${Number(resumo.melhorResultado).toFixed(1)}%`;
    }
    if (resumo.evolucao !== null) {
        document.querySelector("#kpi-evolucao").textContent = `${Number(resumo.evolucao).toFixed(1)} p.p.`;
    }

    document.querySelector("#conteudo-dashboard").hidden = resumo.tentativas === 0;
    mensagemDashboard.textContent = "";
    if (resumo.tentativas === 0) {
        mensagemDashboard.textContent = "Conclua o quiz para registrar seu primeiro resultado.";
    }
}

function listarTentativas(tentativas, total) {
    tabela.innerHTML = "";
    grafico.innerHTML = `<desc id="descricao-grafico">Percentuais das tentativas. Confira os valores na tabela.</desc>`;

    for (let i = 0; i <= 2; i++) {
        let valor = i * 50;
        let altura = 225 - valor * 2;
        grafico.innerHTML += `
            <line class="linha-grafico" x1="45" y1="${altura}" x2="625" y2="${altura}"></line>
            <text class="rotulo-grafico" x="5" y="${altura + 5}">${valor}%</text>`;
    }

    for (let i = 0; i < tentativas.length; i++) {
        let tentativa = tentativas[i];
        let numero = Number(total) - tentativas.length + i + 1;
        let percentual = Number(tentativa.percentual);
        let data = new Date(tentativa.data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        let x = 50 + i * 57;
        let altura = percentual * 2;

        grafico.innerHTML += `
            <rect class="barra-grafico" x="${x}" y="${225 - altura}" width="36" height="${altura}">
                <title>Tentativa ${numero}: ${percentual.toFixed(1)}%</title>
            </rect>
            <text class="rotulo-grafico" x="${x}" y="${217 - altura}">${percentual.toFixed(1)}%</text>
            <text class="rotulo-grafico" x="${x}" y="250">#${numero}</text>`;

        tabela.innerHTML = `
            <tr>
                <td>${numero}</td>
                <td>${data}</td>
                <td>${Number(tentativa.acertos)} de ${Number(tentativa.total)}</td>
                <td>${percentual.toFixed(1)}%</td>
            </tr>${tabela.innerHTML}`;
    }
}

function listarRevisao(perguntas) {
    revisao.innerHTML = "";
    if (perguntas.length === 0) {
        revisao.innerHTML = "<li>Nenhum erro registrado. Belo jogo!</li>";
    }
    for (let i = 0; i < perguntas.length; i++) {
        revisao.innerHTML += `<li id="revisao-${i}"></li>`;
    }
    for (let i = 0; i < perguntas.length; i++) {
        let pergunta = perguntas[i];
        document.querySelector(`#revisao-${i}`).textContent = `${pergunta.enunciado} — ${pergunta.erros} erro(s) em ${pergunta.respostas} resposta(s).`;
    }
}

function carregarDashboard() {
    botaoAtualizar.disabled = true;
    mensagemDashboard.textContent = "Carregando…";

    fetch("/quiz/dashboard", { cache: "no-store" }).then(function (resposta) {
        if (resposta.status === 401) {
            window.location.href = "/login.html";
        } else if (!resposta.ok) {
            botaoAtualizar.disabled = false;
            mensagemDashboard.textContent = "Não foi possível carregar. Tente novamente.";
        } else {
            return resposta.json().then(function (dados) {
                mostrarResumo(dados.resumo);
                listarTentativas(dados.recentes, dados.resumo.tentativas);
                listarRevisao(dados.revisao);
                botaoAtualizar.disabled = false;
            });
        }
    }).catch(function () {
        botaoAtualizar.disabled = false;
        mensagemDashboard.textContent = "Não foi possível carregar. Tente novamente.";
    });
}

botaoAtualizar.onclick = carregarDashboard;
carregarDashboard();
