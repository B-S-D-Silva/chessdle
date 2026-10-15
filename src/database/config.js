var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

function executar(instrucao, valores) {
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject(new Error("AMBIENTE NÃO CONFIGURADO"));
    }

    var conexao = mysql.createConnection(mySqlConfig).promise();
    return conexao.query(instrucao, valores || [])
        .then(function(linhas) {
            return linhas[0];
        })
        .finally(function() {
            return conexao.end();
        });
}

function executarTransacao(operacao) {
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject(new Error("AMBIENTE NÃO CONFIGURADO"));
    }

    var conexao = mysql.createConnection(mySqlConfig).promise();
    var transacaoIniciada = false;

    return conexao.beginTransaction()
        .then(function() {
            transacaoIniciada = true;
            return operacao(function(instrucao, valores) {
                return conexao.query(instrucao, valores || [])
                    .then(function(resultado) {
                        return resultado[0];
                    });
            });
        })
        .then(function(resultado) {
            return conexao.commit().then(function() {
                transacaoIniciada = false;
                return resultado;
            });
        })
        .catch(function(erro) {
            if (!transacaoIniciada) {
                throw erro;
            }
            return conexao.rollback()
                .catch(function(erroRollback) {
                    erro.erroRollback = erroRollback;
                })
                .then(function() {
                    transacaoIniciada = false;
                    throw erro;
                });
        })
        .finally(function() {
            return conexao.end();
        });
}

module.exports = {
    executar,
    executarTransacao
};