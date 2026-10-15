-- Adiciona as sequências e inicializa os valores com o histórico de partidas.
-- A análise histórica usa as datas DATE já gravadas em partida e requer MySQL 8.0+.
ALTER TABLE usuario
    ADD COLUMN streak_atual INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN streak_maior INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN streak_ultima_data DATE NULL;

CREATE TABLE streak_dia (
    usuario_id INT NOT NULL,
    data_conclusao DATE NOT NULL,
    PRIMARY KEY (usuario_id, data_conclusao),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

INSERT IGNORE INTO streak_dia (usuario_id, data_conclusao)
SELECT DISTINCT usuario_id, data_partida
FROM partida;

WITH datas AS (
    SELECT usuario_id, data_conclusao AS data_partida
    FROM streak_dia
),
datas_anteriores AS (
    SELECT
        usuario_id,
        data_partida,
        LAG(data_partida) OVER (
            PARTITION BY usuario_id
            ORDER BY data_partida
        ) AS data_anterior
    FROM datas
),
grupos AS (
    SELECT
        usuario_id,
        data_partida,
        SUM(
            CASE
                WHEN data_anterior IS NULL OR DATEDIFF(data_partida, data_anterior) <> 1 THEN 1
                ELSE 0
            END
        ) OVER (
            PARTITION BY usuario_id
            ORDER BY data_partida
            ROWS UNBOUNDED PRECEDING
        ) AS grupo
    FROM datas_anteriores
),
totais AS (
    SELECT
        usuario_id,
        MAX(data_partida) AS ultima_data_grupo,
        COUNT(*) AS dias_consecutivos
    FROM grupos
    GROUP BY usuario_id, grupo
),
ultimas AS (
    SELECT usuario_id, MAX(data_partida) AS ultima_data
    FROM datas
    GROUP BY usuario_id
),
resumo AS (
    SELECT
        ultimas.usuario_id,
        ultimas.ultima_data,
        MAX(totais.dias_consecutivos) AS maior,
        MAX(
            CASE
                WHEN totais.ultima_data_grupo = ultimas.ultima_data THEN totais.dias_consecutivos
                ELSE 0
            END
        ) AS atual
    FROM ultimas
    JOIN totais ON totais.usuario_id = ultimas.usuario_id
    GROUP BY ultimas.usuario_id, ultimas.ultima_data
)
UPDATE usuario
JOIN resumo ON resumo.usuario_id = usuario.id
SET
    usuario.streak_atual = resumo.atual,
    usuario.streak_maior = resumo.maior,
    usuario.streak_ultima_data = resumo.ultima_data;
