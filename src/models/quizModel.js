let database = require("../database/config");

function salvar(usuarioId, chave, resultado) {
    return database.executarTransacao(async function (executar) {
        await executar(
            "INSERT INTO quiz_tentativa (usuario_id, chave_tentativa, versao, acertos, total, finalizada_em) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
            [usuarioId, chave, resultado.versao, resultado.acertos, resultado.total]
        );

        let linhas = await executar(
            "SELECT id, acertos, total FROM quiz_tentativa WHERE usuario_id = ? AND chave_tentativa = ?",
            [usuarioId, chave]
        );
        let tentativa = linhas[0];
        let existentes = await executar(
            "SELECT COUNT(*) AS total FROM quiz_resposta WHERE tentativa_id = ?",
            [tentativa.id]
        );

        if (Number(existentes[0].total) === 0) {
            for (let i = 0; i < resultado.detalhes.length; i++) {
                let resposta = resultado.detalhes[i];
                await executar(
                    "INSERT INTO quiz_resposta (tentativa_id, ordem, enunciado, alternativa_escolhida, alternativa_correta, acertou) VALUES (?, ?, ?, ?, ?, ?)",
                    [tentativa.id, i + 1, resposta.enunciado, resposta.alternativaEscolhida, resposta.alternativaCorreta, resposta.acertou]
                );
            }
        } else {
            let anteriores = await executar(
                "SELECT enunciado, alternativa_escolhida, alternativa_correta FROM quiz_resposta WHERE tentativa_id = ? ORDER BY ordem",
                [tentativa.id]
            );
            let igual = anteriores.length === resultado.detalhes.length;

            for (let i = 0; i < anteriores.length && igual; i++) {
                if (anteriores[i].enunciado !== resultado.detalhes[i].enunciado ||
                    anteriores[i].alternativa_escolhida !== resultado.detalhes[i].alternativaEscolhida ||
                    anteriores[i].alternativa_correta !== resultado.detalhes[i].alternativaCorreta) {
                    igual = false;
                }
            }

            if (!igual) {
                let erro = new Error("Tentativa já registrada com outras respostas.");
                erro.code = "QUIZ_TENTATIVA_DIFERENTE";
                throw erro;
            }
        }

        return { id: tentativa.id, acertos: tentativa.acertos, total: tentativa.total };
    });
}

async function dashboard(usuarioId) {
    let resumo = await database.executar(
        "SELECT COUNT(*) AS tentativas, ROUND(AVG(100.0 * acertos / total), 1) AS mediaAcertos, ROUND(MAX(100.0 * acertos / total), 1) AS melhorResultado FROM quiz_tentativa WHERE usuario_id = ?",
        [usuarioId]
    );
    let recentes = await database.executar(
        "SELECT id, acertos, total, ROUND(100.0 * acertos / total, 1) AS percentual, DATE_FORMAT(finalizada_em, '%Y-%m-%dT%H:%i:%sZ') AS data FROM quiz_tentativa WHERE usuario_id = ? ORDER BY id DESC LIMIT 10",
        [usuarioId]
    );
    let revisao = await database.executar(
        "SELECT r.enunciado, COUNT(*) AS respostas, SUM(r.acertou) AS acertos, SUM(1 - r.acertou) AS erros FROM quiz_resposta r JOIN quiz_tentativa t ON t.id = r.tentativa_id WHERE t.usuario_id = ? GROUP BY r.enunciado HAVING SUM(1 - r.acertou) > 0 ORDER BY (SUM(1 - r.acertou) / COUNT(*)) DESC, erros DESC, r.enunciado LIMIT 3",
        [usuarioId]
    );

    let evolucao = null;

    if (recentes.length >= 2) {
        evolucao = Math.round((Number(recentes[0].percentual) - Number(recentes[1].percentual)) * 10) / 10;
    }

    let ordemCronologica = [];

    for (let i = recentes.length - 1; i >= 0; i--) {
        ordemCronologica.push(recentes[i]);
    }

    return {
        resumo: {
            tentativas: Number(resumo[0].tentativas),
            mediaAcertos: Number(resumo[0].mediaAcertos || 0),
            melhorResultado: Number(resumo[0].melhorResultado || 0),
            evolucao: evolucao
        },
        recentes: ordemCronologica,
        revisao: revisao
    };
}

module.exports = { salvar, dashboard };
