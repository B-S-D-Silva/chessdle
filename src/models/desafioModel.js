var database = require("../database/config");

function buscarConteudo() {
    var consultas = [
        "SELECT modo, titulo, descricao, pergunta, resposta, conteudo FROM desafio_config ORDER BY FIELD(modo, 'jogador', 'abertura', 'citacao')",
        "SELECT modo, valor FROM opcao_desafio ORDER BY id",
        "SELECT modo, ordem, texto FROM dica_desafio ORDER BY modo, ordem",
        "SELECT nome, dica, nascimento, pais FROM jogador ORDER BY id",
        "SELECT nome, classificacao, primeiro_lance, resposta_pretas FROM abertura ORDER BY id"
    ];

    return Promise.all(consultas.map(function(consulta) {
        return database.executar(consulta);
    })).then(function(resultados) {
        return {
            desafios: resultados[0].map(function(desafio) {
                return {
                    modo: desafio.modo,
                    titulo: desafio.titulo,
                    descricao: desafio.descricao,
                    pergunta: desafio.pergunta,
                    resposta: desafio.resposta,
                    conteudo: desafio.conteudo,
                    opcoes: resultados[1]
                        .filter(function(opcao) { return opcao.modo == desafio.modo; })
                        .map(function(opcao) { return opcao.valor; }),
                    dicas: resultados[2]
                        .filter(function(dica) { return dica.modo == desafio.modo; })
                        .map(function(dica) { return dica.texto; })
                };
            }),
            jogadores: resultados[3].map(function(jogador) {
                return {
                    nome: jogador.nome,
                    dica: jogador.dica,
                    nascimento: Number(jogador.nascimento),
                    pais: jogador.pais
                };
            }),
            aberturas: resultados[4].map(function(abertura) {
                return {
                    nome: abertura.nome,
                    classificacao: abertura.classificacao,
                    primeiroLance: abertura.primeiro_lance,
                    respostaPretas: abertura.resposta_pretas
                };
            })
        };
    });
}

module.exports = {
    buscarConteudo
};
