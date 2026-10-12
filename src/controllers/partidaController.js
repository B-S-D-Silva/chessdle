var partidaModel = require("../models/partidaModel");

var modosPermitidos = partidaModel.modosOrdenados;

function ehDataValida(data) {
    if (typeof data != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }
    var dataConvertida = new Date(data + "T00:00:00Z");
    return !isNaN(dataConvertida.getTime()) && dataConvertida.toISOString().slice(0, 10) == data;
}

function validarResultados(resultados) {
    if (!Array.isArray(resultados) || resultados.length != modosPermitidos.length) {
        return false;
    }

    var modosRecebidos = [];
    for (var i = 0; i < resultados.length; i++) {
        var resultado = resultados[i];
        if (!resultado || modosPermitidos.indexOf(resultado.modo) < 0 ||
            modosRecebidos.indexOf(resultado.modo) >= 0 ||
            !Number.isInteger(resultado.tentativas) || resultado.tentativas < 1 || resultado.tentativas > 6 ||
            typeof resultado.acertou != "boolean" ||
            !Number.isInteger(resultado.pistas) || resultado.pistas < 0 || resultado.pistas > 2) {
            return false;
        }
        modosRecebidos.push(resultado.modo);
    }

    return modosPermitidos.every(function(modo) {
        return modosRecebidos.indexOf(modo) >= 0;
    });
}

function registrar(req, res) {
    var usuarioId = Number(req.body.usuarioId);
    var dataPartida = req.body.data;
    var resultados = req.body.resultados;

    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 ||
        !ehDataValida(dataPartida) || !validarResultados(resultados)) {
        res.status(400).send("Dados da partida inválidos.");
        return;
    }

    partidaModel.criar(usuarioId, dataPartida, resultados)
        .then(function(partidaId) {
            res.status(201).json({ id: partidaId });
        })
        .catch(function(erro) {
            if (erro.errno == 1216 || erro.errno == 1452 ||
                erro.code == "ER_NO_REFERENCED_ROW" || erro.code == "ER_NO_REFERENCED_ROW_2") {
                res.status(401).send("Sua conta não existe no banco atual. Entre novamente ou crie sua conta e refaça a partida.");
                return;
            }
            console.error("Não foi possível salvar a partida.", erro);
            res.status(500).send("Não foi possível salvar o resultado da partida.");
        });
}

function obterPorId(req, res) {
    var partidaId = Number(req.params.id);
    var usuarioId = Number(req.query.usuarioId);
    if (!Number.isSafeInteger(partidaId) || partidaId < 1 ||
        !Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        res.status(400).send("Identificadores da partida ou do usuário inválidos.");
        return;
    }

    partidaModel.buscarPorId(partidaId, usuarioId)
        .then(function(partidas) {
            if (partidas == null) {
                res.status(404).send("Partida não encontrada.");
                return;
            }
            res.json(partidas);
        })
        .catch(function(erro) {
            console.error("Não foi possível consultar a partida.", erro);
            res.status(500).send("Não foi possível carregar o resultado da partida.");
        });
}

module.exports = {
    registrar,
    obterPorId
};
