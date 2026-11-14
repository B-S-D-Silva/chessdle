const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { criarHash, verificarSenha } = require("../src/services/senha");
const usuarios = require("../src/models/usuarioModel");
const registros = new Map();
let proximoId = 1;
usuarios.buscarPorEmail = async email => registros.get(email) || null;
usuarios.cadastrar = async (nome, email, senha) => {
    if (registros.has(email)) throw Object.assign(new Error(), { code: "ER_DUP_ENTRY" });
    registros.set(email, { id: proximoId++, nome, email, senha });
};
usuarios.atualizarSenha = async (id, senha) => {
    for (const registro of registros.values()) if (registro.id === id) registro.senha = senha;
};
const app = require("../app");
const servidor = app.listen(0, "127.0.0.1");
const pronto = new Promise(resolve => servidor.on("listening", resolve));
after(() => new Promise(resolve => servidor.close(resolve)));
async function requisicao(caminho, corpo, cookie, origem) {
    await pronto;
    const headers = {};
    if (corpo) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;
    if (origem) headers.Origin = origem;
    return fetch("http://127.0.0.1:" + servidor.address().port + caminho, {
        method: corpo ? "POST" : "GET", headers, redirect: "manual", body: corpo ? JSON.stringify(corpo) : undefined
    });
}
test("hash tem sal próprio, valida senha e rejeita senha incorreta", async () => {
    const hash = await criarHash("uma-senha-forte");
    assert.notEqual(hash, await criarHash("uma-senha-forte"));
    assert.equal(await verificarSenha("uma-senha-forte", hash), true);
    assert.equal(await verificarSenha("errada", hash), false);
    assert.equal(await verificarSenha("qualquer", "scrypt$invalido"), false);
});
test("cadastro, validações, sessão protegida, repetição e logout", async () => {
    assert.equal((await requisicao("/")).status, 200);
    assert.equal((await requisicao("/ranking.html")).status, 200);
    const retrato = await requisicao("/assets/jogadores/hikaru-nakamura.jpg");
    assert.equal(retrato.status, 200);
    assert.match(retrato.headers.get("content-type"), /image\/jpeg/);
    assert.ok((await retrato.arrayBuffer()).byteLength > 0);
    assert.equal((await requisicao("/usuarios/sessao")).status, 401);
    assert.equal((await requisicao("/quiz.html")).status, 302);
    assert.equal((await requisicao("/js/questoes.js")).status, 401);
    assert.equal((await requisicao("/%71uiz.html")).status, 404);
    assert.equal((await requisicao("/js/%71uestoes.js")).status, 404);
    assert.equal((await requisicao("/usuarios/cadastrar", { nomeServer: "Teste", emailServer: "invalido", senhaServer: "123" })).status, 400);
    const conta = { nomeServer: "Teste", emailServer: "teste@example.com", senhaServer: "senha-de-teste" };
    assert.equal((await requisicao("/usuarios/cadastrar", conta)).status, 201);
    assert.match(registros.get(conta.emailServer).senha, /^scrypt\$/);
    assert.equal((await requisicao("/usuarios/cadastrar", conta)).status, 409);
    assert.equal((await requisicao("/usuarios/autenticar", { ...conta, senhaServer: "incorreta" })).status, 401);
    const login = await requisicao("/usuarios/autenticar", conta);
    assert.equal(login.status, 200);
    assert.equal(Object.hasOwn(await login.json(), "senha"), false);
    const cookieCompleto = login.headers.get("set-cookie");
    assert.match(cookieCompleto, /HttpOnly/i);
    assert.match(cookieCompleto, /SameSite=Lax/i);
    const cookie = "xadrez_sessao=" + cookieCompleto.match(/xadrez_sessao=([a-f0-9]{64})/)[1];
    assert.equal((await requisicao("/usuarios/sessao", null, cookie)).status, 200);
    assert.equal((await requisicao("/quiz.html", null, cookie)).status, 200);
    assert.equal((await requisicao("/js/questoes.js", null, cookie)).status, 200);
    assert.equal((await requisicao("/usuarios/sair", {}, cookie, "https://externo.example")).status, 403);
    assert.equal((await requisicao("/usuarios/sair", {}, cookie)).status, 204);
    assert.equal((await requisicao("/usuarios/sessao", null, cookie)).status, 401);
    assert.equal((await requisicao("/usuarios/sessao", null, "xadrez_sessao=inventada")).status, 401);
    assert.equal((await requisicao("/perfil.html")).status, 404);
    assert.equal((await requisicao("/desafios")).status, 404);
});
test("conta antiga é preservada e senha convertida apenas após login válido", async () => {
    const conta = { id: proximoId++, nome: "Legado", email: "legado@example.com", senha: "antiga" };
    registros.set(conta.email, conta);
    assert.equal((await requisicao("/usuarios/autenticar", { emailServer: conta.email, senhaServer: "errada" })).status, 401);
    assert.equal(conta.senha, "antiga");
    assert.equal((await requisicao("/usuarios/autenticar", { emailServer: conta.email, senhaServer: "antiga" })).status, 200);
    assert.match(conta.senha, /^scrypt\$/);
    assert.equal(await verificarSenha("antiga", conta.senha), true);
});
