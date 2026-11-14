const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function preparar() {
    const elementos = {
        "#form-conta": { dataset: { modo: "cadastro" }, querySelector: () => ({}) },
        "#mensagem-form": {},
        "#nome": { value: "Meu nome" },
        "#email": { value: "teste@example.com" },
        "#senha": { value: "senha1234" },
        "#confirmacao": { value: "outra-senha" }
    };
    const contexto = vm.createContext({
        document: { querySelector: seletor => elementos[seletor] }
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/js/autenticacao.js"), "utf8"), contexto);
    return { contexto, elementos };
}

function lerResposta(resposta) {
    const { contexto } = preparar();
    const receber = vm.runInContext("receberResposta", contexto);
    return new Promise((resolve, reject) => {
        receber(resposta, resolve, mensagem => reject(new Error(mensagem)));
    });
}

test("erro em texto da API antiga mantém a mensagem original", async () => {
    await assert.rejects(lerResposta(new Response("Não foi possível realizar o cadastro.", {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" }
    })), /Não foi possível realizar o cadastro/);
});

test("respostas JSON de sucesso e erro são interpretadas", async () => {
    const resultado = await lerResposta(Response.json({ mensagem: "Conta criada." }, { status: 201 }));
    assert.equal(resultado.mensagem, "Conta criada.");
    await assert.rejects(lerResposta(Response.json({ mensagem: "Este e-mail já está cadastrado." }, { status: 409 })), /já está cadastrado/);
});

test("HTML e JSON inválido não vazam erros técnicos", async () => {
    await assert.rejects(lerResposta(new Response("<html>Erro</html>", { status: 502 })), /Reinicie a aplicação/);
    await assert.rejects(lerResposta(new Response("Inválido", { headers: { "Content-Type": "application/json" } })), /resposta inválida/);
});

test("cadastro lê os campos por value e recusa confirmação diferente", () => {
    const { contexto, elementos } = preparar();
    let prevenido = false;
    vm.runInContext("enviarFormulario", contexto)({ preventDefault() { prevenido = true; } });
    assert.equal(prevenido, true);
    assert.equal(elementos["#mensagem-form"].textContent, "As senhas precisam ser iguais.");
});
