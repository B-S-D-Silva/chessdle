const path = require("path");
const ambiente = process.env.AMBIENTE_PROCESSO || "desenvolvimento";
require("dotenv").config({ path: path.join(__dirname, ambiente === "producao" ? ".env" : ".env.dev") });
const express = require("express");
const usuarioRouter = require("./src/routes/usuarios");
const quizRouter = require("./src/routes/quiz");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(function (req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    if (req.method !== "GET" && req.method !== "HEAD" && req.headers.origin &&
        req.headers.origin !== req.protocol + "://" + req.get("host")) {
        return res.status(403).json({ mensagem: "Origem da requisição não permitida." });
    }
    next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use("/usuarios", usuarioRouter);
app.use("/quiz", quizRouter);

app.use((req, res) => res.status(404).send("Página não encontrada. Volte ao início."));
app.use((erro, req, res, next) => {
    res.status(erro.status === 400 ? 400 : 500).json({ mensagem: erro.status === 400 ? "Requisição inválida." : "Não foi possível concluir a operação." });
});
if (require.main === module) {
    const porta = Number(process.env.APP_PORT) || 8080;
    app.listen(porta, () => console.log("Site disponível em http://" + (process.env.APP_HOST || "localhost") + ":" + porta));
}
module.exports = app;
