-- Novo banco: não apaga contas nem recria o banco existente.
CREATE DATABASE IF NOT EXISTS chessdle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chessdle;
CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
-- Em um banco antigo, aplique migracao-site-pessoal.sql após um backup.
