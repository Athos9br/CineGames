PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS titulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Filme', 'Jogo')),
    genero TEXT NOT NULL,
    ano INTEGER NOT NULL,
    plataforma TEXT,
    nota REAL NOT NULL DEFAULT 0 CHECK (nota >= 0 AND nota <= 10),
    descricao TEXT,
    categoria_id INTEGER NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

INSERT OR IGNORE INTO categorias (id, nome, descricao) VALUES
(1, 'Ação', 'Filmes e jogos com bastante movimento e aventura.'),
(2, 'Aventura', 'Histórias de exploração e descobertas.'),
(3, 'Drama', 'Obras com foco em histórias e conflitos pessoais.'),
(4, 'Ficção científica', 'Histórias com tecnologia, espaço e futuro.'),
(5, 'RPG', 'Jogos com evolução de personagens e narrativa.');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Interestelar', 'Filme', 'Ficção científica', 2014, 'Cinema / Streaming', 8.7,
       'Um grupo de astronautas viaja pelo espaço em busca de um lugar para a humanidade.', 4
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Interestelar');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Homem-Aranha: Sem Volta para Casa', 'Filme', 'Ação', 2021, 'Cinema / Streaming', 8.2,
       'Peter Parker enfrenta as consequências de ter sua identidade revelada.', 1
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Homem-Aranha: Sem Volta para Casa');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'O Rei Leão', 'Filme', 'Aventura', 1994, 'Cinema / Streaming', 8.5,
       'Simba precisa encontrar seu caminho e assumir seu lugar no reino.', 2
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'O Rei Leão');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'À Procura da Felicidade', 'Filme', 'Drama', 2006, 'Cinema / Streaming', 8.0,
       'Um pai enfrenta dificuldades enquanto tenta construir uma vida melhor para seu filho.', 3
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'À Procura da Felicidade');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Matrix', 'Filme', 'Ficção científica', 1999, 'Cinema / Streaming', 8.7,
       'Um programador descobre que a realidade não é exatamente o que parece.', 4
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Matrix');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Vingadores: Ultimato', 'Filme', 'Ação', 2019, 'Cinema / Streaming', 8.4,
       'Os heróis tentam reverter os efeitos de um acontecimento que mudou o universo.', 1
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Vingadores: Ultimato');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'The Last of Us Part I', 'Jogo', 'Aventura', 2022, 'PlayStation / PC', 9.2,
       'Joel e Ellie atravessam um mundo perigoso após uma grande epidemia.', 2
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'The Last of Us Part I');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'God of War Ragnarök', 'Jogo', 'Ação', 2022, 'PlayStation', 9.4,
       'Kratos e Atreus enfrentam novos desafios durante os acontecimentos do Ragnarök.', 1
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'God of War Ragnarök');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Minecraft', 'Jogo', 'Aventura', 2011, 'PC / Console / Celular', 8.8,
       'Um jogo de exploração e construção em um mundo feito de blocos.', 2
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Minecraft');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'The Witcher 3', 'Jogo', 'RPG', 2015, 'PC / PlayStation / Xbox', 9.5,
       'Geralt de Rívia procura por Ciri em um mundo cheio de perigos e escolhas.', 5
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'The Witcher 3');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Red Dead Redemption 2', 'Jogo', 'Aventura', 2018, 'PC / PlayStation / Xbox', 9.7,
       'Arthur Morgan tenta sobreviver com sua gangue no fim da era do Velho Oeste.', 2
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Red Dead Redemption 2');

INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
SELECT 'Cyberpunk 2077', 'Jogo', 'RPG', 2020, 'PC / PlayStation / Xbox', 8.6,
       'Em uma cidade futurista, o jogador acompanha a jornada de V.', 5
WHERE NOT EXISTS (SELECT 1 FROM titulos WHERE nome = 'Cyberpunk 2077');
