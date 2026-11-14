const database = require("../database/config");
async function buscarPorEmail(email) {
    const linhas = await database.executar("SELECT id, nome, email, senha FROM usuario WHERE email = ?", [email]);
    return linhas[0] || null;
}
function cadastrar(nome, email, senha) {
    return database.executar("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senha]);
}
function atualizarSenha(id, senha) {
    return database.executar("UPDATE usuario SET senha = ? WHERE id = ?", [senha, id]);
}
module.exports = { buscarPorEmail, cadastrar, atualizarSenha };
