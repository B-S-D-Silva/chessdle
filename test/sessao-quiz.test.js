const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
function preparar(resposta) {
    const redirecionamentos = [];
    const elemento = { addEventListener() {}, replaceChildren() {} };
    const contexto = vm.createContext({
        document: { querySelector: () => elemento },
        window: { location: { assign: url => redirecionamentos.push(url) } },
        fetch: async () => resposta,
        questoes: []
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/js/quiz.js"), "utf8"), contexto);
    return { verificar: vm.runInContext("verificarSessaoQuiz", contexto), redirecionamentos };
}
test("sessão válida permite corrigir e sessão expirada volta ao login", async () => {
    const valida = preparar(Response.json({ id: 1, nome: "Teste" }));
    assert.equal(await valida.verificar(), true);
    const expirada = preparar(Response.json({ mensagem: "Entre novamente." }, { status: 401 }));
    assert.equal(await expirada.verificar(), false);
    assert.deepEqual(expirada.redirecionamentos, ["/login.html"]);
});
test("servidor antigo e indisponibilidade têm mensagens distintas", async () => {
    await assert.rejects(preparar(new Response("Cannot GET /usuarios/sessao", { status: 404 })).verificar(), /desatualizado/);
    await assert.rejects(preparar(new Response("Erro", { status: 500 })).verificar(), /temporariamente indisponível/);
    await assert.rejects(preparar(new Response("<html>Login</html>")).verificar(), /desatualizado/);
});
