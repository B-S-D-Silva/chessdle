-- Cria o catalogo e as conquistas dos usuarios sem apagar dados existentes.
-- Execute depois de migracao-streak.sql; o desbloqueio retroativo usa streak_maior.
CREATE TABLE IF NOT EXISTS conquistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    icone VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario_conquista (
    fkUsuario INT NOT NULL,
    fkConquista INT NOT NULL,
    dataDesbloqueio DATE NOT NULL,
    PRIMARY KEY (fkUsuario, fkConquista),
    FOREIGN KEY (fkUsuario) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (fkConquista) REFERENCES conquistas(id) ON DELETE CASCADE
);

INSERT IGNORE INTO conquistas (codigo, nome, descricao, icone) VALUES
('primeira-partida', 'Primeira partida', 'Conclua seu primeiro desafio diário.', 'peao'),
('acertou-de-primeira', 'Acertou de primeira', 'Acerte qualquer desafio na primeira tentativa.', 'alvo'),
('sem-erro', 'Sem erro', 'Acerte cinco desafios em até duas tentativas.', 'escudo'),
('sequencia-7', '7 dias de sequência', 'Jogue ao menos um desafio por sete dias seguidos.', 'chama'),
('sequencia-30', '30 dias de sequência', 'Jogue ao menos um desafio por 30 dias seguidos.', 'coroa'),
('aberturas-10', '10 aberturas acertadas', 'Acerte dez desafios de Adivinhe a abertura.', 'torre'),
('citacoes-10', 'Fã de citações', 'Acerte dez desafios do modo Citação.', 'citacao'),
('jogadores-10', 'Detetive', 'Acerte dez desafios de Adivinhe o jogador.', 'lupa'),
('mestre-tres-modos', 'Mestre dos três modos', 'Acerte os três desafios do mesmo dia.', 'tres-pecas'),
('persistente', 'Persistente', 'Acerte um desafio exatamente na sexta tentativa.', 'trofeu');

-- Conquistas baseadas no historico de partidas ja persistido.
-- A data de desbloqueio retroativo corresponde a data em que esta migracao e executada.
WITH totais AS (
    SELECT
        usuario_id,
        COUNT(*) AS partidas,
        SUM(
            (jogador_acertou = 1 AND jogador_tentativas = 1) +
            (abertura_acertou = 1 AND abertura_tentativas = 1) +
            (citacao_acertou = 1 AND citacao_tentativas = 1)
        ) AS acertos_de_primeira,
        SUM(
            (jogador_acertou = 1 AND jogador_tentativas <= 2) +
            (abertura_acertou = 1 AND abertura_tentativas <= 2) +
            (citacao_acertou = 1 AND citacao_tentativas <= 2)
        ) AS acertos_ate_duas,
        SUM(abertura_acertou = 1) AS aberturas,
        SUM(citacao_acertou = 1) AS citacoes,
        SUM(jogador_acertou = 1) AS jogadores,
        SUM(jogador_acertou = 1 AND abertura_acertou = 1 AND citacao_acertou = 1) AS dias_perfeitos,
        SUM(
            (jogador_acertou = 1 AND jogador_tentativas = 6) +
            (abertura_acertou = 1 AND abertura_tentativas = 6) +
            (citacao_acertou = 1 AND citacao_tentativas = 6)
        ) AS acertos_na_sexta
    FROM partida
    GROUP BY usuario_id
),
elegiveis AS (
    SELECT usuario_id, 'primeira-partida' AS codigo FROM totais WHERE partidas >= 1
    UNION ALL
    SELECT usuario_id, 'acertou-de-primeira' FROM totais WHERE acertos_de_primeira >= 1
    UNION ALL
    SELECT usuario_id, 'sem-erro' FROM totais WHERE acertos_ate_duas >= 5
    UNION ALL
    SELECT id, 'sequencia-7' FROM usuario WHERE streak_maior >= 7
    UNION ALL
    SELECT id, 'sequencia-30' FROM usuario WHERE streak_maior >= 30
    UNION ALL
    SELECT usuario_id, 'aberturas-10' FROM totais WHERE aberturas >= 10
    UNION ALL
    SELECT usuario_id, 'citacoes-10' FROM totais WHERE citacoes >= 10
    UNION ALL
    SELECT usuario_id, 'jogadores-10' FROM totais WHERE jogadores >= 10
    UNION ALL
    SELECT usuario_id, 'mestre-tres-modos' FROM totais WHERE dias_perfeitos >= 1
    UNION ALL
    SELECT usuario_id, 'persistente' FROM totais WHERE acertos_na_sexta >= 1
)
INSERT IGNORE INTO usuario_conquista (fkUsuario, fkConquista, dataDesbloqueio)
SELECT elegiveis.usuario_id, conquistas.id, CURRENT_DATE()
FROM elegiveis
JOIN conquistas ON conquistas.codigo = elegiveis.codigo;
