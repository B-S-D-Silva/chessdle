var desafioModel = require("../models/desafioModel");

function listar(req, res) {
    desafioModel.buscarConteudo()
        .then(function(conteudo) {
            var modosEsperados = ["jogador", "abertura", "citacao"];
            var configuracoesValidas = conteudo.desafios.length == modosEsperados.length &&
                conteudo.desafios.every(function(desafio, indice) {
                    return desafio.modo == modosEsperados[indice] &&
                        desafio.opcoes.length > 0 &&
                        (desafio.modo == "jogador" ? desafio.dicas.length == 0 : desafio.dicas.length == 2);
                });
            var nomesJogadores = conteudo.jogadores.map(function(jogador) { return jogador.nome; });
            var nomesAberturas = conteudo.aberturas.map(function(abertura) { return abertura.nome; });
            var opcoesPorModo = {};
            conteudo.desafios.forEach(function(desafio) {
                opcoesPorModo[desafio.modo] = desafio.opcoes;
            });

            var conteudoValido = configuracoesValidas &&
                conteudo.jogadores.length > 0 &&
                conteudo.aberturas.length > 0 &&
                conteudo.jogadores.every(function(jogador) {
                    return jogador.nome && jogador.dica && jogador.nascimento && jogador.pais;
                }) &&
                conteudo.aberturas.every(function(abertura) {
                    return abertura.nome && abertura.classificacao &&
                        abertura.primeiroLance && abertura.respostaPretas &&
                        Array.isArray(abertura.lances) && abertura.lances.length > 0 &&
                        abertura.lances.every(function(lance) { return typeof lance == "string" && lance.length > 0; }) &&
                        /^[A-E][0-9]{2}$/.test(abertura.eco);
                }) &&
                opcoesPorModo.jogador.every(function(nome) { return nomesJogadores.indexOf(nome) >= 0; }) &&
                opcoesPorModo.abertura.every(function(nome) { return nomesAberturas.indexOf(nome) >= 0; }) &&
                opcoesPorModo.citacao.every(function(nome) { return nomesJogadores.indexOf(nome) >= 0; }) &&
                opcoesPorModo.abertura.indexOf(conteudo.desafios[1].resposta) >= 0 &&
                opcoesPorModo.citacao.indexOf(conteudo.desafios[2].resposta) >= 0 &&
                nomesJogadores.indexOf(conteudo.desafios[2].resposta) >= 0 &&
                conteudo.desafios[2].conteudo;

            if (!conteudoValido) {
                res.status(500).send("O conteúdo dos desafios está incompleto no banco de dados.");
                return;
            }
            res.json(conteudo);
        })
        .catch(function(erro) {
            console.error("Não foi possível carregar o conteúdo dos desafios.", erro);
            res.status(500).send("Não foi possível carregar os desafios.");
        });
}

module.exports = {
    listar
};
