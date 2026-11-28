let areaQuestoes = document.querySelector("#questoes");
let formularioQuiz = document.querySelector("#form-quiz");
let avisoQuiz = document.querySelector("#aviso-quiz");
let resultadoQuiz = document.querySelector("#resultado");
let botaoCorrigir = document.querySelector("#corrigir");
let botaoReiniciar = document.querySelector("#reiniciar");
let respostas = [];
let chaveTentativa = "";

function iniciarQuiz() {
    chaveTentativa = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
    areaQuestoes.innerHTML = "";
    avisoQuiz.textContent = "";
    resultadoQuiz.hidden = true;
    botaoCorrigir.hidden = false;
    botaoReiniciar.hidden = true;

    for (let i = 0; i < questoes.length; i++) {
        let pergunta = questoes[i];
        let alternativas = "";

        for (let j = 0; j < pergunta.alternativas.length; j++) {
            alternativas += `
                <label class="opcao" id="opcao-${i}-${j}">
                    <input type="radio" name="questao-${i}" value="${j}" required>
                    ${pergunta.alternativas[j]}
                </label>`;
        }

        areaQuestoes.innerHTML += `
            <fieldset class="questao">
                <legend>${i + 1}. ${pergunta.enunciado}</legend>
                ${alternativas}
                <p class="explicacao" id="explicacao-${i}"></p>
            </fieldset>`;
    }
}

function bloquearQuiz(bloqueado) {
    botaoCorrigir.disabled = bloqueado;
    botaoReiniciar.disabled = bloqueado;
    let alternativas = areaQuestoes.querySelectorAll("input");

    for (let i = 0; i < alternativas.length; i++) {
        alternativas[i].disabled = bloqueado;
    }
}

function mostrarResultado(dados) {
    for (let i = 0; i < questoes.length; i++) {
        let pergunta = questoes[i];
        let correta = pergunta.respostaCorreta;
        let explicacao = document.querySelector(`#explicacao-${i}`);

        document.querySelector(`#opcao-${i}-${correta}`).className = "opcao correta";

        if (respostas[i] === correta) {
            explicacao.textContent = `Você acertou. ${pergunta.explicacao}`;
        } else {
            document.querySelector(`#opcao-${i}-${respostas[i]}`).className = "opcao incorreta";
            explicacao.textContent = `Resposta correta: ${pergunta.alternativas[correta]}. ${pergunta.explicacao}`;
        }
    }

    avisoQuiz.textContent = "";
    document.querySelector("#titulo-resultado").textContent = `${dados.acertos} de ${questoes.length} respostas certas.`;
    document.querySelector("#texto-resultado").textContent = "Resultado salvo. Confira as explicações ou abra o dashboard.";
    resultadoQuiz.hidden = false;
    botaoCorrigir.hidden = true;
    botaoReiniciar.disabled = false;
    botaoReiniciar.hidden = false;
    resultadoQuiz.focus();
}

function enviarQuiz(evento) {
    evento.preventDefault();
    if (botaoCorrigir.disabled) {
        return;
    }
    respostas = [];

    for (let i = 0; i < questoes.length; i++) {
        let resposta = document.querySelector(`input[name="questao-${i}"]:checked`);
        if (!resposta) {
            avisoQuiz.textContent = "Responda todas as perguntas.";
            return;
        }
        respostas.push(Number(resposta.value));
    }

    bloquearQuiz(true);
    avisoQuiz.textContent = "Salvando seu resultado…";

    let dados = { respostas: respostas, chaveTentativa: chaveTentativa };

    fetch("/quiz/resultados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    }).then(function (resposta) {
        if (resposta.status === 401) {
            window.location.href = "/login.html";
            return;
        }
        return resposta.json().then(function (dados) {
            if (resposta.ok) {
                mostrarResultado(dados);
            } else {
                bloquearQuiz(false);
                avisoQuiz.textContent = dados.mensagem;
                if (resposta.status === 409) {
                    botaoReiniciar.hidden = false;
                }
            }
        });
    }).catch(function () {
        bloquearQuiz(false);
        avisoQuiz.textContent = "Não foi possível salvar. Tente novamente.";
    });
}

formularioQuiz.onsubmit = enviarQuiz;
botaoReiniciar.onclick = function () {
    bloquearQuiz(false);
    iniciarQuiz();
    areaQuestoes.querySelector("input").focus();
};
iniciarQuiz();
