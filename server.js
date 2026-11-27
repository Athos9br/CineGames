const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const databaseFolder = path.join(__dirname, "database");
const databasePath = path.join(databaseFolder, "cinegames.db");
const schemaPath = path.join(databaseFolder, "schema.sql");

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder, { recursive: true });
}

const db = new sqlite3.Database(databasePath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function iniciarBanco() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  await run("PRAGMA foreign_keys = ON");
  await new Promise((resolve, reject) => {
    db.exec(schema, (error) => error ? reject(error) : resolve());
  });
  console.log("Banco de dados pronto.");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validarTitulo(dados) {
  const { nome, tipo, genero, ano, nota, categoria_id } = dados;

  if (!nome || !nome.trim()) return "Informe o nome do título.";
  if (!["Filme", "Jogo"].includes(tipo)) return "Escolha se é filme ou jogo.";
  if (!genero || !genero.trim()) return "Informe o gênero.";
  if (!Number.isInteger(Number(ano)) || Number(ano) < 1888 || Number(ano) > 2100) {
    return "Informe um ano válido.";
  }
  if (nota === "" || nota === undefined || Number(nota) < 0 || Number(nota) > 10 || Number.isNaN(Number(nota))) {
    return "A nota deve ficar entre 0 e 10.";
  }
  if (!Number.isInteger(Number(categoria_id)) || Number(categoria_id) < 1) {
    return "Escolha uma categoria.";
  }
  return null;
}

app.get("/api/categorias", async (req, res) => {
  try {
    const categorias = await all("SELECT * FROM categorias ORDER BY nome");
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ erro: "Não foi possível carregar as categorias." });
  }
});

// Lista títulos. Também aceita pesquisa, filtro, paginação e ordenação.
app.get("/api/titulos", async (req, res) => {
  try {
    const nome = (req.query.nome || "").trim();
    const tipo = req.query.tipo || "";
    const categoriaId = req.query.categoria_id || "";
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const sortPermitido = ["nome", "ano", "nota", "tipo"];
    const sort = sortPermitido.includes(req.query.sort) ? req.query.sort : "nome";
    const order = req.query.order === "desc" ? "DESC" : "ASC";

    let where = " WHERE 1 = 1";
    const params = [];

    if (nome) {
      where += " AND t.nome LIKE ?";
      params.push(`%${nome}%`);
    }
    if (tipo === "Filme" || tipo === "Jogo") {
      where += " AND t.tipo = ?";
      params.push(tipo);
    }
    if (categoriaId && Number.isInteger(Number(categoriaId))) {
      where += " AND t.categoria_id = ?";
      params.push(Number(categoriaId));
    }

    const totalRow = await get(
      `SELECT COUNT(*) AS total FROM titulos t ${where}`, params
    );
    const total = totalRow.total;
    const offset = (page - 1) * limit;

    const titulos = await all(
      `SELECT t.*, c.nome AS categoria
       FROM titulos t
       JOIN categorias c ON c.id = t.categoria_id
       ${where}
       ORDER BY t.${sort} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      dados: titulos,
      pagina: page,
      limite: limit,
      total,
      totalPaginas: Math.max(Math.ceil(total / limit), 1)
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar os títulos." });
  }
});

// Consulta um título específico.
app.get("/api/titulos/:id", async (req, res) => {
  try {
    const titulo = await get(
      `SELECT t.*, c.nome AS categoria
       FROM titulos t JOIN categorias c ON c.id = t.categoria_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!titulo) return res.status(404).json({ erro: "Título não encontrado." });
    res.json(titulo);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao consultar o título." });
  }
});

// Cadastra um novo filme ou jogo.
app.post("/api/titulos", async (req, res) => {
  try {
    const erro = validarTitulo(req.body);
    if (erro) return res.status(400).json({ erro });

    const categoria = await get("SELECT id FROM categorias WHERE id = ?", [req.body.categoria_id]);
    if (!categoria) return res.status(400).json({ erro: "A categoria escolhida não existe." });

    const resultado = await run(
      `INSERT INTO titulos (nome, tipo, genero, ano, plataforma, nota, descricao, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.nome.trim(), req.body.tipo, req.body.genero.trim(),
        Number(req.body.ano), (req.body.plataforma || "").trim(),
        Number(req.body.nota), (req.body.descricao || "").trim(),
        Number(req.body.categoria_id)
      ]
    );
    const novoTitulo = await get("SELECT * FROM titulos WHERE id = ?", [resultado.id]);
    res.status(201).json({ mensagem: "Título cadastrado com sucesso!", titulo: novoTitulo });
  } catch (error) {
    res.status(500).json({ erro: "Não foi possível cadastrar o título." });
  }
});

// Atualiza um registro existente.
app.put("/api/titulos/:id", async (req, res) => {
  try {
    const erro = validarTitulo(req.body);
    if (erro) return res.status(400).json({ erro });

    const atual = await get("SELECT id FROM titulos WHERE id = ?", [req.params.id]);
    if (!atual) return res.status(404).json({ erro: "Título não encontrado." });

    const categoria = await get("SELECT id FROM categorias WHERE id = ?", [req.body.categoria_id]);
    if (!categoria) return res.status(400).json({ erro: "A categoria escolhida não existe." });

    await run(
      `UPDATE titulos
       SET nome = ?, tipo = ?, genero = ?, ano = ?, plataforma = ?,
           nota = ?, descricao = ?, categoria_id = ?
       WHERE id = ?`,
      [
        req.body.nome.trim(), req.body.tipo, req.body.genero.trim(),
        Number(req.body.ano), (req.body.plataforma || "").trim(),
        Number(req.body.nota), (req.body.descricao || "").trim(),
        Number(req.body.categoria_id), req.params.id
      ]
    );
    res.json({ mensagem: "Título atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Não foi possível atualizar o título." });
  }
});

// Exclui um registro.
app.delete("/api/titulos/:id", async (req, res) => {
  try {
    const resultado = await run("DELETE FROM titulos WHERE id = ?", [req.params.id]);
    if (!resultado.changes) return res.status(404).json({ erro: "Título não encontrado." });
    res.json({ mensagem: "Título excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Não foi possível excluir o título." });
  }
});

// Relatório extra: quantidade de títulos em cada categoria.
app.get("/api/relatorios/categorias", async (req, res) => {
  try {
    const relatorio = await all(
      `SELECT c.id, c.nome AS categoria, COUNT(t.id) AS quantidade
       FROM categorias c
       LEFT JOIN titulos t ON t.categoria_id = c.id
       GROUP BY c.id, c.nome
       ORDER BY quantidade DESC, c.nome`
    );
    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ erro: "Não foi possível gerar o relatório." });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ erro: "Rota da API não encontrada." });
});

iniciarBanco()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CineGames rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar o banco de dados:", error.message);
    process.exit(1);
  });
