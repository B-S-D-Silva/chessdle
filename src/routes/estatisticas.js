var express = require("express");
var router = express.Router();
var estatisticasController = require("../controllers/estatisticasController");

router.get("/", function(req, res) {
    estatisticasController.obter(req, res);
});

module.exports = router;
