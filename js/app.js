let wasteItems = [];
let activeFilter = 'all';

const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const filterButtons = document.querySelectorAll('.filter-btn');

// normalizaciòn de la entrada
function normalize(text) {
  return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
}

// Carga inicial del JSON
async function loadData() {
  try {
    const response = await fetch('./data/items.json');
    if (!response.ok) throw new Error("Error en la petición");
    wasteItems = await response.json();
    render();
  } catch (error) {
    console.error("No se pudo cargar items.json:", error);
    resultsList.innerHTML = `
      <div class="empty-state">
        <p>No se pudo cargar el catálogo de residuos.</p>
      </div>
    `;
  }
}

function render() {
  const term = normalize(searchInput.value.trim());

  const filtered = wasteItems.filter(item => {
    const matchesCategory = (activeFilter === 'all') || (item.categoria === activeFilter);
    if (!matchesCategory) return false;

    if (!term) return true;

    const nameMatch = normalize(item.nombre).includes(term);
    const aliasMatch = item.alias && item.alias.some(a => normalize(a).includes(term));
    const noteMatch = normalize(item.instrucciones).includes(term);

    return nameMatch || aliasMatch || noteMatch;
  });

  if (filtered.length === 0) {
    resultsList.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron resultados para "<strong>${searchInput.value}</strong>".</p>
        <p style="font-size: 0.8rem; margin-top: 0.35rem;">Prueba con otra palabra.</p>
      </div>
    `;
    return;
  }

  resultsList.innerHTML = filtered.map(item => `
    <article class="card cat-${item.categoria}">
      <h3>${item.nombre}</h3>
      <p>${item.instrucciones}</p>
      <span class="badge cat-${item.categoria}">${item.contenedor}</span>
    </article>
  `).join('');
}

//entrada+filtrado
searchInput.addEventListener('input', render);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

loadData();