var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(function(resultadoAutenticar) {
                if (resultadoAutenticar.length == 1) {
                    res.json(resultadoAutenticar[0]);
                } else if (resultadoAutenticar.length == 0) {
                    res.status(403).send("Email e/ou senha inválido(s)");
                } else {
                    res.status(409).send("Mais de um usuário com o mesmo e-mail e senha.");
                }
            })
            .catch(function(erro) {
                console.error("Houve um erro ao realizar o login.", erro);
                res.status(500).send("Não foi possível realizar o login.");
            });
    }

}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else {
        usuarioModel.cadastrar(nome, email, senha)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.error("Houve um erro ao realizar o cadastro.", erro);
                    res.status(500).send("Não foi possível realizar o cadastro.");
                }
            );
    }
}

function obterPerfil(req, res) {
    var usuarioId = Number(req.params.id);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        res.status(400).send("Identificador do usuário inválido.");
        return;
    }

    usuarioModel.buscarPerfil(usuarioId)
        .then(function(perfil) {
            if (perfil == null) {
                res.status(404).send("Usuário não encontrado.");
                return;
            }
            res.json(perfil);
        })
        .catch(function(erro) {
            console.error("Não foi possível carregar o perfil.", erro);
            res.status(500).send("Não foi possível carregar o perfil.");
        });
}

function atualizarPerfil(req, res) {
    var usuarioId = Number(req.params.id);
    var corpo = req.body || {};
    var descricao = corpo.descricao;
    var ratingChessCom = corpo.ratingChessCom;

    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 ||
        typeof descricao != "string" || descricao.length > 500 ||
        !(ratingChessCom == null ||
          (Number.isInteger(ratingChessCom) && ratingChessCom >= 0 && ratingChessCom <= 4000))) {
        res.status(400).send("Dados do perfil inválidos.");
        return;
    }

    usuarioModel.atualizarPerfil(usuarioId, descricao.trim(), ratingChessCom)
        .then(function() {
            return usuarioModel.buscarPerfil(usuarioId);
        })
        .then(function(perfil) {
            if (perfil == null) {
                res.status(404).send("Usuário não encontrado.");
                return;
            }
            res.json(perfil);
        })
        .catch(function(erro) {
            console.error("Não foi possível atualizar o perfil.", erro);
            res.status(500).send("Não foi possível atualizar o perfil.");
        });
}

module.exports = {
    autenticar,
    cadastrar,
    obterPerfil,
    atualizarPerfil
}