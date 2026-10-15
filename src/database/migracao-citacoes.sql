-- Permite cadastrar várias citações e manter uma citação estável para cada dia.
-- Execute uma vez em bancos existentes, depois de carregar jogador e desafio_config.
CREATE TABLE IF NOT EXISTS citacao_desafio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    autor VARCHAR(100) NOT NULL,
    texto VARCHAR(500) NOT NULL,
    dica1 VARCHAR(255) NOT NULL,
    dica2 VARCHAR(255) NOT NULL,
    UNIQUE KEY (autor, texto),
    FOREIGN KEY (autor) REFERENCES jogador(nome) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS citacao_desafio_diario (
    data_desafio DATE PRIMARY KEY,
    citacao_id INT NOT NULL,
    FOREIGN KEY (citacao_id) REFERENCES citacao_desafio(id)
);

-- Migra a citação atualmente configurada, se o autor e as duas pistas existirem.
INSERT IGNORE INTO citacao_desafio (autor, texto, dica1, dica2)
SELECT
    configuracao.resposta,
    configuracao.conteudo,
    jogador.dica,
    CONCAT('Nasceu em ', jogador.pais, ' em ', jogador.nascimento, '.')
FROM desafio_config configuracao
JOIN jogador ON jogador.nome = configuracao.resposta
WHERE configuracao.modo = 'citacao'
  AND configuracao.resposta IS NOT NULL
  AND configuracao.conteudo IS NOT NULL;
