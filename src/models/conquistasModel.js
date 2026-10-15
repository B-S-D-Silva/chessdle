var database = require("../database/config");
var catalogo = require("./conquistasCatalogo");

function buscarResumoParaDesbloqueio(executar, usuarioId) {
    return Promise.all([
        executar(`
            SELECT
                COUNT(*) AS partidas,
                SUM(
                    (jogador_acertou = 1 AND jogador_tentativas = 1) +
                    (abertura_acertou = 1 AND abertura_tentativas = 1) +
                    (citacao_acertou = 1 AND citacao_tentativas = 1)
                ) AS acertosDePrimeira,
                SUM(
                    (jogador_acertou = 1 AND jogador_tentativas <= 2) +
                    (abertura_acertou = 1 AND abertura_tentativas <= 2) +
                    (citacao_acertou = 1 AND citacao_tentativas <= 2)
                ) AS acertosEmAteDuas,
                SUM(abertura_acertou = 1) AS aberturasAcertadas,
                SUM(citacao_acertou = 1) AS citacoesAcertadas,
                SUM(jogador_acertou = 1) AS jogadoresAcertados,
                SUM(jogador_acertou = 1 AND abertura_acertou = 1 AND citacao_acertou = 1) AS diasPerfeitos,
                SUM(
                    (jogador_acertou = 1 AND jogador_tentativas = 6) +
                    (abertura_acertou = 1 AND abertura_tentativas = 6) +
                    (citacao_acertou = 1 AND citacao_tentativas = 6)
                ) AS acertosNaSexta
            FROM partida
            WHERE usuario_id = ?
        `, [usuarioId]),
        executar("SELECT streak_maior AS maiorSequencia FROM usuario WHERE id = ?", [usuarioId])
    ]).then(function(resultados) {
        var linhaPartidas = resultados[0][0] || {};
        var linhaUsuario = resultados[1][0];
        if (!linhaUsuario) {
            var erroUsuario = new Error("O usuário das conquistas não existe.");
            erroUsuario.errno = 1452;
            throw erroUsuario;
        }

        return {
            partidas: Number(linhaPartidas.partidas) || 0,
            acertosDePrimeira: Number(linhaPartidas.acertosDePrimeira) || 0,
            acertosEmAteDuas: Number(linhaPartidas.acertosEmAteDuas) || 0,
            aberturasAcertadas: Number(linhaPartidas.aberturasAcertadas) || 0,
            citacoesAcertadas: Number(linhaPartidas.citacoesAcertadas) || 0,
            jogadoresAcertados: Number(linhaPartidas.jogadoresAcertados) || 0,
            diasPerfeitos: Number(linhaPartidas.diasPerfeitos) || 0,
            acertosNaSexta: Number(linhaPartidas.acertosNaSexta) || 0,
            maiorSequencia: Number(linhaUsuario.maiorSequencia) || 0
        };
    });
}

function desbloquear(executar, usuarioId, dataDesbloqueio) {
    var catalogoCodes = catalogo.map(function(conquista) { return conquista.codigo; });
    var marcadores = catalogoCodes.map(function() { return "?"; }).join(", ");

    return executar(
        "SELECT codigo FROM conquistas WHERE codigo IN (" + marcadores + ")",
        catalogoCodes
    ).then(function(codigosCadastrados) {
        if (codigosCadastrados.length != catalogo.length) {
            throw new Error("O catálogo de conquistas no banco está incompleto. Execute migracao-conquistas.sql.");
        }
        return buscarResumoParaDesbloqueio(executar, usuarioId);
    }).then(function(dados) {
        var novas = [];
        var elegiveis = catalogo.filter(function(conquista) {
            return conquista.verificar(dados);
        });

        return elegiveis.reduce(function(promessa, conquista) {
            return promessa.then(function() {
                return executar(`
                    INSERT IGNORE INTO usuario_conquista
                        (fkUsuario, fkConquista, dataDesbloqueio)
                    SELECT ?, id, ?
                    FROM conquistas
                    WHERE codigo = ?
                `, [usuarioId, dataDesbloqueio, conquista.codigo])
                    .then(function(resultado) {
                        if (resultado.affectedRows > 0) {
                            novas.push(conquista.codigo);
                        }
                    });
            });
        }, Promise.resolve()).then(function() {
            if (novas.length == 0) {
                return [];
            }
            var placeholders = novas.map(function() { return "?"; }).join(", ");
            return executar(`
                SELECT codigo, nome, descricao, icone
                FROM conquistas
                WHERE codigo IN (${placeholders})
                ORDER BY id
            `, novas);
        });
    });
}

function buscarTodas(usuarioId) {
    return database.executar(`
        SELECT
            conquistas.codigo,
            conquistas.nome,
            conquistas.descricao,
            conquistas.icone,
            usuario_conquista.fkConquista IS NOT NULL AS desbloqueada,
            DATE_FORMAT(usuario_conquista.dataDesbloqueio, '%Y-%m-%d') AS dataDesbloqueio
        FROM usuario
        CROSS JOIN conquistas
        LEFT JOIN usuario_conquista
            ON usuario_conquista.fkConquista = conquistas.id
            AND usuario_conquista.fkUsuario = usuario.id
        WHERE usuario.id = ?
        ORDER BY conquistas.id
    `, [usuarioId]).then(function(linhas) {
        if (linhas.length == 0) {
            return null;
        }
        if (linhas.length != catalogo.length) {
            throw new Error("O catálogo de conquistas no banco está incompleto. Execute migracao-conquistas.sql.");
        }
        var desbloqueadas = linhas.filter(function(linha) {
            return Boolean(linha.desbloqueada);
        }).length;
        return {
            conquistas: linhas.map(function(linha) {
                return {
                    codigo: linha.codigo,
                    nome: linha.nome,
                    descricao: linha.descricao,
                    icone: linha.icone,
                    desbloqueada: Boolean(linha.desbloqueada),
                    dataDesbloqueio: linha.dataDesbloqueio
                };
            }),
            resumo: {
                total: linhas.length,
                desbloqueadas: desbloqueadas
            }
        };
    });
}

module.exports = {
    desbloquear: desbloquear,
    buscarTodas: buscarTodas
};
