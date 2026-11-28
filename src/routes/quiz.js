const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { exigirSessao } = require("../middleware/sessao");

router.post("/resultados", exigirSessao, function (req, res) {
    quizController.salvar(req, res);
});

router.get("/dashboard", exigirSessao, function (req, res) {
    quizController.dashboard(req, res);
});

module.exports = router;
