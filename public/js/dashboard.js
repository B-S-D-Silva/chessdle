let mensagemDashboard = document.querySelector("#mensagem-dashboard");
let botaoAtualizar = document.querySelector("#atualizar-dashboard");

function percentual(numero) {
    return `${Number(numero).toFixed(1).replace(".", ",")}%`;
}

function mostrarIndicadores(dados) {
    document.querySelector("#kpi-tentativas").textContent = dados.tentativas;
    document.querySelector("#kpi-media").textContent = "—";
    document.querySelector("#kpi-melhor").textContent = "—";
    document.querySelector("#kpi-evolucao").textContent = "—";

    if (dados.tentativas > 0) {
        document.querySelector("#kpi-media").textContent = percentual(dados.mediaAcertos);
        document.querySelector("#kpi-melhor").textContent = percentual(dados.melhorResultado);
    }

    if (dados.evolucao !== null) {
        let prefixo = "";

        if (dados.evolucao > 0) {
            prefixo = "+";
        }

        document.querySelector("#kpi-evolucao").textContent = `${prefixo}${Number(dados.evolucao).toFixed(1).replace(".", ",")} p.p.`;
    }
}

function mostrarGrafico(tentativas, total) {
    let html = `<desc id="descricao-grafico">Percentuais das últimas tentativas. Todos os valores estão na tabela abaixo.</desc>`;

    for (let i = 0; i <= 2; i++) {
        let valor = i * 50;
        let y = 225 - valor * 2;
        html = `${html}
            <line class="linha-grafico" x1="45" y1="${y}" x2="625" y2="${y}"></line>
            <text class="rotulo-grafico" x="5" y="${y + 5}">${valor}%</text>`;
    }

    let espaco = 570 / tentativas.length;

    for (let i = 0; i < tentativas.length; i++) {
        let taxa = Number(tentativas[i].percentual);
        let altura = taxa * 2;
        let x = 50 + i * espaco;
        let y = 225 - altura;
        let largura = espaco * 0.65;
        let numero = total - tentativas.length + i + 1;

        html = `${html}
            <rect class="barra-grafico" x="${x}" y="${y}" width="${largura}" height="${altura}">
                <title>Tentativa ${numero}: ${percentual(taxa)}</title>
            </rect>
            <text class="rotulo-grafico" x="${x}" y="${y - 8}">${percentual(taxa)}</text>
            <text class="rotulo-grafico" x="${x}" y="250">#${numero}</text>`;
    }

    document.querySelector("#grafico-quiz").innerHTML = html;
}

function mostrarHistorico(tentativas, total) {
    let tabela = document.querySelector("#historico-quiz");
    tabela.innerHTML = "";

    for (let i = tentativas.length - 1; i >= 0; i--) {
        let tentativa = tentativas[i];
        let data = new Date(tentativa.data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        let valores = [total - tentativas.length + i + 1, data, `${tentativa.acertos} de ${tentativa.total}`, percentual(tentativa.percentual)];
        let linha = document.createElement("tr");

        for (let j = 0; j < valores.length; j++) {
            let celula = document.createElement("td");
            celula.textContent = valores[j];
            linha.appendChild(celula);
        }

        tabela.appendChild(linha);
    }
}

function mostrarRevisao(perguntas) {
    let lista = document.querySelector("#lista-revisao");
    lista.innerHTML = "";

    if (perguntas.length === 0) {
        let item = document.createElement("li");
        item.textContent = "Nenhum erro registrado. Belo jogo!";
        lista.appendChild(item);
    } else {
        for (let i = 0; i < perguntas.length; i++) {
            let pergunta = perguntas[i];
            let item = document.createElement("li");
            item.textContent = `${pergunta.enunciado} — ${pergunta.erros} erro(s) em ${pergunta.respostas} resposta(s).`;
            lista.appendChild(item);
        }
    }
}

function mostrarDashboard(dados) {
    mostrarIndicadores(dados.resumo);

    if (dados.resumo.tentativas === 0) {
        mensagemDashboard.textContent = "Seu caderno ainda está em branco. Conclua o quiz para registrar seu primeiro resultado.";
        document.querySelector("#conteudo-dashboard").hidden = true;
    } else {
        mensagemDashboard.textContent = "";
        document.querySelector("#conteudo-dashboard").hidden = false;
        mostrarGrafico(dados.recentes, dados.resumo.tentativas);
        mostrarHistorico(dados.recentes, dados.resumo.tentativas);
        mostrarRevisao(dados.revisao);
    }

    botaoAtualizar.disabled = false;
}

function carregarDashboard() {
    botaoAtualizar.disabled = true;
    mensagemDashboard.textContent = "Carregando seu desempenho…";

    fetch("/quiz/dashboard", { cache: "no-store" }).then(function (resposta) {
        if (resposta.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        let tipo = resposta.headers.get("content-type");

        if (!resposta.ok || !tipo || tipo.indexOf("application/json") === -1) {
            mensagemDashboard.textContent = "Não foi possível carregar seu desempenho. Confira se o servidor foi atualizado e tente novamente.";
            botaoAtualizar.disabled = false;
            return;
        }

        resposta.json().then(mostrarDashboard, function () {
            mensagemDashboard.textContent = "Não foi possível ler os resultados. Tente novamente.";
            botaoAtualizar.disabled = false;
        });
    }, function () {
        mensagemDashboard.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        botaoAtualizar.disabled = false;
    });
}

botaoAtualizar.onclick = carregarDashboard;
carregarDashboard();
