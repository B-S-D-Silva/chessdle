var database = require("../database/config");

function buscarCitacaoDoDia(dataHoje) {
    return database.executarTransacao(function(executar) {
        return executar(
            `SELECT c.id, c.autor AS resposta, c.texto AS conteudo, c.dica1, c.dica2
            FROM citacao_desafio_diario diario
            JOIN citacao_desafio c ON c.id = diario.citacao_id
            WHERE diario.data_desafio = ?
            FOR UPDATE`,
            [dataHoje]
        ).then(function(citacoes) {
            if (citacoes.length > 0) {
                return citacoes[0];
            }

            return executar("SELECT COUNT(*) AS quantidade FROM citacao_desafio")
                .then(function(resultados) {
                    var quantidade = Number(resultados[0].quantidade);
                    if (quantidade == 0) {
                        return null;
                    }

                    var partesData = dataHoje.split("-").map(Number);
                    var diasDesdeEpoch = Math.floor(Date.UTC(
                        partesData[0],
                        partesData[1] - 1,
                        partesData[2]
                    ) / 86400000);
                    var deslocamento = diasDesdeEpoch % quantidade;

                    return executar(
                        "SELECT id FROM citacao_desafio ORDER BY id LIMIT 1 OFFSET ?",
                        [deslocamento]
                    ).then(function(candidatas) {
                        return executar(
                            `INSERT IGNORE INTO citacao_desafio_diario
                                (data_desafio, citacao_id)
                            VALUES (?, ?)`,
                            [dataHoje, candidatas[0].id]
                        );
                    }).then(function() {
                        return executar(
                            `SELECT c.id, c.autor AS resposta, c.texto AS conteudo, c.dica1, c.dica2
                            FROM citacao_desafio_diario diario
                            JOIN citacao_desafio c ON c.id = diario.citacao_id
                            WHERE diario.data_desafio = ?
                            FOR UPDATE`,
                            [dataHoje]
                        ).then(function(citacoes) {
                            return citacoes[0];
                        });
                    });
                });
        });
    });
}

function buscarConteudo(dataHoje) {
    var consultas = [
        "SELECT modo, titulo, descricao, pergunta, resposta, conteudo FROM desafio_config ORDER BY FIELD(modo, 'jogador', 'abertura', 'citacao')",
        "SELECT modo, valor FROM opcao_desafio ORDER BY id",
        "SELECT modo, ordem, texto FROM dica_desafio ORDER BY modo, ordem",
        "SELECT nome, dica, nascimento, pais, continente FROM jogador ORDER BY id",
        "SELECT nome, classificacao, primeiro_lance, resposta_pretas, lances, eco FROM abertura ORDER BY id"
    ];

    return Promise.all(consultas.map(function(consulta) {
        return database.executar(consulta);
    }).concat([buscarCitacaoDoDia(dataHoje)])).then(function(resultados) {
        var citacaoDoDia = resultados[5];
        return {
            desafios: resultados[0].map(function(desafio) {
                var eCitacao = desafio.modo == "citacao";
                return {
                    modo: desafio.modo,
                    titulo: desafio.titulo,
                    descricao: desafio.descricao,
                    pergunta: desafio.pergunta,
                    resposta: eCitacao && citacaoDoDia ? citacaoDoDia.resposta : desafio.resposta,
                    conteudo: eCitacao && citacaoDoDia ? citacaoDoDia.conteudo : desafio.conteudo,
                    opcoes: eCitacao ?
                        resultados[3].map(function(jogador) { return jogador.nome; }) :
                        resultados[1]
                            .filter(function(opcao) { return opcao.modo == desafio.modo; })
                            .map(function(opcao) { return opcao.valor; }),
                    dicas: eCitacao && citacaoDoDia ?
                        [citacaoDoDia.dica1, citacaoDoDia.dica2] :
                        resultados[2]
                            .filter(function(dica) { return dica.modo == desafio.modo; })
                            .map(function(dica) { return dica.texto; })
                };
            }),
            jogadores: resultados[3].map(function(jogador) {
                return {
                    nome: jogador.nome,
                    dica: jogador.dica,
                    nascimento: Number(jogador.nascimento),
                    pais: jogador.pais,
                    continente: jogador.continente
                };
            }),
            aberturas: resultados[4].map(function(abertura) {
                var lances = typeof abertura.lances == "string" ?
                    JSON.parse(abertura.lances) : abertura.lances;
                return {
                    nome: abertura.nome,
                    classificacao: abertura.classificacao,
                    primeiroLance: abertura.primeiro_lance,
                    respostaPretas: abertura.resposta_pretas,
                    lances: lances,
                    eco: abertura.eco
                };
            })
        };
    });
}

module.exports = {
    buscarConteudo
};
