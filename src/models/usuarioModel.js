var database = require("../database/config");

function autenticar(email, senha) {
    var instrucaoSql = "SELECT id, nome, email FROM usuario WHERE email = ? AND senha = ?";
    return database.executar(instrucaoSql, [email, senha]);
}

function cadastrar(nome, email, senha) {
    var instrucaoSql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)";
    return database.executar(instrucaoSql, [nome, email, senha]);
}

function buscarPerfil(usuarioId) {
    var instrucaoSql = `
        SELECT id, nome, email, descricao, rating_chess_com
        FROM usuario
        WHERE id = ?
    `;
    return database.executar(instrucaoSql, [usuarioId])
        .then(function(linhas) {
            if (linhas.length == 0) {
                return null;
            }
            return {
                id: linhas[0].id,
                nome: linhas[0].nome,
                email: linhas[0].email,
                descricao: linhas[0].descricao || "",
                ratingChessCom: linhas[0].rating_chess_com == null ? null : Number(linhas[0].rating_chess_com)
            };
        });
}

function atualizarPerfil(usuarioId, descricao, ratingChessCom) {
    var instrucaoSql = `
        UPDATE usuario
        SET descricao = ?, rating_chess_com = ?
        WHERE id = ?
    `;
    return database.executar(instrucaoSql, [descricao, ratingChessCom, usuarioId]);
}

module.exports = {
    autenticar,
    cadastrar,
    buscarPerfil,
    atualizarPerfil
};