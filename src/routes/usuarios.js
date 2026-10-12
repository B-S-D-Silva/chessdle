var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/:id/perfil", function(req, res) {
    usuarioController.obterPerfil(req, res);
});

router.put("/:id/perfil", function(req, res) {
    usuarioController.atualizarPerfil(req, res);
});

module.exports = router;