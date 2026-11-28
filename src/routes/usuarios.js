const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { exigirSessao } = require("../middleware/sessao");

router.use(function (req, res, next) {
    res.set("Cache-Control", "no-store");
    next();
});

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/sessao", exigirSessao, function (req, res) {
    usuarioController.sessao(req, res);
});

router.post("/sair", function (req, res) {
    usuarioController.sair(req, res);
});

module.exports = router;
