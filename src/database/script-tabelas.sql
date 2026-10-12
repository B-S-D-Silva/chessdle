-- ATENCAO: este script apaga o banco chessdle e todos os dados existentes.
-- Destinado somente ao ambiente de desenvolvimento.
DROP DATABASE IF EXISTS chessdle;
CREATE DATABASE chessdle;
USE chessdle;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Uma linha representa uma partida completa com os tres desafios diarios.
CREATE TABLE partida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    data_partida DATE NOT NULL,
    jogador_tentativas TINYINT UNSIGNED NOT NULL,
    jogador_acertou BOOLEAN NOT NULL,
    jogador_pistas TINYINT UNSIGNED NOT NULL,
    abertura_tentativas TINYINT UNSIGNED NOT NULL,
    abertura_acertou BOOLEAN NOT NULL,
    abertura_pistas TINYINT UNSIGNED NOT NULL,
    citacao_tentativas TINYINT UNSIGNED NOT NULL,
    citacao_acertou BOOLEAN NOT NULL,
    citacao_pistas TINYINT UNSIGNED NOT NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX (usuario_id, data_partida)
);
