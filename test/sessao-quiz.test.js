const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function preparar(resposta) {
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
    vm.runInContext("conferirSessao", contexto)(resposta);
    return { elementos, localizacao };
}

test("sessão válida permite corrigir e sessão expirada volta ao login", () => {
    const valida = preparar(Response.json({ id: 1, nome: "Teste" }));
    assert.equal(valida.elementos["#resultado"].hidden, false);
    const expirada = preparar(Response.json({}, { status: 401 }));
    assert.equal(expirada.localizacao.href, "/login.html");
    assert.equal(expirada.elementos["#resultado"].hidden, true);
});

test("servidor antigo e indisponibilidade mantêm mensagens distintas", () => {
    assert.match(preparar(new Response("Erro", { status: 404 })).elementos["#aviso-quiz"].innerHTML, /desatualizado/);
    assert.match(preparar(new Response("Erro", { status: 500 })).elementos["#aviso-quiz"].innerHTML, /temporariamente indisponível/);
    assert.match(preparar(new Response("<html>Login</html>")).elementos["#aviso-quiz"].innerHTML, /desatualizado/);
});
