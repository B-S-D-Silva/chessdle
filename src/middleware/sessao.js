const { randomBytes, createHash } = require("node:crypto");
const sessoes = new Map();
const duracao = 8 * 60 * 60 * 1000;
const nomeCookie = "xadrez_sessao";
function chave(token) { return createHash("sha256").update(token).digest("hex"); }
function tokenDaRequisicao(req) {
    const cookie = (req.headers.cookie || "").split(";").find(item => item.trim().startsWith(nomeCookie + "="));
    return cookie ? cookie.trim().slice(nomeCookie.length + 1) : "";
}
function opcoesCookie() {
    return { httpOnly: true, sameSite: "lax", secure: process.env.AMBIENTE_PROCESSO === "producao", path: "/" };
}
function encerrarSessao(req, res) {
    sessoes.delete(chave(tokenDaRequisicao(req)));
    res.clearCookie(nomeCookie, opcoesCookie());
}
function iniciarSessao(req, res, usuario) {
    encerrarSessao(req, res);
    const token = randomBytes(32).toString("hex");
    sessoes.set(chave(token), { usuario, expira: Date.now() + duracao });
    res.cookie(nomeCookie, token, { ...opcoesCookie(), maxAge: duracao });
}
function obterUsuario(req) {
    const sessao = sessoes.get(chave(tokenDaRequisicao(req)));
    return sessao && sessao.expira > Date.now() ? sessao.usuario : null;
}
function exigirSessao(req, res, next) {
    res.set("Cache-Control", "no-store");
    req.usuario = obterUsuario(req);
    if (req.usuario) return next();
    if (req.path.endsWith(".html")) return res.redirect("/login.html");
    return res.status(401).json({ mensagem: "Entre na sua conta para continuar." });
}
const limpeza = setInterval(() => {
    for (const [id, sessao] of sessoes) if (sessao.expira <= Date.now()) sessoes.delete(id);
}, 60000);
limpeza.unref();
module.exports = { iniciarSessao, encerrarSessao, exigirSessao };
