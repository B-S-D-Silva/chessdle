const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const contexto = vm.createContext({
    document: { querySelector: () => ({ addEventListener() {} }) }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/js/autenticacao.js"), "utf8"), contexto);
const lerResposta = vm.runInContext("lerResposta", contexto);

test("erro em texto da API antiga mantém a mensagem original", async () => {
    const resposta = new Response("Não foi possível realizar o cadastro.", {
        status: 500, headers: { "Content-Type": "text/html; charset=utf-8" }
    });
    await assert.rejects(lerResposta(resposta), /Não foi possível realizar o cadastro\./);
});
test("respostas JSON de sucesso e erro são interpretadas", async () => {
    const resultado = await lerResposta(Response.json({ mensagem: "Conta criada." }, { status: 201 }));
    assert.equal(resultado.mensagem, "Conta criada.");
    await assert.rejects(lerResposta(Response.json({ mensagem: "Este e-mail já está cadastrado." }, { status: 409 })), /já está cadastrado/);
});
test("HTML e JSON inválido não vazam erros técnicos no formulário", async () => {
    await assert.rejects(lerResposta(new Response("<!doctype html><h1>Erro</h1>", { status: 502 })), /Reinicie a aplicação/);
    await assert.rejects(lerResposta(new Response("Não foi possível", { status: 500, headers: { "Content-Type": "application/json" } })), /resposta inválida/);
    await assert.rejects(lerResposta(new Response("OK")), /desatualizado/);
});
