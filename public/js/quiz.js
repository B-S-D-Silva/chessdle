const areaQuestoes = document.querySelector("#questoes");
const formQuiz = document.querySelector("#form-quiz");
const resultadoQuiz = document.querySelector("#resultado");
const reiniciar = document.querySelector("#reiniciar");
async function verificarSessaoQuiz() {
    const resposta = await fetch("/usuarios/sessao", { cache: "no-store", credentials: "same-origin" });
    if (resposta.status === 401) {
        window.location.assign("/login.html");
        return false;
    }
    if (resposta.status === 404) {
        throw new Error("O servidor está desatualizado. Reinicie a aplicação e entre novamente.");
    }
    if (!resposta.ok) {
        throw new Error("O serviço de login está temporariamente indisponível. Tente novamente.");
    }
    const tipo = resposta.headers.get("content-type") || "";
    if (!tipo.includes("application/json")) {
        throw new Error("O servidor está desatualizado. Reinicie a aplicação e entre novamente.");
    }
    return true;
}
function renderizarQuestoes() {
    areaQuestoes.replaceChildren();
    for (let i = 0; i < questoes.length; i++) {
        const questao = questoes[i];
        const grupo = document.createElement("fieldset");
        grupo.className = "questao";
        const legenda = document.createElement("legend");
        legenda.textContent = String(i + 1).padStart(2, "0") + ". " + questao.enunciado;
        grupo.append(legenda);
        for (let j = 0; j < questao.alternativas.length; j++) {
            const label = document.createElement("label");
            label.className = "opcao";
            const radio = document.createElement("input");
            radio.type = "radio"; radio.name = "questao-" + i; radio.value = j; radio.required = true;
            label.append(radio, document.createTextNode(questao.alternativas[j]));
            grupo.append(label);
        }
        const explicacao = document.createElement("p");
        explicacao.className = "explicacao";
        explicacao.hidden = true;
        grupo.append(explicacao);
        areaQuestoes.append(grupo);
    }
}
formQuiz.addEventListener("submit", async evento => {
    evento.preventDefault();
    const aviso = document.querySelector("#aviso-quiz");
    try {
        if (!await verificarSessaoQuiz()) return;
    } catch (erro) {
        aviso.textContent = erro instanceof TypeError
            ? "Não foi possível conectar ao servidor. Verifique a conexão e tente novamente."
            : erro.message;
        return;
    }
    let acertos = 0;
    const grupos = areaQuestoes.querySelectorAll("fieldset");
    for (let i = 0; i < questoes.length; i++) {
        const selecionada = formQuiz.querySelector('input[name="questao-' + i + '"]:checked');
        if (!selecionada) return;
        const correta = Number(selecionada.value) === questoes[i].respostaCorreta;
        if (correta) acertos++;
        const opcoes = grupos[i].querySelectorAll("label");
        for (let j = 0; j < opcoes.length; j++) {
            opcoes[j].querySelector("input").disabled = true;
            if (j === questoes[i].respostaCorreta) opcoes[j].classList.add("correta");
            else if (j === Number(selecionada.value)) opcoes[j].classList.add("incorreta");
        }
        const explicacao = grupos[i].querySelector(".explicacao");
        explicacao.hidden = false;
        explicacao.textContent = (correta ? "Você acertou. " : "Resposta correta: " + questoes[i].alternativas[questoes[i].respostaCorreta] + ". ") + questoes[i].explicacao;
    }
    aviso.textContent = "";
    document.querySelector("#corrigir").hidden = true;
    reiniciar.hidden = false;
    document.querySelector("#titulo-resultado").textContent = acertos + " de " + questoes.length + " respostas certas.";
    document.querySelector("#texto-resultado").textContent = acertos === questoes.length ? "Belo jogo! Todas as ideias fizeram sentido. Que tal compartilhar o que aprendeu?" : "As explicações estão logo abaixo de cada pergunta. Rever uma ideia também faz parte do jogo.";
    resultadoQuiz.hidden = false;
    resultadoQuiz.focus();
});
reiniciar.addEventListener("click", () => {
    renderizarQuestoes();
    resultadoQuiz.hidden = true;
    reiniciar.hidden = true;
    document.querySelector("#corrigir").hidden = false;
    areaQuestoes.querySelector("input").focus();
});
renderizarQuestoes();
