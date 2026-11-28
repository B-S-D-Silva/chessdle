const path = require("node:path");
const ambiente = process.env.AMBIENTE_PROCESSO || "desenvolvimento";
require("dotenv").config({ path: path.join(__dirname, ambiente === "producao" ? ".env" : ".env.dev") });
const express = require("express");
const { exigirSessao } = require("./src/middleware/sessao");
const usuarioRouter = require("./src/routes/usuarios");
const quizRouter = require("./src/routes/quiz");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    if (req.method !== "GET" && req.method !== "HEAD" && req.headers.origin &&
        req.headers.origin !== req.protocol + "://" + req.get("host")) {
        return res.status(403).json({ mensagem: "Origem da requisição não permitida." });
    }
    next();
});
app.use("/usuarios", usuarioRouter);
app.use("/quiz", quizRouter);
app.get("/quiz.html", exigirSessao, (req, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));
app.get("/dashboard.html", exigirSessao, (req, res) => res.sendFile(path.join(__dirname, "public/dashboard.html")));
app.get("/js/questoes.js", exigirSessao, (req, res) => res.sendFile(path.join(__dirname, "public/js/questoes.js")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));
for (const arquivo of ["index.html", "historia.html", "ranking.html", "login.html", "cadastro.html", "css/site.css", "css/historia.css", "css/dashboard.css", "js/site.js", "js/autenticacao.js", "js/quiz.js", "js/dashboard.js"]) {
    app.get("/" + arquivo, (req, res) => res.sendFile(path.join(__dirname, "public", arquivo)));
}
app.use("/assets/home", express.static(path.join(__dirname, "public/assets/home"), { index: false, dotfiles: "deny" }));
app.use("/assets/jogadores", express.static(path.join(__dirname, "public/assets/jogadores"), { index: false, dotfiles: "deny" }));
app.use("/assets/memorias", express.static(path.join(__dirname, "public/assets/memorias"), { index: false, dotfiles: "deny" }));
app.use((req, res) => res.status(404).send("Página não encontrada. Volte ao início."));
app.use((erro, req, res, next) => {
    res.status(erro.status === 400 ? 400 : 500).json({ mensagem: erro.status === 400 ? "Requisição inválida." : "Não foi possível concluir a operação." });
});
if (require.main === module) {
    const porta = Number(process.env.APP_PORT) || 8080;
    app.listen(porta, () => console.log("Site disponível em http://" + (process.env.APP_HOST || "localhost") + ":" + porta));
}
module.exports = app;
