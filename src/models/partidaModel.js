var database = require("../database/config");

var modosOrdenados = ["jogador", "abertura", "citacao"];

function criar(usuarioId, dataPartida, resultados) {
    var resultadosPorModo = {};
    resultados.forEach(function(resultado) {
        resultadosPorModo[resultado.modo] = resultado;
    });

    var instrucaoSql = `
        INSERT INTO partida (
            usuario_id, data_partida,
            jogador_tentativas, jogador_acertou, jogador_pistas,
            abertura_tentativas, abertura_acertou, abertura_pistas,
            citacao_tentativas, citacao_acertou, citacao_pistas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    var valores = [usuarioId, dataPartida];

    modosOrdenados.forEach(function(modo) {
        var resultado = resultadosPorModo[modo];
        valores.push(resultado.tentativas, resultado.acertou, resultado.pistas);
    });

    return database.executar(instrucaoSql, valores)
        .then(function(resultado) {
            return resultado.insertId;
        });
}

function buscarPorId(partidaId, usuarioId) {
    var instrucaoSql = `
        SELECT
            id,
            DATE_FORMAT(partida.data_partida, '%Y-%m-%d') AS data,
            jogador_tentativas, jogador_acertou, jogador_pistas,
            abertura_tentativas, abertura_acertou, abertura_pistas,
            citacao_tentativas, citacao_acertou, citacao_pistas
        FROM partida
        WHERE partida.id = ? AND partida.usuario_id = ?
    `;
    return database.executar(instrucaoSql, [partidaId, usuarioId])
        .then(function(linhas) {
            if (linhas.length == 0) {
                return null;
            }

            var partida = linhas[0];
            return {
                id: partida.id,
                data: partida.data,
                resultados: modosOrdenados.map(function(modo) {
                    var prefixo = modo + "_";
                    return {
                        modo: modo,
                        tentativas: Number(partida[prefixo + "tentativas"]),
                        acertou: Boolean(partida[prefixo + "acertou"]),
                        pistas: Number(partida[prefixo + "pistas"])
                    };
                })
            };
        });
}

function buscarHistoricoPorUsuario(usuarioId) {
    var instrucaoSql = `
        SELECT
            id,
            DATE_FORMAT(data_partida, '%Y-%m-%d') AS data,
            jogador_tentativas, jogador_acertou, jogador_pistas,
            abertura_tentativas, abertura_acertou, abertura_pistas,
            citacao_tentativas, citacao_acertou, citacao_pistas
        FROM partida
        WHERE usuario_id = ?
        ORDER BY data_partida DESC, criada_em DESC, id DESC
    `;
    return database.executar(instrucaoSql, [usuarioId])
        .then(function(linhas) {
            return linhas.map(function(partida) {
                return {
                    id: partida.id,
                    data: partida.data,
                    resultados: modosOrdenados.map(function(modo) {
                        var prefixo = modo + "_";
                        return {
                            modo: modo,
                            tentativas: Number(partida[prefixo + "tentativas"]),
                            acertou: Boolean(partida[prefixo + "acertou"]),
                            pistas: Number(partida[prefixo + "pistas"])
                        };
                    })
                };
            });
        });
}

module.exports = {
    criar,
    buscarPorId,
    buscarHistoricoPorUsuario,
    modosOrdenados
};
