let wasteData = [];

// 1. Carga única y en caché
async function init() {
  try {
    const res = await fetch('./data/items.json', { cache: 'force-cache' });
    wasteData = await res.json();
    render(wasteData);
  } catch (err) {
    console.error("Error al cargar dataset:", err);
  }
}

// normalizaciòn
function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// filtrado de datos
function searchWaste(query) {
  const cleanQuery = normalize(query.trim());
  if (!cleanQuery) return wasteData;

  return wasteData.filter(item => {
    const matchName = normalize(item.nombre).includes(cleanQuery);
    const matchAlias = item.alias?.some(a => normalize(a).includes(cleanQuery));
    const matchCat = normalize(item.contenedor).includes(cleanQuery);
    return matchName || matchAlias || matchCat;
  });
}

// debounce
let timeout;
document.getElementById('search').addEventListener('input', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const results = searchWaste(e.target.value);
    render(results);
  }, 120);
});

init();