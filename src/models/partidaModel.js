var database = require("../database/config");

var modosOrdenados = ["jogador", "abertura", "citacao"];

function dataAtualSaoPaulo() {
    var partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());
    var valores = {};
    partes.forEach(function(parte) {
        valores[parte.type] = parte.value;
    });
    return valores.year + "-" + valores.month + "-" + valores.day;
}

function buscarDias(executar, usuarioId, hoje) {
    var instrucaoSql = `
        SELECT
            DATE_FORMAT(DATE_SUB(?, INTERVAL dias.deslocamento DAY), '%Y-%m-%d') AS data,
            IF(COUNT(streak_dia.usuario_id) > 0, 1, 0) AS jogou
        FROM (
            SELECT 6 AS deslocamento UNION ALL SELECT 5 UNION ALL SELECT 4
            UNION ALL SELECT 3 UNION ALL SELECT 2 UNION ALL SELECT 1 UNION ALL SELECT 0
        ) AS dias
        LEFT JOIN streak_dia
            ON streak_dia.usuario_id = ?
            AND streak_dia.data_conclusao = DATE_SUB(?, INTERVAL dias.deslocamento DAY)
        GROUP BY dias.deslocamento
        ORDER BY dias.deslocamento DESC
    `;
    return executar(instrucaoSql, [hoje, usuarioId, hoje]).then(function(linhas) {
        return linhas.map(function(linha) {
            var data = typeof linha.data == "string" ? linha.data : linha.data.toISOString().slice(0, 10);
            return {
                data: data,
                jogou: Number(linha.jogou) == 1,
                hoje: data == hoje
            };
        });
    });
}

function montarSequencia(usuario, hoje, dias) {
    var ultimaData = usuario.ultimaData || null;
    var jogouHoje = ultimaData == hoje;
    var dataDeContinuidade = ultimaData ? proximoDia(ultimaData) : null;
    var sequenciaRegistrada = Number(usuario.atual) || 0;
    var atual = jogouHoje || dataDeContinuidade == hoje ? sequenciaRegistrada : 0;

    return {
        atual: atual,
        maior: Number(usuario.maior) || 0,
        ultimaData: ultimaData,
        jogouHoje: jogouHoje,
        emRisco: atual > 0 && !jogouHoje,
        dias: dias || []
    };
}

