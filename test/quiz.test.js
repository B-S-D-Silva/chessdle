const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const usuarios = require("../src/models/usuarioModel");
const quizModel = require("../src/models/quizModel");
const quiz = require("../src/services/quiz");
const questoes = require("../public/js/questoes");
const { criarHash } = require("../src/services/senha");
let resultados = [];
let usuarioConsultado;

usuarios.buscarPorEmail = async email => ({
    id: email === "primeiro@example.test" ? 1 : 2,
    nome: "Teste",
    email,
    senha: await criarHash("senha-de-teste")
});

quizModel.salvar = async (usuarioId, chave, resultado) => {
    let anterior = resultados.find(item => item.usuarioId === usuarioId && item.chave === chave);
    if (anterior) return anterior;
    let salvo = { id: resultados.length + 1, usuarioId, chave, acertos: resultado.acertos, total: resultado.total };
    resultados.push(salvo);
    return salvo;
};

quizModel.dashboard = async usuarioId => {
    usuarioConsultado = usuarioId;
    return { tentativas: resultados.filter(item => item.usuarioId === usuarioId).length };
};

const app = require("../app");
const servidor = app.listen(0, "127.0.0.1");
const pronto = new Promise(resolve => servidor.on("listening", resolve));
after(() => new Promise(resolve => servidor.close(resolve)));

async function pedir(caminho, corpo, cookie) {
    await pronto;
    return fetch(`http://127.0.0.1:${servidor.address().port}${caminho}`, {
        method: corpo ? "POST" : "GET",
        redirect: "manual",
        headers: { "Content-Type": "application/json", Cookie: cookie || "" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
}

async function entrar(email) {
    const resposta = await pedir("/usuarios/autenticar", { emailServer: email, senhaServer: "senha-de-teste" });
    return `xadrez_sessao=${resposta.headers.get("set-cookie").match(/xadrez_sessao=([a-f0-9]{64})/)[1]}`;
}

test("correção usa a lista do servidor e rejeita alternativas inválidas", () => {
    const certas = questoes.map(questao => questao.respostaCorreta);
    assert.equal(quiz.corrigir(certas).acertos, questoes.length);
    assert.equal(quiz.corrigir(certas.slice(1)), null);
    assert.equal(quiz.corrigir(Array(questoes.length).fill(99)), null);
    assert.equal(quiz.corrigir(Array(questoes.length).fill("1")), null);
});

test("dashboard e gravação exigem sessão", async () => {
    assert.equal((await pedir("/dashboard.html")).status, 302);
    assert.equal((await pedir("/quiz/dashboard")).status, 401);
    assert.equal((await pedir("/quiz/resultados", { respostas: [] })).status, 401);
    assert.equal((await pedir("/%64ashboard.html")).status, 404);
});

test("grava nota real, valida o corpo e isola resultados pela sessão", async () => {
    const cookie = await entrar("primeiro@example.test");
    const certas = questoes.map(questao => questao.respostaCorreta);
    const corpo = { chaveTentativa: "1800000000000-123", respostas: certas, acertos: 999, usuarioId: 2 };
    assert.equal((await pedir("/quiz/resultados", { ...corpo, respostas: [] }, cookie)).status, 400);
    assert.equal((await pedir("/quiz/resultados", { ...corpo, chaveTentativa: "inválida" }, cookie)).status, 400);
    const salva = await pedir("/quiz/resultados", corpo, cookie);
    assert.equal(salva.status, 201);
    assert.equal((await salva.json()).acertos, questoes.length);
    await pedir("/quiz/resultados", corpo, cookie);
    assert.equal(resultados.length, 1);
    assert.equal(resultados[0].usuarioId, 1);
    assert.equal((await (await pedir("/quiz/dashboard?usuarioId=2", null, cookie)).json()).tentativas, 1);
    assert.equal(usuarioConsultado, 1);
    const outraConta = await entrar("segundo@example.test");
    assert.equal((await (await pedir("/quiz/dashboard", null, outraConta)).json()).tentativas, 0);
});

test("falha no banco retorna erro recuperável", async () => {
    const cookie = await entrar("primeiro@example.test");
    quizModel.salvar = async () => { throw Object.assign(new Error(), { code: "ER_NO_SUCH_TABLE" }); };
    const resposta = await pedir("/quiz/resultados", {
        chaveTentativa: "1800000000000-456",
        respostas: questoes.map(questao => questao.respostaCorreta)
    }, cookie);
    assert.equal(resposta.status, 500);
    assert.match((await resposta.json()).mensagem, /Suas respostas continuam/);
});
