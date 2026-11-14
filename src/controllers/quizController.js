let quizModel = require("../models/quizModel");
let quiz = require("../services/quiz");

async function salvar(req, res) {
    let corpo = req.body || {};
    let chave = corpo.chaveTentativa;

    if (typeof chave !== "string" || !/^[0-9]{10,16}-[0-9]{1,10}$/.test(chave)) {
        return res.status(400).json({ mensagem: "Identificador da tentativa inválido." });
    }

    let resultado = quiz.corrigir(corpo.respostas);

    if (!resultado) {
        return res.status(400).json({ mensagem: "Responda todas as perguntas com alternativas válidas." });
    }

    try {
        let salvo = await quizModel.salvar(req.usuario.id, chave, resultado);
        res.status(201).json(salvo);
    } catch (erro) {
        if (erro.code === "QUIZ_TENTATIVA_DIFERENTE") {
            return res.status(409).json({ mensagem: "Esta tentativa já foi salva. Veja o dashboard ou use Tentar de novo para iniciar outra." });
        }
        console.error("Erro ao salvar o quiz:", erro.code);
        res.status(500).json({ mensagem: "Não foi possível salvar seu resultado. Suas respostas continuam na tela; tente novamente." });
    }
}

async function dashboard(req, res) {
    try {
        res.json(await quizModel.dashboard(req.usuario.id));
    } catch (erro) {
        console.error("Erro ao consultar o dashboard:", erro.code);
        res.status(500).json({ mensagem: "Não foi possível carregar seu desempenho. Tente novamente." });
    }
}

module.exports = { salvar, dashboard };
