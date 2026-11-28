let quizModel = require("../models/quizModel");
let quiz = require("../services/quiz");

function salvar(req, res) {
    let respostas = req.body.respostas;
    let chave = req.body.chaveTentativa;

    if (typeof chave !== "string" || !/^[0-9]{10,16}-[0-9]{1,10}$/.test(chave)) {
        res.status(400).json({ mensagem: "Identificador da tentativa inválido." });
        return;
    }

    let resultado = quiz.corrigir(respostas);

    if (!resultado) {
        res.status(400).json({ mensagem: "Responda todas as perguntas." });
        return;
    }

    quizModel.salvar(req.usuario.id, chave, resultado).then(function (salvo) {
        res.status(201).json(salvo);
    }).catch(function (erro) {
        if (erro.code === "QUIZ_TENTATIVA_DIFERENTE") {
            res.status(409).json({ mensagem: "Tentativa já salva. Use Tentar de novo para iniciar outra." });
        } else {
            res.status(500).json({ mensagem: "Não foi possível salvar. Tente novamente." });
        }
    });
}

function dashboard(req, res) {
    quizModel.dashboard(req.usuario.id).then(function (dados) {
        res.json(dados);
    }).catch(function () {
        res.status(500).json({ mensagem: "Não foi possível carregar seu desempenho." });
    });
}

module.exports = { salvar, dashboard };
