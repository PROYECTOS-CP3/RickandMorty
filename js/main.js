const apiUrl = 'https://rickandmortyapi.com/api/character';
const buscarInput = document.getElementById('searchInput');
const stateFilter = document.getElementById('stateFilter');
const cardsGrid = document.getElementById('cardsGrid');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageLabel = document.getElementById('pageLabel');

let allCharacters = [];
let totalPaginas = 1;
let totalBatches = 1;
let currentBatch = 1;

function crearCard(character) {
  const card = document.createElement('article');
  card.className = 'character-card';
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-image';
  const image = document.createElement('img');
  image.src = character.image;
  image.alt = character.name;
  imageWrapper.appendChild(image);
  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('h2');
  title.textContent = character.name;
  const status = document.createElement('p');
  const statusClass = character.status.toLowerCase();
  status.className = 'status-tag ' + statusClass;
  status.textContent = character.status;
  body.appendChild(title);
  body.appendChild(status);
  card.appendChild(imageWrapper);
  card.appendChild(body);
  return card;
}

function renderCharacters(characters) {
  cardsGrid.innerHTML = '';
  if (characters.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'loading';
    emptyMessage.textContent = 'No se encontraron personajes';
    cardsGrid.appendChild(emptyMessage);
    return;
  }
  characters.forEach(function(character) {
    const card = crearCard(character);
    cardsGrid.appendChild(card);
  });
}

function getFilteredCharacters() {
  const searchText = buscarInput.value.toLowerCase();
  const selectedState = stateFilter.value;
  return allCharacters.filter(function(character) {
    const matchesName = character.name.toLowerCase().includes(searchText);
    const matchesState = selectedState === 'all' || character.status.toLowerCase() === selectedState;
    return matchesName && matchesState;
  });
}

function updateCharacterList() {
  const filtered = getFilteredCharacters();
  renderCharacters(filtered);
}

function cargarPaginacion() {
  pageLabel.textContent = 'Página ' + currentBatch;
  prevPageButton.disabled = currentBatch <= 1;
  nextPageButton.disabled = currentBatch >= totalBatches;
}

function cargandoLogin() {
  cardsGrid.innerHTML = '<div class="loading"><img src="https://i.gifer.com/ZZ5H.gif" alt="Cargando..." /><p>Cargando personajes...</p></div>';
}

function obtenerPage(batch) {
  return (batch - 1) * 2 + 1;
}

function loadCharacters(batch) {
  currentBatch = batch;
  cargandoLogin();
  const page1 = obtenerPage(batch);
  fetch(apiUrl + '?page=' + page1)
    .then(function(response) {
      return response.json();
    })
    .then(function(data1) {
      totalPaginas = data1.info.pages;
      totalBatches = Math.ceil(totalPaginas / 2);
      const results = data1.results.slice();
      const page2 = page1 + 1;
      if (page2 <= totalPaginas) {
        return fetch(apiUrl + '?page=' + page2)
          .then(function(response) {
            return response.json();
          })
          .then(function(data2) {
            return results.concat(data2.results);
          });
      }
      return results;
    })
    .then(function(results) {
      allCharacters = results;
      updateCharacterList();
      cargarPaginacion();
    })
    .catch(function(error) {
      console.error('Error al cargar personajes:', error);
      cardsGrid.innerHTML = '<p class="loading">No se pudo cargar la información.</p>';
      cargarPaginacion();
    });
}

buscarInput.addEventListener('input', updateCharacterList);
stateFilter.addEventListener('change', updateCharacterList);
prevPageButton.addEventListener('click', function() {
  if (currentBatch > 1) {
    loadCharacters(currentBatch - 1);
  }
});
nextPageButton.addEventListener('click', function() {
  if (currentBatch < totalBatches) {
    loadCharacters(currentBatch + 1);
  }
});

loadCharacters(1);
