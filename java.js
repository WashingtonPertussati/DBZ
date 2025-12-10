
// =========================
// Configuração da API
// =========================
const API_BASE = "https://dragonball-api.com/api";
const ROTA_PERSONAGENS = `${API_BASE}/characters`;

// =========================
// Referências ao DOM
// =========================
const grid = document.getElementById("grid");
const vazio = document.getElementById("vazio");
const statusBox = document.getElementById("status");
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const pager = document.getElementById("pager"); // paginação numérica

// Estado de paginação
let currentPage = 1;
let currentLimit =12; // altere se quiser outro padrão
let currentLinks = null;
let currentMeta = null;

// =========================
// Utilidades de UI
// =========================
function setLoading(on, msg = "Carregando...") {
  if (!statusBox) return;
  statusBox.textContent = msg;
  statusBox.classList.toggle("d-none", !on);
}

function showEmpty(show) {
  if (!vazio) return;
  vazio.classList.toggle("d-none", !show);
}


// =========================
const MAP_RACE = {
  "Saiyan": "Saiyajin",
  "Human": "Humano",
  "Namekian": "Namekiano",
  "Majin": "Majin",
  "Android": "Androide",
  "Freeza Race": "Raça de Freeza",
  "Jiren Race": "Raça de Jiren",
  "Angel": "Anjo",
  "God": "Deus",
  "Evil": "Maligno",
  "Nucleico": "Nucleico",
  "Nucleico benigno": "Nucleico benigno",
  "Unknown": "Desconhecido",
};

const MAP_GENDER = {
  "Male": "Masculino",
  "Female": "Feminino",
  "Unknown": "Desconhecido",
};

const MAP_ORIGINPLANET = {
 "Tierra":"Terra",
};

const MAP_AFFILIATION = {
  "Z Fighter": "Guerreiro Z",
  "Villain": "Vilão",
  "Red Ribbon Army": "Exército Red Ribbon",
  "Namekian Warrior": "Guerreiro Namekiano",
  "Freelancer": "Freelancer",
  "Freeza's Army Pride Troopers": "Soldados do Orgulho / Exército de Freeza",
  "Assistant of Vermoud": "Assistente de Vermoud",
  "Divine Assistant of Beerus": "Assistente Divino de Beerus",
  "Other": "Outro",
  "Tierra":"Terra",
};

const t = (map, value) => map[value] ?? (value ?? "—");


 // funções auxiliares
// =========================


function ensureHttps(url) {
  if (!url || typeof url !== "string") return "";
  let clean = url.trim();
  if (clean.startsWith("//")) clean = "https:" + clean;
  if (clean.startsWith("http://")) clean = clean.replace("http://", "https://");
  return clean;
}

function safeImgSrc(url) {
  const fixed = ensureHttps(url);
  return fixed || "./imagens/placeholder.png"; // mantenha esse placeholder no seu projeto
}



// =========================
// Renderização dos cards (clique na imagem abre modal)
// =========================
function renderPersonagens(lista) {
  grid.innerHTML = "";

  if (!lista || lista.length === 0) {
    showEmpty(true);
    return;
  }
  showEmpty(false);

  const fragment = document.createDocumentFragment();

  lista.forEach((p) => {
    const nome = p.name ?? "Personagem";
    const imgSrc = ensureHttps(p.image) || "./imagens/placeholder.png";

    const raca = t(MAP_RACE, p.race);
    const genero = t(MAP_GENDER, p.gender);
    const afiliacao = t(MAP_AFFILIATION, p.affiliation);

    // coluna
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    // card
    const card = document.createElement("div");
    card.className = "card card-personagem h-100";

    // imagem
    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = imgSrc;
    img.alt = nome;
    img.loading = "lazy";
    img.onerror = () => { img.src = "./imagens/placeholder.png"; };

    // clique na imagem abre o modal
    img.addEventListener("click", () => abrirDetalheModal(p.id));

    // corpo
    const body = document.createElement("div");
    body.className = "card-body";

    const h5 = document.createElement("h5");
    h5.className = "card-title mb-2";
    h5.textContent = nome;

    const dl = document.createElement("dl");
    dl.className = "mb-3";

    const dt1 = document.createElement("dt"); dt1.textContent = "Raça:";
    const dd1 = document.createElement("dd"); dd1.textContent = raca;
    const dt2 = document.createElement("dt"); dt2.textContent = "Gênero:";
    const dd2 = document.createElement("dd"); dd2.textContent = genero;
    const dt3 = document.createElement("dt"); dt3.textContent = "Afiliação:";
    const dd3 = document.createElement("dd"); dd3.textContent = afiliacao;

    dl.append(dt1, dd1, dt2, dd2, dt3, dd3);

    const btnWrap = document.createElement("div");
    btnWrap.className = "d-grid";
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary";
    btn.textContent = "Ver detalhes";
    btn.addEventListener("click", () => abrirDetalheModal(p.id));

    btnWrap.appendChild(btn);
    body.append(h5, dl, btnWrap);
    card.append(img, body);
    col.appendChild(card);
    fragment.appendChild(col);
  });

  grid.appendChild(fragment);
}

