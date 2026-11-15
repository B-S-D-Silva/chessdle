let areaQuestoes = document.querySelector("#questoes");
let formularioQuiz = document.querySelector("#form-quiz");
let resultadoQuiz = document.querySelector("#resultado");
let avisoQuiz = document.querySelector("#aviso-quiz");
let botaoCorrigir = document.querySelector("#corrigir");
let botaoReiniciar = document.querySelector("#reiniciar");
let chaveTentativa = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;

function mostrarQuestoes() {
    let html = "";

    for (let i = 0; i < questoes.length; i++) {
        html = `${html}
            <fieldset class="questao">
                <legend>${i + 1}. ${questoes[i].enunciado}</legend>`;

        for (let j = 0; j < questoes[i].alternativas.length; j++) {
            html = `${html}
                <label class="opcao">
                    <input type="radio" name="questao-${i}" value="${j}" required>
                    ${questoes[i].alternativas[j]}
                </label>`;
        }

        html = `${html}
                <p class="explicacao" hidden></p>
            </fieldset>`;
    }

    areaQuestoes.innerHTML = html;
}

function corrigirRespostas(resultadoSalvo) {
    let acertos = resultadoSalvo.acertos;
    let grupos = areaQuestoes.querySelectorAll("fieldset");

    for (let i = 0; i < questoes.length; i++) {
        let resposta = formularioQuiz.querySelector(`input[name="questao-${i}"]:checked`);

        if (!resposta) {
            avisoQuiz.innerHTML = "Responda todas as perguntas.";
            return;
        }
    }

    for (let i = 0; i < questoes.length; i++) {
        let resposta = formularioQuiz.querySelector(`input[name="questao-${i}"]:checked`);
        let escolha = Number(resposta.value);
        let correta = questoes[i].respostaCorreta;
        let opcoes = grupos[i].querySelectorAll("label");
        let explicacao = grupos[i].querySelector(".explicacao");

        for (let j = 0; j < opcoes.length; j++) {
            opcoes[j].querySelector("input").disabled = true;

            if (j === correta) {
                opcoes[j].className = "opcao correta";
            } else if (j === escolha) {
                opcoes[j].className = "opcao incorreta";
            }
        }

        if (escolha === correta) {
            explicacao.innerHTML = `Você acertou. ${questoes[i].explicacao}`;
        } else {
            explicacao.innerHTML = `Resposta correta: ${questoes[i].alternativas[correta]}. ${questoes[i].explicacao}`;
        }

        explicacao.hidden = false;
    }

    avisoQuiz.innerHTML = "";
    document.querySelector("#titulo-resultado").innerHTML = `${acertos} de ${questoes.length} respostas certas.`;
    document.querySelector("#texto-resultado").innerHTML = "Resultado salvo no seu histórico. Confira as explicações ou veja seu desempenho no dashboard.";
    resultadoQuiz.hidden = false;
    botaoCorrigir.hidden = true;
    botaoReiniciar.hidden = false;
    resultadoQuiz.focus();
}

function receberResultado(resposta) {
    if (resposta.status === 401) {
        window.location.href = "/login.html";
    } else if (resposta.status === 404) {
        avisoQuiz.innerHTML = "O servidor está desatualizado. Reinicie a aplicação e entre novamente.";
    } else {
        let tipo = resposta.headers.get("content-type");

        if (tipo && tipo.indexOf("application/json") !== -1) {
            resposta.json().then(function (dados) {
                if (resposta.ok) {
                    corrigirRespostas(dados);
                } else {
                    avisoQuiz.textContent = dados.mensagem;
                    if (resposta.status === 409) {
                        botaoReiniciar.hidden = false;
                    }
                }
                botaoCorrigir.disabled = false;
            }, function () {
                avisoQuiz.textContent = "Não foi possível ler o resultado. Tente novamente.";
                botaoCorrigir.disabled = false;
            });
            return;
        } else {
            avisoQuiz.innerHTML = "O servidor está desatualizado. Reinicie a aplicação e entre novamente.";
        }
    }

    botaoCorrigir.disabled = false;
}

function enviarQuiz(evento) {
    evento.preventDefault();
    let respostas = [];

    for (let i = 0; i < questoes.length; i++) {
        let resposta = formularioQuiz.querySelector(`input[name="questao-${i}"]:checked`);

        if (!resposta) {
            avisoQuiz.innerHTML = "Responda todas as perguntas.";
            return;
        }

        respostas.push(Number(resposta.value));
    }

    botaoCorrigir.disabled = true;
    avisoQuiz.innerHTML = "Salvando seu resultado…";

    fetch("/quiz/resultados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            respostas: respostas,
            chaveTentativa: chaveTentativa
        })
    }).then(receberResultado, function () {
        avisoQuiz.innerHTML = "Não foi possível salvar. Suas respostas foram mantidas; tente novamente.";
        botaoCorrigir.disabled = false;
    });
}

function reiniciarQuiz() {
    chaveTentativa = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
    mostrarQuestoes();
    resultadoQuiz.hidden = true;
    botaoReiniciar.hidden = true;
    botaoCorrigir.hidden = false;
    avisoQuiz.innerHTML = "";
    areaQuestoes.querySelector("input").focus();
}

formularioQuiz.onsubmit = enviarQuiz;
botaoReiniciar.onclick = reiniciarQuiz;
mostrarQuestoes();
