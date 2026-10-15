var express = require("express");
var router = express.Router();
var conquistasController = require("../controllers/conquistasController");

router.get("/", function(req, res) {
    conquistasController.obter(req, res);
});

module.exports = router;
