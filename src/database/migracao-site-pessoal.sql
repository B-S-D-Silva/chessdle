-- MIGRAÇÃO MANUAL E DESTRUTIVA: faça backup antes de executar.
-- Mantém os IDs, nomes, e-mails e senhas das contas existentes.
-- Apaga permanentemente partidas, desafios, conquistas e sequências.
-- Execute no banco chessdle correspondente ao ambiente desejado.
USE chessdle;

-- Ordem respeita as dependências do schema anterior.
DROP TABLE IF EXISTS usuario_conquista;
DROP TABLE IF EXISTS conquistas;
DROP TABLE IF EXISTS streak_dia;
DROP TABLE IF EXISTS partida;
DROP TABLE IF EXISTS citacao_desafio_diario;
DROP TABLE IF EXISTS citacao_desafio;
DROP TABLE IF EXISTS dica_desafio;
DROP TABLE IF EXISTS opcao_desafio;
DROP TABLE IF EXISTS desafio_config;
DROP TABLE IF EXISTS abertura;
DROP TABLE IF EXISTS jogador;

-- Remove apenas os campos conhecidos do perfil e da sequência.
-- Consulta o schema para permitir executar novamente a migração.
SET @colunas_remover = (
    SELECT GROUP_CONCAT(CONCAT('DROP COLUMN `', COLUMN_NAME, '`') SEPARATOR ', ')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario'
      AND COLUMN_NAME IN ('descricao', 'rating_chess_com', 'streak_atual', 'streak_maior', 'streak_ultima_data')
);
SET @sql_simplificar = IF(@colunas_remover IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE usuario ', @colunas_remover));
PREPARE simplificar FROM @sql_simplificar;
EXECUTE simplificar;
DEALLOCATE PREPARE simplificar;
-- As senhas legadas são convertidas para hash no primeiro login válido.
