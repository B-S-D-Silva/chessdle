let router = require("express").Router();
let controller = require("../controllers/quizController");
let exigirSessao = require("../middleware/sessao").exigirSessao;

router.use(exigirSessao);
router.post("/resultados", controller.salvar);
router.get("/dashboard", controller.dashboard);

module.exports = router;