// =========================
// Modal com detalhes em PT-BR
// (exige o HTML do modal e Bootstrap Bundle no index.html)
// =========================



async function abrirDetalheModal(id) {
  try {
    setLoading(true, "Carregando detalhes...");

    // 1) Busca o personagem
    const resp = await fetch(`${ROTA_PERSONAGENS}/${id}`);
    if (!resp.ok) throw new Error(`Falha na API (${resp.status})`);
    const p = await resp.json();

    // 2) Mapeia dados (PT-BR + saneamento)
    const nome = p.name ?? "Personagem";
    const imgUrl = safeImgSrc(p.image);
    const raca = MAP_RACE[p.race] ?? (p.race ?? "—");
    const genero = MAP_GENDER[p.gender] ?? (p.gender ?? "—");
    const afiliacao = MAP_AFFILIATION[p.affiliation] ?? (p.affiliation ?? "—");
    const planeta = p?.originPlanet?.name ?? "—";
    const ki = p?.ki ?? "—";
    const maxKi = p?.maxKi ?? "—";
    const transformacoes = Array.isArray(p?.transformations) ? p.transformations.length : 0;
    const descricao = p?.description ?? "";

    // 3) Atualiza o título do modal (apenas o nome)
    const tituloEl = document.getElementById("modalTitulo");
    if (!tituloEl) throw new Error("Elemento #modalTitulo não encontrado.");
    tituloEl.textContent = nome;

    // 4) Monta o corpo do modal via DOM (sem innerHTML)
    const conteudoEl = document.getElementById("modalConteudo");
    if (!conteudoEl) throw new Error("Elemento #modalConteudo não encontrado.");
    conteudoEl.innerHTML = ""; // limpa qualquer conteúdo anterior

    const wrapper = document.createElement("div");
    wrapper.className = "detalhe-personagem";

    // Coluna da imagem
    const imgEl = document.createElement("img");
    imgEl.id = "modalImg";
    imgEl.alt = nome;
    imgEl.className = "img-fluid";
    imgEl.style.maxHeight = "80vh";
    imgEl.src = imgUrl;
    imgEl.onerror = () => { imgEl.src = "./imagens/placeholder.png"; };

    // Coluna dos dados
    const right = document.createElement("div");

    const dl = document.createElement("dl");
    const addKV = (k, v) => {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      dl.append(dt, dd);
    };
    addKV("Raça:", raca);
    addKV("Gênero:", genero);
    addKV("Afiliação:", afiliacao);
    addKV("Planeta de origem:", planeta);
    addKV("Ki:", ki);
    addKV("Máx Ki:", maxKi);
    addKV("Transformações:", String(transformacoes));

    right.appendChild(dl);
    wrapper.append(imgEl, right);
    conteudoEl.appendChild(wrapper);

    // 5) Abre o modal
    const modalEl = document.getElementById("modalDetalhe");
    if (!modalEl) throw new Error("Elemento #modalDetalhe não encontrado.");
    new bootstrap.Modal(modalEl).show();

  } catch (erro) {
    console.error(erro);
    alert(`Não foi possível carregar detalhes: ${erro.message}`);
  } finally {
    setLoading(false);
  }
}
// =========================
// Paginação numérica (1 2 3 … »)
// =========================
function renderPager(meta) {
  if (!pager) return;
  pager.innerHTML = "";
  if (!meta || typeof meta.totalPages !== "number") return;

  const current = meta.currentPage;
  const total = meta.totalPages;

  const ul = document.createElement("ul");
  ul.className = "pagination";

  const makeItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = label;

    if (!disabled && !active) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        listarPersonagens(page, meta.itemsPerPage);
      });
    }

    li.appendChild(a);
    return li;
  };

  // « (primeira) e ‹ (anterior)
  ul.appendChild(makeItem("«", 1, current === 1));
  ul.appendChild(makeItem("‹", Math.max(1, current - 1), current === 1));

  // Janela central com elipses
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = Math.min(total, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  if (start > 1) {
    ul.appendChild(makeItem("1", 1, false, current === 1));
    if (start > 2) {
      const liDots = document.createElement("li");
      liDots.className = "page-item disabled";
      liDots.innerHTML = `#…</a>`;
      ul.appendChild(liDots);
    }
  }

  for (let page = start; page <= end; page++) {
    ul.appendChild(makeItem(String(page), page, false, current === page));
  }

  if (end < total) {
    if (end < total - 1) {
      const liDots = document.createElement("li");
      liDots.className = "page-item disabled";
      liDots.innerHTML = `#…</a>`;
      ul.appendChild(liDots);
    }
    ul.appendChild(makeItem(String(total), total, false, current === total));
  }

  // › (próxima) e » (última)
  ul.appendChild(makeItem("›", Math.min(total, current + 1), current === total));
  ul.appendChild(makeItem("»", total, current === total));

  pager.appendChild(ul);
}

