-- ATENCAO: este script apaga o banco chessdle e todos os dados existentes.
-- Destinado somente ao ambiente de desenvolvimento.
DROP DATABASE IF EXISTS chessdle;
CREATE DATABASE chessdle;
USE chessdle;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    descricao VARCHAR(500) NOT NULL DEFAULT '',
    rating_chess_com SMALLINT UNSIGNED NULL,
    streak_atual INT UNSIGNED NOT NULL DEFAULT 0,
    streak_maior INT UNSIGNED NOT NULL DEFAULT 0,
    streak_ultima_data DATE NULL
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

CREATE TABLE conquistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    icone VARCHAR(40) NOT NULL
);

CREATE TABLE usuario_conquista (
    fkUsuario INT NOT NULL,
    fkConquista INT NOT NULL,
    dataDesbloqueio DATE NOT NULL,
    PRIMARY KEY (fkUsuario, fkConquista),
    FOREIGN KEY (fkUsuario) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (fkConquista) REFERENCES conquistas(id) ON DELETE CASCADE
);

INSERT INTO conquistas (codigo, nome, descricao, icone) VALUES
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

CREATE TABLE streak_dia (
    usuario_id INT NOT NULL,
    data_conclusao DATE NOT NULL,
    PRIMARY KEY (usuario_id, data_conclusao),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE desafio_config (
    modo ENUM('jogador', 'abertura', 'citacao') PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    pergunta VARCHAR(255) NOT NULL,
    resposta VARCHAR(150),
    conteudo TEXT
);

CREATE TABLE opcao_desafio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    modo ENUM('jogador', 'abertura', 'citacao') NOT NULL,
    valor VARCHAR(150) NOT NULL,
    FOREIGN KEY (modo) REFERENCES desafio_config(modo) ON DELETE CASCADE,
    UNIQUE KEY (modo, valor)
);

CREATE TABLE dica_desafio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    modo ENUM('jogador', 'abertura', 'citacao') NOT NULL,
    ordem TINYINT UNSIGNED NOT NULL,
    texto VARCHAR(255) NOT NULL,
    FOREIGN KEY (modo) REFERENCES desafio_config(modo) ON DELETE CASCADE,
    UNIQUE KEY (modo, ordem)
);

CREATE TABLE jogador (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    dica VARCHAR(255) NOT NULL,
    nascimento SMALLINT UNSIGNED NOT NULL,
    pais VARCHAR(100) NOT NULL
);

CREATE TABLE citacao_desafio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    autor VARCHAR(100) NOT NULL,
    texto VARCHAR(500) NOT NULL,
    dica1 VARCHAR(255) NOT NULL,
    dica2 VARCHAR(255) NOT NULL,
    UNIQUE KEY (autor, texto),
    FOREIGN KEY (autor) REFERENCES jogador(nome) ON UPDATE CASCADE
);

CREATE TABLE citacao_desafio_diario (
    data_desafio DATE PRIMARY KEY,
    citacao_id INT NOT NULL,
    FOREIGN KEY (citacao_id) REFERENCES citacao_desafio(id)
);

CREATE TABLE abertura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    classificacao VARCHAR(50) NOT NULL,
    primeiro_lance VARCHAR(50) NOT NULL,
    resposta_pretas VARCHAR(50) NOT NULL,
    lances JSON NOT NULL,
    eco VARCHAR(3) NOT NULL
);

INSERT INTO desafio_config (modo, titulo, descricao, pergunta, resposta, conteudo) VALUES
('jogador', 'Adivinhe o jogador', 'Descubra qual grande nome do xadrez está escondido.', 'Quem é o enxadrista misterioso?', NULL, NULL),
('abertura', 'Adivinhe a abertura', 'Reconheça a abertura pelos lances.', '1. e4 e5  2. Nf3 Nc6  3. Bc4', 'Abertura Italiana', NULL),
('citacao', 'De quem é a citação?', 'Descubra quem disse esta frase.', 'Quem disse esta frase?', 'José Raúl Capablanca', '“O xadrez é a vida em miniatura.”');

INSERT INTO opcao_desafio (modo, valor) VALUES
('jogador', 'Magnus Carlsen'),
('jogador', 'Garry Kasparov'),
('jogador', 'Bobby Fischer'),
('jogador', 'Judit Polgár'),
('jogador', 'Hikaru Nakamura'),
('jogador', 'José Raúl Capablanca'),
('jogador', 'Viswanathan Anand'),
('jogador', 'Fabiano Caruana'),
('abertura', 'Abertura Italiana'),
('abertura', 'Defesa Siciliana'),
('abertura', 'Ruy López'),
('abertura', 'Gambito da Dama'),
('citacao', 'Bobby Fischer'),
('citacao', 'Garry Kasparov'),
('citacao', 'Magnus Carlsen'),
('citacao', 'José Raúl Capablanca');

INSERT INTO dica_desafio (modo, ordem, texto) VALUES
('abertura', 1, 'O bispo branco vai para c4.'),
('abertura', 2, 'A abertura começa com 1. e4 e5.'),
('citacao', 1, 'Nasceu em Cuba.'),
('citacao', 2, 'Foi campeão mundial entre 1921 e 1927.');

INSERT INTO jogador (nome, dica, nascimento, pais) VALUES
('Magnus Carlsen', 'É um grande mestre norueguês.', 1990, 'Noruega'),
('Garry Kasparov', 'Foi campeão mundial por quinze anos.', 1963, 'Rússia'),
('Bobby Fischer', 'Enfrentou Spassky no match de 1972.', 1943, 'Estados Unidos'),
('Judit Polgár', 'É considerada a maior enxadrista da história.', 1976, 'Hungria'),
('Hikaru Nakamura', 'É um dos maiores nomes do xadrez online.', 1987, 'Estados Unidos'),
('José Raúl Capablanca', 'Foi um grande enxadrista cubano.', 1888, 'Cuba'),
('Viswanathan Anand', 'Foi o primeiro campeão mundial indiano.', 1969, 'Índia'),
('Fabiano Caruana', 'Disputou o título mundial em 2018.', 1992, 'Estados Unidos');

INSERT INTO citacao_desafio (autor, texto, dica1, dica2) VALUES
('José Raúl Capablanca', '“O xadrez é a vida em miniatura.”',
 'Nasceu em Cuba.', 'Foi campeão mundial entre 1921 e 1927.');

INSERT INTO abertura (nome, classificacao, primeiro_lance, resposta_pretas, lances, eco) VALUES
('Abertura Italiana', 'Aberta', '1. e4', '1... e5',
 '["e4","e5","Cf3","Cc6","Bc4","Bc5","c3","Cf6","d4","exd4","cxd4","Bb4+","Cc3"]', 'C50'),
('Defesa Siciliana', 'Semiaberta', '1. e4', '1... c5',
 '["e4","c5","Cf3","d6","d4","cxd4","Cxd4","Cf6","Cc3","a6"]', 'B20'),
('Ruy López', 'Aberta', '1. e4', '1... e5',
 '["e4","e5","Cf3","Cc6","Bb5","a6","Ba4","Cf6","O-O","Be7","Te1","b5","Bb3","d6"]', 'C60'),
('Gambito da Dama', 'Fechada', '1. d4', '1... d5',
 '["d4","d5","c4","e6","Cc3","Cf6","Bg5","Be7","e3","O-O","Cf3","h6"]', 'D06');
