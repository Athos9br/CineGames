const API = "/api";
let paginaAtual = 1;
const limite = 6;
let totalPaginas = 1;
let categorias = [];
let toastTimer;

const $ = (id) => document.getElementById(id);

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Ocorreu um erro na solicitação.");
  return dados;
}

function mostrarMensagem(mensagem, erro = false) {
  const toast = $("toast");
  toast.textContent = mensagem;
  toast.className = `toast show${erro ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = "toast", 3200);
}

function escapar(texto = "") {
  return String(texto).replace(/[&<>"']/g, (letra) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[letra]);
}

async function carregarCategorias() {
  categorias = await requisicao("/categorias");
  $("filtroCategoria").innerHTML = '<option value="">Todas as categorias</option>' +
    categorias.map(c => `<option value="${c.id}">${escapar(c.nome)}</option>`).join("");
  $("categoria").innerHTML = categorias.map(c =>
    `<option value="${c.id}">${escapar(c.nome)}</option>`).join("");
}

async function carregarCatalogo() {
  const parametros = new URLSearchParams({
    nome: $("busca").value.trim(),
    tipo: $("filtroTipo").value,
    categoria_id: $("filtroCategoria").value,
    page: paginaAtual,
    limit: limite,
    sort: $("ordenacao").value
  });

  try {
    const resultado = await requisicao(`/titulos?${parametros}`);
    totalPaginas = resultado.totalPaginas;
    $("resultadoTexto").textContent = `${resultado.total} título(s) encontrado(s)`;
    $("paginaTexto").textContent = `Página ${resultado.pagina} de ${resultado.totalPaginas}`;
    $("anteriorBtn").disabled = paginaAtual <= 1;
    $("proximaBtn").disabled = paginaAtual >= totalPaginas;

    if (!resultado.dados.length) {
      $("listaTitulos").innerHTML = '<div class="empty-state">Nenhum título encontrado. Tente mudar os filtros ou cadastre um novo.</div>';
      return;
    }

    $("listaTitulos").innerHTML = resultado.dados.map(titulo => `
      <article class="title-card">
        <div class="poster ${titulo.tipo === "Filme" ? "filme" : "jogo"}">
          <span class="type-label">${escapar(titulo.tipo)}</span>
          <span class="poster-mark">${escapar(titulo.nome.slice(0, 2).toUpperCase())}</span>
        </div>
        <div class="card-content">
          <div class="card-top">
            <h3>${escapar(titulo.nome)}</h3>
            <span class="rating">★ ${Number(titulo.nota).toFixed(1)}</span>
          </div>
          <div class="card-meta">
            <span class="pill">${escapar(titulo.genero)}</span>
            <span class="pill">${titulo.ano}</span>
            <span class="pill">${escapar(titulo.categoria)}</span>
          </div>
          <p class="card-description">${escapar(titulo.descricao || "Sem descrição cadastrada.")}</p>
          <div class="card-actions">
            <button class="small-button" onclick="verDetalhes(${titulo.id})">Detalhes</button>
            <button class="small-button" onclick="editarTitulo(${titulo.id})">Editar</button>
            <button class="small-button delete" onclick="excluirTitulo(${titulo.id})">Excluir</button>
          </div>
        </div>
      </article>
    `).join("");
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function carregarResumo() {
  try {
    // A listagem completa é consultada para montar os números do painel.
    const resultado = await requisicao("/titulos?limit=50&page=1&sort=nome");
    const titulos = resultado.dados;
    const filmes = titulos.filter(t => t.tipo === "Filme").length;
    const jogos = titulos.filter(t => t.tipo === "Jogo").length;
    const media = titulos.length
      ? titulos.reduce((soma, t) => soma + Number(t.nota), 0) / titulos.length
      : 0;
    $("totalGeral").textContent = resultado.total;
    $("totalFilmes").textContent = filmes;
    $("totalJogos").textContent = jogos;
    $("mediaNota").textContent = media.toFixed(1);
  } catch (error) {
    mostrarMensagem("Não foi possível carregar o resumo.", true);
  }
}

async function carregarRelatorio() {
  try {
    const dados = await requisicao("/relatorios/categorias");
    const maior = Math.max(...dados.map(item => item.quantidade), 1);
    $("relatorio").innerHTML = dados.map(item => `
      <div class="report-item">
        <div class="report-item-top"><span>${escapar(item.categoria)}</span><strong>${item.quantidade}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${(item.quantidade / maior) * 100}%"></div></div>
      </div>
    `).join("");
  } catch (error) {
    $("relatorio").textContent = "Não foi possível carregar o relatório.";
  }
}

function abrirModal(titulo = null) {
  $("tituloForm").reset();
  $("tituloId").value = "";
  $("formTitulo").textContent = titulo ? "Editar título" : "Adicionar título";
  $("salvarBtn").textContent = titulo ? "Salvar alterações" : "Salvar título";

  if (titulo) {
    $("tituloId").value = titulo.id;
    $("nome").value = titulo.nome;
    $("tipo").value = titulo.tipo;
    $("genero").value = titulo.genero;
    $("ano").value = titulo.ano;
    $("nota").value = titulo.nota;
    $("categoria").value = titulo.categoria_id;
    $("plataforma").value = titulo.plataforma || "";
    $("descricao").value = titulo.descricao || "";
  }
  $("modal").classList.remove("hidden");
  $("nome").focus();
}

function fecharModal() {
  $("modal").classList.add("hidden");
}

async function editarTitulo(id) {
  try {
    const titulo = await requisicao(`/titulos/${id}`);
    abrirModal(titulo);
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function verDetalhes(id) {
  try {
    const t = await requisicao(`/titulos/${id}`);
    alert(
      `${t.nome}\n\nTipo: ${t.tipo}\nGênero: ${t.genero}\nAno: ${t.ano}\nPlataforma: ${t.plataforma || "Não informada"}\nCategoria: ${t.categoria}\nNota: ${Number(t.nota).toFixed(1)}\n\n${t.descricao || "Sem descrição."}`
    );
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function excluirTitulo(id) {
  if (!confirm("Tem certeza que deseja excluir este título?")) return;
  try {
    const resposta = await requisicao(`/titulos/${id}`, { method: "DELETE" });
    mostrarMensagem(resposta.mensagem);
    if (paginaAtual > 1) paginaAtual = 1;
    await atualizarTela();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function atualizarTela() {
  await Promise.all([carregarCatalogo(), carregarResumo(), carregarRelatorio()]);
}

$("tituloForm").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = $("tituloId").value;
  const dados = {
    nome: $("nome").value,
    tipo: $("tipo").value,
    genero: $("genero").value,
    ano: Number($("ano").value),
    nota: Number($("nota").value),
    categoria_id: Number($("categoria").value),
    plataforma: $("plataforma").value,
    descricao: $("descricao").value
  };

  try {
    const resposta = await requisicao(id ? `/titulos/${id}` : "/titulos", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(dados)
    });
    fecharModal();
    paginaAtual = 1;
    mostrarMensagem(resposta.mensagem);
    await atualizarTela();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
});

$("novoBtn").addEventListener("click", () => abrirModal());
$("fecharModal").addEventListener("click", fecharModal);
$("cancelarBtn").addEventListener("click", fecharModal);
$("fecharFundo").addEventListener("click", fecharModal);

let buscaTimer;
$("busca").addEventListener("input", () => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(() => { paginaAtual = 1; carregarCatalogo(); }, 300);
});
["filtroTipo", "filtroCategoria", "ordenacao"].forEach(id => {
  $(id).addEventListener("change", () => { paginaAtual = 1; carregarCatalogo(); });
});
$("anteriorBtn").addEventListener("click", () => {
  if (paginaAtual > 1) { paginaAtual--; carregarCatalogo(); }
});
$("proximaBtn").addEventListener("click", () => {
  if (paginaAtual < totalPaginas) { paginaAtual++; carregarCatalogo(); }
});

async function iniciar() {
  try {
    await carregarCategorias();
    await atualizarTela();
  } catch (error) {
    mostrarMensagem("Não foi possível iniciar o sistema. Confira se o servidor está rodando.", true);
  }
}
iniciar();
