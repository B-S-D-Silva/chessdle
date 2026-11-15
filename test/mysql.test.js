const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

test("MySQL: gravação, repetição, KPIs e isolamento com rollback", {
    skip: process.env.TESTE_MYSQL !== "1"
}, async () => {
    require("../app");
    const db = require("../src/database/config");
    const modelo = require("../src/models/quizModel");
    const quiz = require("../src/services/quiz");
    const questoes = require("../public/js/questoes");
    const { criarHash } = require("../src/services/senha");
    const executarOriginal = db.executar;
    const transacaoOriginal = db.executarTransacao;
    const email = `teste-${randomUUID()}@integracao.invalid`;
    const emailOutra = `outro-${randomUUID()}@integracao.invalid`;
    const senha = await criarHash("senha-temporaria-de-teste");
    let validado = false;

    try {
        await transacaoOriginal(async function (executar) {
            db.executar = executar;
            db.executarTransacao = operacao => operacao(executar);

            const usuario = await executar("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", ["Teste temporário", email, senha]);
            const outro = await executar("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", ["Outro teste", emailOutra, senha]);
            const certas = questoes.map(item => item.respostaCorreta);
            const metade = certas.map((resposta, i) => i < questoes.length / 2 ? resposta : (resposta + 1) % questoes[i].alternativas.length);
            const chave = `${Date.now()}-111`;
            const primeira = await modelo.salvar(usuario.insertId, chave, quiz.corrigir(metade));
            const repetida = await modelo.salvar(usuario.insertId, chave, quiz.corrigir(metade));
            assert.equal(repetida.id, primeira.id);
            await assert.rejects(modelo.salvar(usuario.insertId, chave, quiz.corrigir(certas)), { code: "QUIZ_TENTATIVA_DIFERENTE" });
            await modelo.salvar(usuario.insertId, `${Date.now()}-222`, quiz.corrigir(certas));
            await modelo.salvar(outro.insertId, `${Date.now()}-333`, quiz.corrigir(certas));

            const dados = await modelo.dashboard(usuario.insertId);
            assert.equal(dados.resumo.tentativas, 2);
            assert.equal(dados.resumo.mediaAcertos, 75);
            assert.equal(dados.resumo.melhorResultado, 100);
            assert.equal(dados.resumo.evolucao, 50);
            assert.equal(dados.recentes.length, 2);
            assert.equal(Number(dados.recentes[0].percentual), 50);
            assert.equal(Number(dados.recentes[1].percentual), 100);
            assert.ok(dados.revisao.length > 0);
            assert.match(dados.recentes[0].data, /Z$/);
            assert.equal((await modelo.dashboard(outro.insertId)).resumo.tentativas, 1);
            const respostas = await executar("SELECT COUNT(*) AS total FROM quiz_resposta WHERE tentativa_id = ?", [primeira.id]);
            assert.equal(respostas[0].total, questoes.length);
            validado = true;
            throw Object.assign(new Error("Desfazer dados temporários"), { code: "ROLLBACK_TESTE" });
        });
    } catch (erro) {
        if (erro.code !== "ROLLBACK_TESTE") throw erro;
    } finally {
        db.executar = executarOriginal;
        db.executarTransacao = transacaoOriginal;
    }

    assert.equal(validado, true);
    const usuarios = await db.executar("SELECT COUNT(*) AS total FROM usuario WHERE email IN (?, ?)", [email, emailOutra]);
    assert.equal(usuarios[0].total, 0);
});
