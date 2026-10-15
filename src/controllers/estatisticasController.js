var partidaModel = require("../models/partidaModel");

var periodosPermitidos = ["7", "30", "90", "todos"];

function obter(req, res) {
    var usuarioId = Number(req.query.usuarioId);
    var dias = req.query.dias || "30";

    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        res.status(401).send("Entre na sua conta para consultar suas estatísticas.");
        return;
    }
    if (periodosPermitidos.indexOf(dias) < 0) {
        res.status(400).send("O período deve ser 7, 30, 90 ou todos.");
        return;
    }

    partidaModel.buscarEstatisticas(usuarioId, dias)
        .then(function(estatisticas) {
            if (estatisticas == null) {
                res.status(404).send("Usuário não encontrado.");
                return;
            }
            res.json(estatisticas);
        })
        .catch(function(erro) {
            console.error("Não foi possível carregar as estatísticas.", erro);
            res.status(500).send("Não foi possível carregar suas estatísticas.");
        });
}

module.exports = { obter: obter };
