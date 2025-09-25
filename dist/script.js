"use strict";
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const charactersContainer = document.getElementById('characters-container');
const modal = document.getElementById('modal');
const detailsContainer = document.getElementById('character-details');
const closeButton = document.querySelector('.close-button');
// Elementos de Paginação
const prevPageButton = document.getElementById('prev-page-button');
const nextPageButton = document.getElementById('next-page-button');
const paginationContainer = document.querySelector('.pagination-container');
const pageNumbersContainer = document.getElementById('page-numbers-container'); // Container para os números dinâmicos
// Elemento do Tooltip Global
const globalTooltip = document.getElementById('global-tooltip');
let currentPage = 1;
let totalPages = 1; // Variável para armazenar o número total de páginas
// =========================================================
// 1. EVENTOS DE NAVEGAÇÃO
// =========================================================
searchButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const characterName = searchInput.value;
    if (characterName) {
        currentPage = 1; // Reseta para a primeira página na busca
        await fetchCharacters(characterName, currentPage);
    }
});
nextPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value;
    if (characterName && currentPage < totalPages) {
        currentPage++;
        await fetchCharacters(characterName, currentPage);
        // Não precisamos chamar updatePagination/renderPageNumbers aqui, pois já são chamados em fetchCharacters
    }
});
prevPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value;
    if (characterName && currentPage > 1) {
        currentPage--;
        await fetchCharacters(characterName, currentPage);
        // Não precisamos chamar updatePagination/renderPageNumbers aqui, pois já são chamados em fetchCharacters
    }
});
closeButton.addEventListener('click', () => {
    modal.classList.remove('modal-visible');
});
// =========================================================
// 2. LÓGICA DE BUSCA
// =========================================================
async function fetchCharacters(name, page) {
    const query = `
        query GetCharactersByName($name: String!, $page: Int!) {
            characters(filter: { name: $name }, page: $page) {
                info {
                    next
                    prev
                    pages
                }
                results {
                    id
                    name
                    status
                    species
                    image
                }
            }
        }
    `;
    const variables = { name: name, page: page };
    try {
        const response = await fetch('https://rickandmortyapi.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
        if (!response.ok)
            throw new Error(`Erro na rede: ${response.statusText}`);
        const data = await response.json();
        const info = data.data.characters.info;
        const characters = data.data.characters.results;
        // Atualiza o total de páginas
        totalPages = info.pages;
        renderCharacters(characters);
        updatePagination(info.prev, info.next);
        charactersContainer.style.display = 'grid';
        paginationContainer.style.display = 'flex';
    }
    catch (error) {
        console.error('Falha ao buscar personagens:', error);
        charactersContainer.innerHTML = `<p class="error-message">Nenhum personagem encontrado com o nome "${name}" ou ocorreu um erro.</p>`;
        paginationContainer.style.display = 'none';
        totalPages = 1;
        currentPage = 1;
    }
}
// =========================================================
// 3. LÓGICA DE RENDERIZAÇÃO DE PAGINAÇÃO
// =========================================================
/**
 * Mudar de página ao clicar em um número
 */
async function goToPage(pageNumber) {
    if (pageNumber !== currentPage && pageNumber > 0 && pageNumber <= totalPages) {
        const characterName = searchInput.value;
        currentPage = pageNumber;
        await fetchCharacters(characterName, currentPage);
    }
}
/**
 * Cria um único botão de página numerado.
 */
function createPageButton(pageNumber, container) {
    const button = document.createElement('button');
    button.textContent = pageNumber.toString();
    button.classList.add('page-number-button');
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    else {
        button.addEventListener('click', () => goToPage(pageNumber));
    }
    container.appendChild(button);
}
/**
 * Gera e injeta os botões de número de página dinamicamente (Mini-Display).
 */
function renderPageNumbers() {
    pageNumbersContainer.innerHTML = '';
    // Se não houver páginas, sai da função
    if (totalPages <= 1)
        return;
    const maxButtons = 5; // Máximo de números de página visíveis (além da primeira/última)
    let startPage = 1;
    let endPage = totalPages;
    if (totalPages > maxButtons) {
        // Lógica para calcular a faixa de exibição
        let range = Math.floor(maxButtons / 2);
        startPage = currentPage - range;
        endPage = currentPage + range;
        // Ajuste para o início
        if (startPage < 1) {
            startPage = 1;
            endPage = maxButtons;
        }
        // Ajuste para o final
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxButtons + 1;
        }
        if (startPage < 1)
            startPage = 1; // Última verificação para garantir o mínimo
    }
    // 1. Adiciona a primeira página e reticências se necessário
    if (startPage > 1) {
        createPageButton(1, pageNumbersContainer);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }
    // 2. Adiciona os botões centrais/da faixa
    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i, pageNumbersContainer);
    }
    // 3. Adiciona a última página e reticências se necessário
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
        // Evita duplicar o último botão se já estiver na faixa
        if (endPage < totalPages) {
            createPageButton(totalPages, pageNumbersContainer);
        }
    }
}
/**
 * Atualiza o estado (disabled) dos botões Anterior/Próxima e renderiza os números.
 */
