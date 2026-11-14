const mysql = require("mysql2/promise");
async function executar(instrucao, valores = []) {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 3306
    });
    try {
        const [linhas] = await conexao.execute(instrucao, valores);
        return linhas;
    } finally {
        await conexao.end();
    }
}
async function executarTransacao(operacao) {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 3306
    });

    try {
        await conexao.beginTransaction();
        const resultado = await operacao(async function (instrucao, valores = []) {
            const [linhas] = await conexao.execute(instrucao, valores);
            return linhas;
        });
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        await conexao.end();
    }
}

module.exports = { executar, executarTransacao };
