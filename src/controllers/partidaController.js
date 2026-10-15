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

    partidaModel.criar(usuarioId, resultados)
        .then(function(partida) {
            res.status(201).json(partida);
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

function registrarConclusaoDesafio(req, res) {
    var usuarioId = Number(req.body.usuarioId);
    var modo = req.body.modo;

    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 ||
        modosPermitidos.indexOf(modo) < 0) {
        res.status(400).send("Dados da conclusão do desafio inválidos.");
        return;
    }

    partidaModel.registrarConclusao(usuarioId)
        .then(function(sequencia) {
            res.status(200).json({ sequencia: sequencia });
        })
        .catch(function(erro) {
            if (erro.errno == 1216 || erro.errno == 1452 ||
                erro.code == "ER_NO_REFERENCED_ROW" || erro.code == "ER_NO_REFERENCED_ROW_2") {
                res.status(401).send("Sua conta não existe no banco atual. Entre novamente para salvar sua sequência.");
                return;
            }
            console.error("Não foi possível registrar a conclusão do desafio.", erro);
            res.status(500).send("Não foi possível salvar sua sequência.");
        });
}

function obterSequencia(req, res) {
    var usuarioId = Number(req.query.usuarioId);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        res.status(401).send("Entre na sua conta para consultar sua sequência.");
        return;
    }

    partidaModel.buscarSequencia(usuarioId)
        .then(function(sequencia) {
            if (sequencia == null) {
                res.status(404).send("Usuário não encontrado.");
                return;
            }
            res.json(sequencia);
        })
        .catch(function(erro) {
            console.error("Não foi possível consultar a sequência.", erro);
            res.status(500).send("Não foi possível carregar a sequência.");
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

function obterHistorico(req, res) {
    var usuarioId = Number(req.params.usuarioId);
    var offsetInformado = req.query.offset;
    var deslocamento = offsetInformado == null ? 0 : Number(offsetInformado);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 ||
        (offsetInformado != null &&
            (typeof offsetInformado != "string" || !/^\d+$/.test(offsetInformado))) ||
        !Number.isSafeInteger(deslocamento) || deslocamento < 0) {
        res.status(400).send("Parâmetros do histórico inválidos.");
        return;
    }

    partidaModel.buscarHistoricoPorUsuario(usuarioId, 10, deslocamento)
        .then(function(historico) {
            res.json(historico);
        })
        .catch(function(erro) {
            console.error("Não foi possível consultar o histórico de partidas.", erro);
            res.status(500).send("Não foi possível carregar o histórico de partidas.");
        });
}

module.exports = {
    registrar,
    registrarConclusaoDesafio,
    obterSequencia,
    obterPorId,
    obterHistorico
};