// =========================
// Atualiza paginação (texto + pager)
// =========================
function atualizarPaginacao(meta, links) {
  currentMeta = meta || null;
  currentLinks = links || null;
  if (meta) {
    currentPage = meta.currentPage;
    currentLimit = meta.itemsPerPage;
  }
  // Desenha a paginação numérica
  renderPager(meta);
}

// =========================
// Chamadas à API
// =========================
async function listarPersonagens(page = 1, limit = 12) {
  try {
    setLoading(true, "Carregando lista...");
    const url = `${ROTA_PERSONAGENS}?page=${page}&limit=${limit}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);

    const data = await resposta.json();
    const lista = Array.isArray(data?.items) ? data.items : [];

    renderPersonagens(lista);
    atualizarPaginacao(data?.meta, data?.links);
  } catch (erro) {
    console.error(erro);
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Erro ao listar personagens. ${erro.message}
        </div>
      </div>
    `;
    showEmpty(false);
    atualizarPaginacao(null, null);
  } finally {
    setLoading(false);
  }
}

// Busca por nome (filtros não têm paginação: API retorna array direto)
async function buscarPorNome(nome) {
  try {
    setLoading(true, "Buscando por nome...");
    const termo = (nome || "").trim();

    if (!termo) {
      // Sem termo -> volta para listagem paginada padrão
      await listarPersonagens(1, currentLimit);
      return;
    }

    const url = `${ROTA_PERSONAGENS}?name=${encodeURIComponent(termo)}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);

    const data = await resposta.json();
    const lista = Array.isArray(data) ? data : [];

    renderPersonagens(lista);
    // Filtros não possuem paginação
    atualizarPaginacao(null, null);
  } catch (erro) {
    console.error(erro);
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Erro na busca. ${erro.message}
        </div>
      </div>
    `;
    showEmpty(false);
  } finally {
    setLoading(false);
  }
}

// Detalhes simples (alert). Se quiser modal, depois eu te envio a versão com Bootstrap.
async function abrirDetalhe(id) {
  try {
    setLoading(true, "Carregando detalhes...");
    const url = `${ROTA_PERSONAGENS}/${id}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);

    const p = await resposta.json();
    const transformCount = Array.isArray(p?.transformations) ? p.transformations.length : 0;
    const planeta = p?.originPlanet?.name ?? "—";

    const msg = `
#${p.id} • ${p.name}
Raça: ${p.race ?? "—"} • Gênero: ${p.gender ?? "—"}
Afiliação: ${p.affiliation ?? "—"}
Planeta de origem: ${planeta}
Ki: ${p.ki ?? "—"} • Máx Ki: ${p.maxKi ?? "—"}
Transformações: ${transformCount}
    `.trim();

    alert(msg);
  } catch (erro) {
    console.error(erro);
    alert(`Não foi possível carregar detalhes: ${erro.message}`);
  } finally {
    setLoading(false);
  }
}

// =========================
// Eventos
// =========================
formBusca?.addEventListener("submit", (e) => {
  e.preventDefault();
  buscarPorNome(campoBusca.value);
});

// =========================
// Inicialização
// =========================
listarPersonagens(currentPage, currentLimit);
