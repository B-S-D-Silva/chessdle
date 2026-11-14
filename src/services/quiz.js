let questoes = require("../../public/js/questoes");
let crypto = require("node:crypto");
let versao = crypto.createHash("sha256").update(JSON.stringify(questoes)).digest("hex");

function corrigir(respostas) {
    if (!Array.isArray(respostas) || respostas.length !== questoes.length) {
        return null;
    }

    let acertos = 0;
    let detalhes = [];

    for (let i = 0; i < questoes.length; i++) {
        let questao = questoes[i];
        let escolha = respostas[i];

        if (!Number.isInteger(escolha) || escolha < 0 || escolha >= questao.alternativas.length) {
            return null;
        }

        let acertou = escolha === questao.respostaCorreta;

        if (acertou) {
            acertos++;
        }

        detalhes.push({
            enunciado: questao.enunciado,
            alternativaEscolhida: questao.alternativas[escolha],
            alternativaCorreta: questao.alternativas[questao.respostaCorreta],
            acertou: acertou
        });
    }

    return { acertos: acertos, total: questoes.length, detalhes: detalhes, versao: versao };
}

module.exports = { corrigir };
