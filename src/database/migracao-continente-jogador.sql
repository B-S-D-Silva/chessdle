-- Adiciona continente aos enxadristas existentes.
-- Divisão usada: América do Norte, América Central e Caribe, América do Sul,
-- Europa, Eurásia, Ásia, África e Oceania.
ALTER TABLE jogador
    ADD COLUMN continente VARCHAR(32) NOT NULL DEFAULT 'Não informado';

UPDATE jogador
SET continente = CASE
    WHEN pais IN ('Estados Unidos', 'Canadá', 'México') THEN 'América do Norte'
    WHEN pais IN ('Cuba', 'Jamaica', 'Haiti', 'República Dominicana',
                  'Porto Rico', 'Costa Rica', 'Panamá', 'Guatemala',
                  'Honduras', 'El Salvador', 'Nicarágua') THEN 'América Central e Caribe'
    WHEN pais IN ('Brasil', 'Argentina', 'Chile', 'Colômbia', 'Peru',
                  'Uruguai', 'Paraguai', 'Bolívia', 'Equador', 'Venezuela') THEN 'América do Sul'
    WHEN pais IN ('Rússia', 'Russia', 'Império Russo', 'Imperio Russo') THEN 'Eurásia'
    WHEN pais IN ('Noruega', 'Hungria', 'Alemanha', 'França', 'Países Baixos',
                  'Bulgária', 'Letônia', 'Latvia', 'Império Austríaco',
                  'Imperio Austriaco', 'Reino Unido', 'Espanha', 'Itália',
                  'Polônia', 'Ucrânia', 'Suécia', 'Dinamarca', 'Sérvia',
                  'República Tcheca', 'Áustria', 'Suíça', 'Romênia',
                  'Países Baixos') THEN 'Europa'
    WHEN pais IN ('Índia', 'India', 'China', 'Irã', 'Ira', 'Japão', 'Coreia do Sul',
                  'Coreia do Norte', 'Armênia', 'Armenia', 'Azerbaijão',
                  'Geórgia', 'Turquia', 'Israel', 'Cazaquistão') THEN 'Ásia'
    WHEN pais IN ('Austrália', 'Nova Zelândia', 'Fiji', 'Samoa') THEN 'Oceania'
    WHEN pais IN ('África do Sul', 'Egito', 'Nigéria', 'Etiópia', 'Quênia',
                  'Gana', 'Marrocos', 'Argélia') THEN 'África'
    ELSE continente
END;
