const usuarios = require("../models/usuarioModel");
const { criarHash, verificarSenha } = require("../services/senha");
const { iniciarSessao, encerrarSessao } = require("../middleware/sessao");
function dados(req) {
    const corpo = req.body || {};
    return { nome: typeof corpo.nomeServer === "string" ? corpo.nomeServer.trim() : "",
        email: typeof corpo.emailServer === "string" ? corpo.emailServer.trim().toLowerCase() : "",
        senha: typeof corpo.senhaServer === "string" ? corpo.senhaServer : "" };
}
function emailValido(email) { return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
async function cadastrar(req, res) {
    const { nome, email, senha } = dados(req);
    if (!nome || nome.length > 100 || !emailValido(email) || senha.length < 8 || senha.length > 128) {
        return res.status(400).json({ mensagem: "Informe nome, e-mail válido e senha de 8 a 128 caracteres." });
    }
    try {
        await usuarios.cadastrar(nome, email, await criarHash(senha));
        res.status(201).json({ mensagem: "Conta criada. Você já pode entrar." });
    } catch (erro) {
        res.status(erro.code === "ER_DUP_ENTRY" ? 409 : 500).json({
            mensagem: erro.code === "ER_DUP_ENTRY" ? "Este e-mail já está cadastrado." : "Não foi possível criar sua conta."
        });
    }
}
async function autenticar(req, res) {
    const { email, senha } = dados(req);
    if (!emailValido(email) || !senha || senha.length > 128) return res.status(400).json({ mensagem: "Informe e-mail e senha válidos." });
    try {
        const usuario = await usuarios.buscarPorEmail(email);
        if (!usuario || !await verificarSenha(senha, usuario.senha)) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }
        if (!usuario.senha.startsWith("scrypt$")) await usuarios.atualizarSenha(usuario.id, await criarHash(senha));
        const publico = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        iniciarSessao(req, res, publico);
        res.json(publico);
    } catch (erro) {
        res.status(500).json({ mensagem: "Não foi possível entrar. Tente novamente." });
    }
}
function sessao(req, res) {
    res.json(req.usuario);
}

function sair(req, res) {
    encerrarSessao(req, res);
    res.sendStatus(204);
}

module.exports = { cadastrar, autenticar, sessao, sair };
