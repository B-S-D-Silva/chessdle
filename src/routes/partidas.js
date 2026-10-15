var express = require("express");
var router = express.Router();
var partidaController = require("../controllers/partidaController");

router.post("/", function(req, res) {
    partidaController.registrar(req, res);
});

router.post("/concluir", function(req, res) {
    partidaController.registrarConclusaoDesafio(req, res);
});

router.get("/historico/:usuarioId", function(req, res) {
    partidaController.obterHistorico(req, res);
});

router.get("/:id", function(req, res) {
    partidaController.obterPorId(req, res);
});

module.exports = router;
