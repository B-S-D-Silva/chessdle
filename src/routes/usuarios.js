const router = require("express").Router();
const controller = require("../controllers/usuarioController");
const { exigirSessao, encerrarSessao } = require("../middleware/sessao");
router.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
router.post("/cadastrar", controller.cadastrar);
router.post("/autenticar", controller.autenticar);
router.get("/sessao", exigirSessao, (req, res) => res.json(req.usuario));
router.post("/sair", (req, res) => { encerrarSessao(req, res); res.sendStatus(204); });
module.exports = router;