function updatePagination(prev, next) {
    prevPageButton.disabled = !prev;
    nextPageButton.disabled = !next;
    renderPageNumbers(); // Gera os botões de número
}
// =========================================================
// 4. LÓGICA DE RENDERIZAÇÃO DE CARDS E TOOLTIP
// =========================================================
function renderCharacters(characters) {
    charactersContainer.innerHTML = '';
    characters.forEach((character, index) => {
        const characterCard = document.createElement('div');
        characterCard.classList.add('character-card');
        characterCard.style.animationDelay = `${index * 0.1}s`;
        // Eventos de interatividade
        characterCard.addEventListener('click', () => { showCharacterDetails(character.id); });
        characterCard.addEventListener('mouseenter', (event) => { showTooltip(character, event.clientX, event.clientY); });
        characterCard.addEventListener('mousemove', (event) => { moveTooltip(event.clientX, event.clientY); });
        characterCard.addEventListener('mouseleave', () => { hideTooltip(); });
        // HTML do Card
        characterCard.innerHTML = `
            <img src="${character.image}" alt="${character.name}">
            <h3>${character.name}</h3>
            <p class="species-text">${character.species}</p>
        `;
        charactersContainer.appendChild(characterCard);
    });
}
function showTooltip(character, x, y) {
    if (!globalTooltip)
        return;
    const statusClass = character.status;
    // Atualiza o conteúdo do tooltip (status discreto)
    globalTooltip.innerHTML = `
        <span class="status-indicator ${statusClass}">
            ${character.status}
        </span>
    `;
    moveTooltip(x, y);
    globalTooltip.classList.add('tooltip-visible');
}
function moveTooltip(x, y) {
    if (!globalTooltip)
        return;
    const offsetX = 15;
    const offsetY = 15;
    let top = y + offsetY;
    let left = x + offsetX;
    const tooltipRect = globalTooltip.getBoundingClientRect();
    // Lógica de limite (para não sair da tela)
    if (left + tooltipRect.width > window.innerWidth) {
        left = x - tooltipRect.width - offsetX;
    }
    if (top + tooltipRect.height > window.innerHeight) {
        top = y - tooltipRect.height - offsetY;
    }
    globalTooltip.style.top = `${top}px`;
    globalTooltip.style.left = `${left}px`;
}
function hideTooltip() {
    if (!globalTooltip)
        return;
    globalTooltip.classList.remove('tooltip-visible');
}
// =========================================================
// 5. LÓGICA DO MODAL DE DETALHES
// =========================================================
async function showCharacterDetails(id) {
    const query = `
      query GetCharacterById($id: ID!) {
        character(id: $id) {
          name
          status
          species
          image
          origin {
            name
          }
          location {
            name
          }
        }
      }
    `;
    const variables = { id: id };
    try {
        const response = await fetch('https://rickandmortyapi.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        const data = await response.json();
        const character = data.data.character;
        detailsContainer.innerHTML = `
            <h2>${character.name}</h2>
            <img src="${character.image}" alt="${character.name}">
            <p><strong>Status:</strong> ${character.status}</p>
            <p><strong>Espécie:</strong> ${character.species}</p>
            <p><strong>Origem:</strong> ${character.origin.name}</p>
            <p><strong>Localidade:</strong> ${character.location.name}</p>
        `;
        modal.classList.add('modal-visible');
    }
    catch (error) {
        console.error('Falha ao buscar detalhes do personagem:', error);
    }
}
// =========================================================
// 6. INICIALIZAÇÃO (Particles.js)
// =========================================================
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#00c853"
            },
            "shape": {
                "type": "circle"
            },
            "opacity": {
                "value": 0.5,
                "random": false
            },
            "size": {
                "value": 3,
                "random": true
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#00c853",
                "opacity": 0.4,
                "width": 1
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            }
        }
    });
}
//# sourceMappingURL=script.js.map