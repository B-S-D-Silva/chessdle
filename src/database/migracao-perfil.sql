-- Migração incremental para adicionar os campos de perfil sem apagar dados.
USE chessdle;

ALTER TABLE usuario
    ADD COLUMN descricao VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN rating_chess_com SMALLINT UNSIGNED NULL;