function proximoDia(data) {
    var ano = Number(data.slice(0, 4));
    var mes = Number(data.slice(5, 7));
    var dia = Number(data.slice(8, 10));
    var diasPorMes = [31, (ano % 4 == 0 && (ano % 100 != 0 || ano % 400 == 0)) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    dia++;
    if (dia > diasPorMes[mes - 1]) {
        dia = 1;
        mes++;
        if (mes > 12) {
            mes = 1;
            ano++;
        }
    }
    return String(ano).padStart(4, "0") + "-" + String(mes).padStart(2, "0") +
        "-" + String(dia).padStart(2, "0");
}

function atualizarSequencia(executar, usuarioId, hoje) {
    return executar(`
        SELECT
            streak_atual AS atual,
            streak_maior AS maior,
            DATE_FORMAT(streak_ultima_data, '%Y-%m-%d') AS ultimaData
        FROM usuario
        WHERE id = ?
        FOR UPDATE
    `, [usuarioId]).then(function(usuarios) {
        if (usuarios.length == 0) {
            var erroUsuario = new Error("O usuário da sequência não existe.");
            erroUsuario.errno = 1452;
            return Promise.reject(erroUsuario);
        }

        var usuario = usuarios[0];
        return executar(`
            INSERT IGNORE INTO streak_dia (usuario_id, data_conclusao)
            VALUES (?, ?)
        `, [usuarioId, hoje]).then(function(insercao) {
            var ultimaData = usuario.ultimaData;
            var atualAnterior = Number(usuario.atual) || 0;
            var maiorAnterior = Number(usuario.maior) || 0;
            var proximoDiaAnterior = ultimaData ? proximoDia(ultimaData) : null;
            var aumentou = Number(insercao.affectedRows) > 0 && ultimaData != hoje;
            var atual = ultimaData == hoje ? atualAnterior :
                proximoDiaAnterior == hoje ? atualAnterior + 1 : 1;
            var maior = Math.max(maiorAnterior, atual);

            return executar(`
                UPDATE usuario
                SET streak_atual = ?, streak_maior = ?, streak_ultima_data = ?
                WHERE id = ?
            `, [atual, maior, hoje, usuarioId]).then(function() {
                return buscarDias(executar, usuarioId, hoje).then(function(dias) {
                    return {
                        atual: atual,
                        maior: maior,
                        ultimaData: hoje,
                        jogouHoje: true,
                        emRisco: false,
                        aumentou: aumentou,
                        dias: dias
                    };
                });
            });
        });
    });
}

function registrarConclusao(usuarioId) {
    var hoje = dataAtualSaoPaulo();
    return database.executarTransacao(function(executar) {
        return atualizarSequencia(executar, usuarioId, hoje);
    });
}

function criar(usuarioId, resultados) {
    var hoje = dataAtualSaoPaulo();
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
    var valores = [usuarioId, hoje];

    modosOrdenados.forEach(function(modo) {
        var resultado = resultadosPorModo[modo];
        valores.push(resultado.tentativas, resultado.acertou, resultado.pistas);
    });

    return database.executarTransacao(function(executar) {
        return executar(instrucaoSql, valores).then(function(resultadoPartida) {
            return atualizarSequencia(executar, usuarioId, hoje).then(function(sequencia) {
                return {
                    id: resultadoPartida.insertId,
                    sequencia: sequencia
                };
            });
        });
    });
}

function buscarSequencia(usuarioId) {
    var hoje = dataAtualSaoPaulo();
    return database.executar(`
        SELECT
            streak_atual AS atual,
            streak_maior AS maior,
            DATE_FORMAT(streak_ultima_data, '%Y-%m-%d') AS ultimaData
        FROM usuario
        WHERE id = ?
    `, [usuarioId]).then(function(usuarios) {
        if (usuarios.length == 0) {
            return null;
        }
        return buscarDias(database.executar, usuarioId, hoje).then(function(dias) {
            return montarSequencia(usuarios[0], hoje, dias);
        });
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

function gerarConsultaResultados(usuarioId, inicio, fim) {
    var filtroData = inicio ? " AND data_partida BETWEEN ? AND ?" : "";
    var parametros = [usuarioId];
    if (inicio) {
        parametros.push(inicio, fim);
    }

    var sql = `
        SELECT usuario_id, id AS partida_id, data_partida, 'jogador' AS modo,
            jogador_tentativas AS tentativas, jogador_acertou AS acertou
        FROM partida
        WHERE usuario_id = ?${filtroData}
        UNION ALL
        SELECT usuario_id, id AS partida_id, data_partida, 'abertura' AS modo,
            abertura_tentativas AS tentativas, abertura_acertou AS acertou
        FROM partida
        WHERE usuario_id = ?${filtroData}
        UNION ALL
        SELECT usuario_id, id AS partida_id, data_partida, 'citacao' AS modo,
            citacao_tentativas AS tentativas, citacao_acertou AS acertou
        FROM partida
        WHERE usuario_id = ?${filtroData}
    `;

    return {
        sql: sql,
        valores: parametros.concat(parametros, parametros)
    };
}

function dataHaDias(hoje, quantidade) {
    var data = new Date(hoje + "T00:00:00Z");
    data.setUTCDate(data.getUTCDate() - quantidade);
    return data.toISOString().slice(0, 10);
}

function numeroOuNulo(valor) {
    return valor == null ? null : Number(valor);
}

function buscarEstatisticas(usuarioId, dias) {
    var hoje = dataAtualSaoPaulo();
    var inicio = dias == "todos" ? null : dataHaDias(hoje, Number(dias) - 1);
    var conjunto = gerarConsultaResultados(usuarioId, inicio, hoje);
    var parametrosAtividade = [usuarioId, dataHaDias(hoje, 89), hoje];

    var consultaResumo = database.executar(`
        SELECT
            COUNT(DISTINCT partida_id) AS partidas,
            COUNT(*) AS desafios,
            SUM(acertou = 1) AS acertos,
            ROUND(AVG(CASE WHEN acertou = 1 THEN tentativas END), 2) AS mediaTentativasVitorias
        FROM (${conjunto.sql}) AS resultados
    `, conjunto.valores);

    var consultaSerie = database.executar(`
        SELECT
            DATE_FORMAT(data_partida, '%Y-%m-%d') AS data,
            COUNT(DISTINCT partida_id) AS partidas,
            SUM(acertou = 1) AS acertos,
            ROUND(100 * SUM(acertou = 1) / COUNT(*), 2) AS taxaAcerto,
            ROUND(AVG(CASE WHEN acertou = 1 THEN tentativas END), 2) AS mediaTentativas
        FROM (${conjunto.sql}) AS resultados
        GROUP BY data_partida
        ORDER BY data_partida
    `, conjunto.valores);

    var consultaDistribuicao = database.executar(`
        SELECT
            CASE WHEN acertou = 1 THEN tentativas ELSE 0 END AS tentativas,
            COUNT(*) AS quantidade
        FROM (${conjunto.sql}) AS resultados
        GROUP BY CASE WHEN acertou = 1 THEN tentativas ELSE 0 END
    `, conjunto.valores);

    var consultaModos = database.executar(`
        SELECT
            modo,
            COUNT(*) AS partidas,
            SUM(acertou = 1) AS acertos,
            ROUND(100 * SUM(acertou = 1) / COUNT(*), 2) AS taxaAcerto,
            ROUND(AVG(CASE WHEN acertou = 1 THEN tentativas END), 2) AS mediaTentativas
        FROM (${conjunto.sql}) AS resultados
        GROUP BY modo
    `, conjunto.valores);

    var consultaAtividade = database.executar(`
        SELECT
            DATE_FORMAT(data_partida, '%Y-%m-%d') AS data,
            COUNT(DISTINCT id) AS partidas
        FROM partida
        WHERE usuario_id = ? AND data_partida BETWEEN ? AND ?
        GROUP BY data_partida
        ORDER BY data_partida
    `, parametrosAtividade);

    return Promise.all([
        consultaResumo,
        consultaSerie,
        consultaDistribuicao,
        consultaModos,
        consultaAtividade,
        buscarSequencia(usuarioId)
    ]).then(function(resultados) {
        if (resultados[5] == null) {
            return null;
        }
        var resumoBanco = resultados[0][0];
        var totalDesafios = Number(resumoBanco.desafios) || 0;
        var distribuicaoBanco = resultados[2];
        var quantidades = {};
        distribuicaoBanco.forEach(function(item) {
            quantidades[Number(item.tentativas)] = Number(item.quantidade);
        });

        var modosBanco = {};
        resultados[3].forEach(function(item) {
            modosBanco[item.modo] = item;
        });

        return {
            resumo: {
                partidas: Number(resumoBanco.partidas) || 0,
                taxaAcerto: totalDesafios == 0 ? 0 :
                    Math.round(Number(resumoBanco.acertos || 0) * 10000 / totalDesafios) / 100,
                mediaTentativasVitorias: numeroOuNulo(resumoBanco.mediaTentativasVitorias),
                sequenciaAtual: resultados[5].atual,
                maiorSequencia: resultados[5].maior
            },
            serie: resultados[1].map(function(item) {
                return {
                    data: item.data,
                    partidas: Number(item.partidas),
                    acertos: Number(item.acertos),
                    taxaAcerto: Number(item.taxaAcerto),
                    mediaTentativas: numeroOuNulo(item.mediaTentativas)
                };
            }),
            distribuicao: [1, 2, 3, 4, 5, 6, 0].map(function(tentativas) {
                return {
                    tentativas: tentativas == 0 ? null : tentativas,
                    rotulo: tentativas == 0 ? "Não acertou" :
                        tentativas + (tentativas == 1 ? " tentativa" : " tentativas"),
                    quantidade: quantidades[tentativas] || 0
                };
            }),
            porModo: modosOrdenados.map(function(modo) {
                var item = modosBanco[modo];
                return {
                    modo: modo,
                    partidas: item ? Number(item.partidas) : 0,
                    acertos: item ? Number(item.acertos) : 0,
                    taxaAcerto: item ? Number(item.taxaAcerto) : 0,
                    mediaTentativas: item ? numeroOuNulo(item.mediaTentativas) : null
                };
            }),
            atividade: resultados[4].map(function(item) {
                return { data: item.data, partidas: Number(item.partidas) };
            })
        };
    });
}

module.exports = {
    criar,
    registrarConclusao,
    buscarSequencia,
    dataAtualSaoPaulo,
    buscarPorId,
    buscarHistoricoPorUsuario,
    buscarEstatisticas,
    modosOrdenados
};
