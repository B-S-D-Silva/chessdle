-- Dados ficticios para demonstrar o dashboard. Crie antes uma conta com este e-mail.
-- Execute somente em um banco de desenvolvimento/teste; nao apaga partidas existentes.
SET @usuario_demo_id = (
    SELECT id
    FROM usuario
    WHERE email = 'dashboard.demo@chessdle.local'
    LIMIT 1
);

-- A coluna data_partida armazena o dia civil de Sao Paulo, como faz a aplicacao.
SET @hoje_sao_paulo = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '-03:00'));

INSERT INTO partida (
    usuario_id, data_partida,
    jogador_tentativas, jogador_acertou, jogador_pistas,
    abertura_tentativas, abertura_acertou, abertura_pistas,
    citacao_tentativas, citacao_acertou, citacao_pistas
)
SELECT
    @usuario_demo_id,
    DATE_SUB(@hoje_sao_paulo, INTERVAL demo.dia DAY),
    MOD(demo.dia + demo.partida_numero, 6) + 1,
    MOD(demo.dia + demo.partida_numero, 4) <> 0,
    MOD(demo.dia, 3),
    MOD(demo.dia + demo.partida_numero + 2, 6) + 1,
    MOD(demo.dia + 1, 3) <> 0,
    MOD(demo.dia + 1, 3),
    MOD(demo.dia + demo.partida_numero + 4, 6) + 1,
    MOD(demo.dia + 2, 5) <> 0,
    MOD(demo.dia + 2, 3)
FROM (
    SELECT dias.dia, partidas.partida_numero
    FROM (
        SELECT unidades.n + dezenas.n * 10 AS dia
        FROM (
            SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        ) AS unidades
        CROSS JOIN (
            SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        ) AS dezenas
    ) AS dias
    CROSS JOIN (SELECT 1 AS partida_numero UNION ALL SELECT 2) AS partidas
    WHERE dias.dia < 42
        AND partidas.partida_numero <= IF(MOD(dias.dia, 7) = 0, 2, 1)
) AS demo
WHERE @usuario_demo_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM partida existente
        WHERE existente.usuario_id = @usuario_demo_id
            AND existente.data_partida = DATE_SUB(@hoje_sao_paulo, INTERVAL demo.dia DAY)
    );

INSERT IGNORE INTO streak_dia (usuario_id, data_conclusao)
SELECT
    @usuario_demo_id,
    DATE_SUB(@hoje_sao_paulo, INTERVAL dias.dia DAY)
FROM (
    SELECT unidades.n + dezenas.n * 10 AS dia
    FROM (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) AS unidades
    CROSS JOIN (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    ) AS dezenas
) AS dias
WHERE @usuario_demo_id IS NOT NULL AND dias.dia < 42;

UPDATE usuario
SET
    streak_atual = 42,
    streak_maior = GREATEST(streak_maior, 42),
    streak_ultima_data = @hoje_sao_paulo
WHERE id = @usuario_demo_id;

SELECT
    @usuario_demo_id AS usuario_demo_id,
    (SELECT COUNT(*) FROM partida WHERE usuario_id = @usuario_demo_id) AS partidas_no_banco,
    (SELECT COUNT(*) FROM streak_dia WHERE usuario_id = @usuario_demo_id) AS dias_com_sequencia;
