-- Migração incremental para bancos que já possuem a tabela abertura.
-- Execute uma única vez antes de iniciar a aplicação com o novo código.
ALTER TABLE abertura
    ADD COLUMN lances JSON NULL,
    ADD COLUMN eco VARCHAR(3) NULL;

UPDATE abertura
SET lances = '["e4","e5","Cf3","Cc6","Bc4","Bc5","c3","Cf6","d4","exd4","cxd4","Bb4+","Cc3"]',
    eco = 'C50'
WHERE nome = 'Abertura Italiana';

UPDATE abertura
SET lances = '["e4","c5","Cf3","d6","d4","cxd4","Cxd4","Cf6","Cc3","a6"]',
    eco = 'B20'
WHERE nome = 'Defesa Siciliana';

UPDATE abertura
SET lances = '["e4","e5","Cf3","Cc6","Bb5","a6","Ba4","Cf6","O-O","Be7","Te1","b5","Bb3","d6"]',
    eco = 'C60'
WHERE nome = 'Ruy López';

UPDATE abertura
SET lances = '["d4","d5","c4","e6","Cc3","Cf6","Bg5","Be7","e3","O-O","Cf3","h6"]',
    eco = 'D06'
WHERE nome = 'Gambito da Dama';

ALTER TABLE abertura
    MODIFY COLUMN lances JSON NOT NULL,
    MODIFY COLUMN eco VARCHAR(3) NOT NULL;
