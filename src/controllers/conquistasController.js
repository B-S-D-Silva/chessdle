var conquistasModel = require("../models/conquistasModel");

function obter(req, res) {
    var usuarioId = Number(req.query.usuarioId);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        res.status(401).send("Entre na sua conta para consultar suas conquistas.");
        return;
    }

    conquistasModel.buscarTodas(usuarioId)
        .then(function(resultado) {
            if (resultado == null) {
                res.status(404).send("Usuário não encontrado.");
                return;
            }
            res.json(resultado);
        })
        .catch(function(erro) {
            console.error("Não foi possível consultar as conquistas.", erro);
            res.status(500).send("Não foi possível carregar suas conquistas.");
        });
}

module.exports = { obter: obter };
