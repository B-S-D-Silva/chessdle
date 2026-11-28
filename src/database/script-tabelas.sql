-- Novo banco: não apaga contas nem recria o banco existente.
CREATE DATABASE IF NOT EXISTS chessdle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chessdle;
CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_tentativa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    chave_tentativa VARCHAR(60) NOT NULL,
    versao CHAR(64) NOT NULL,
    acertos SMALLINT UNSIGNED NOT NULL,
    total SMALLINT UNSIGNED NOT NULL,
    finalizada_em DATETIME NOT NULL,
    CONSTRAINT fk_quiz_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    UNIQUE KEY tentativa_unica (usuario_id, chave_tentativa),
    INDEX historico_usuario (usuario_id, id)
);

CREATE TABLE IF NOT EXISTS quiz_resposta (
    tentativa_id INT NOT NULL,
    ordem SMALLINT UNSIGNED NOT NULL,
    enunciado VARCHAR(500) NOT NULL,
    alternativa_escolhida VARCHAR(500) NOT NULL,
    alternativa_correta VARCHAR(500) NOT NULL,
    acertou BOOLEAN NOT NULL,
    PRIMARY KEY (tentativa_id, ordem),
    CONSTRAINT fk_resposta_tentativa FOREIGN KEY (tentativa_id) REFERENCES quiz_tentativa(id)
);
