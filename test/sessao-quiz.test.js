const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

async function preparar(resposta) {
    const elementos = {};
    const nomes = ["#questoes", "#form-quiz", "#resultado", "#aviso-quiz", "#corrigir", "#reiniciar", "#titulo-resultado", "#texto-resultado"];
    for (const nome of nomes) {
        elementos[nome] = { hidden: true, querySelectorAll: () => [], focus() {} };
    }
    const localizacao = { href: "" };
    const contexto = vm.createContext({
        document: { querySelector: seletor => elementos[seletor] },
        window: { location: localizacao },
        questoes: []
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/js/quiz.js"), "utf8"), contexto);
    vm.runInContext("receberResultado", contexto)(resposta);
    await new Promise(setImmediate);
    return { elementos, localizacao };
}

test("resultado salvo permite corrigir e sessão expirada volta ao login", async () => {
    const valida = await preparar(Response.json({ id: 1, acertos: 0, total: 0 }, { status: 201 }));
    assert.equal(valida.elementos["#resultado"].hidden, false);
    const expirada = await preparar(Response.json({}, { status: 401 }));
    assert.equal(expirada.localizacao.href, "/login.html");
    assert.equal(expirada.elementos["#resultado"].hidden, true);
});

test("erros de gravação mantêm as respostas e permitem repetir o envio", async () => {
    const antigo = await preparar(new Response("Erro", { status: 404 }));
    const falha = await preparar(Response.json({ mensagem: "Não foi possível salvar." }, { status: 500 }));
    assert.match(antigo.elementos["#aviso-quiz"].innerHTML, /desatualizado/);
    assert.match(falha.elementos["#aviso-quiz"].textContent, /Não foi possível salvar/);
    assert.equal(falha.elementos["#resultado"].hidden, true);
    assert.equal(falha.elementos["#corrigir"].disabled, false);
});
