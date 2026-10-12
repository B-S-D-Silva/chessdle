var express = require("express");
var router = express.Router();
var desafioController = require("../controllers/desafioController");

router.get("/", function(req, res) {
    desafioController.listar(req, res);
});

module.exports = router;
