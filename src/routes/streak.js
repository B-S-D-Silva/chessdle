var express = require("express");
var router = express.Router();
var partidaController = require("../controllers/partidaController");

router.get("/", function(req, res) {
    partidaController.obterSequencia(req, res);
});

module.exports = router;
