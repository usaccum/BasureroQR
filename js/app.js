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
    const currentQuery = searchInput.value.trim();
    resultsList.innerHTML = `
      <div class="empty-state">
        <p>No encontramos resultados para "<strong>${currentQuery}</strong>".</p>
        <div style="margin-top: 1rem;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            ¿Crees que debería estar en la lista?
          </p>
          <button id="btnSugerir" style="background: #0f172a; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem;">
            📬 Sugerir agregar "${currentQuery}"
          </button>
        </div>
      </div>
    `;

    const btn = document.getElementById("btnSugerir");
    if (btn) {
      btn.addEventListener("click", function () {
        alert("¡Gracias! Registraremos '" + currentQuery + "' para agregarlo pronto.");
      });
    }
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