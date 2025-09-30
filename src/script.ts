declare var particlesJS: any; // MANTIDO: Para reconhecer a função global de partículas

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const charactersContainer = document.getElementById('characters-container') as HTMLElement;
const modal = document.getElementById('modal') as HTMLElement;

// Elementos do Modal (Declaração única)
const modalImageContainer = document.getElementById('modal-image-container') as HTMLElement;
const detailsContainer = document.getElementById('character-details') as HTMLElement;
const closeButton = document.querySelector('.close-button') as HTMLElement;

// Elementos de Paginação
const prevPageButton = document.getElementById('prev-page-button') as HTMLButtonElement;
const nextPageButton = document.getElementById('next-page-button') as HTMLButtonElement;
const paginationContainer = document.querySelector('.pagination-container') as HTMLElement;
const pageNumbersContainer = document.getElementById('page-numbers-container') as HTMLElement;

// Elemento do Tooltip Global
const globalTooltip = document.getElementById('global-tooltip') as HTMLElement; 

let currentPage = 1;
let totalPages = 1; 

// =========================================================
// 1. EVENTOS DE NAVEGAÇÃO
// =========================================================

searchButton.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const characterName = searchInput.value.trim(); 

    currentPage = 1; 
    await fetchCharacters(characterName, currentPage);
});

nextPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value.trim();
    if (currentPage < totalPages) { 
        currentPage++;
        await fetchCharacters(characterName, currentPage);
    }
});

prevPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value.trim();
    if (currentPage > 1) { 
        currentPage--;
        await fetchCharacters(characterName, currentPage);
    }
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('modal-visible');
});

// Fecha o modal ao clicar fora dele
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('modal-visible');
    }
});

// =========================================================
// 2. LÓGICA DE BUSCA (CORREÇÃO FINAL DO ERRO DE CARREGAMENTO)
// =========================================================

async function fetchCharacters(name: string, page: number) {
    
    let filter = '';
    const variables: { name?: string, page: number } = { page: page };

    if (name) {
        filter = `filter: { name: $name }`;
        variables.name = name;
    }

    const query = `
        query GetCharacters($name: String, $page: Int!) {
            characters(${filter}, page: $page) {
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

    try {
        const response = await fetch('https://rickandmortyapi.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);

        const data = await response.json();
        const charactersData = data.data.characters;
        
        // 1. VERIFICAÇÃO: Se charactersData vier nulo, é porque não encontrou resultados.
        if (charactersData === null || !charactersData.results || charactersData.results.length === 0) {
            
            if (!name) {
                // Se o nome está vazio (carregamento inicial), lançamos um erro genérico para ser capturado.
                throw new Error("LOAD_FAIL_SILENT"); 
            } else {
                 // Se houver nome, é uma busca sem resultados.
                throw new Error(`Nenhum personagem encontrado com o nome: "${name}".`);
            }
        }

        const info = charactersData.info;
        const characters = charactersData.results;
        
        // SUCESSO
        totalPages = info?.pages || 1; 

        renderCharacters(characters);
        updatePagination(info?.prev || null, info?.next || null); 

        charactersContainer.style.display = 'grid'; 
        paginationContainer.style.display = 'flex'; 

    } catch (error) {
        console.error('Falha ao buscar personagens:', error);
        
        const errorMsg = (error instanceof Error) ? error.message : "Erro desconhecido na busca.";
        
        // ===============================================
        // A CORREÇÃO FINAL PARA SILENCIAR O INÍCIO:
        // Se o 'name' estiver vazio (primeiro carregamento), 
        // limpamos o container, independentemente do erro.
        // ===============================================
        if (!name) {
            // SILENCIA: Não mostra mensagem, apenas limpa o espaço.
            charactersContainer.innerHTML = '';
            
        } else if (errorMsg.includes("Nenhum personagem")) {
             // Se for uma busca (com nome) sem resultados.
             charactersContainer.innerHTML = `<p class="error-message">${errorMsg}</p>`;
             
        } else {
            // Qualquer outro erro de rede que ocorra APÓS a busca inicial (ex: durante paginação).
            charactersContainer.innerHTML = `<p class="error-message">Erro de carregamento. Verifique a conexão e tente recarregar a página.</p>`;
        }
        
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
async function goToPage(pageNumber: number) {
    if (pageNumber !== currentPage && pageNumber > 0 && pageNumber <= totalPages) {
        const characterName = searchInput.value.trim(); 
        currentPage = pageNumber;
        await fetchCharacters(characterName, currentPage);
    }
}

/**
 * Cria um único botão de página numerado.
 */
function createPageButton(pageNumber: number, container: HTMLElement) {
    const button = document.createElement('button');
    button.textContent = pageNumber.toString();
    button.classList.add('page-number-button');
    
    if (pageNumber === currentPage) {
        button.classList.add('active');
    } else {
        button.addEventListener('click', () => goToPage(pageNumber));
    }
    
    container.appendChild(button);
}

/**
 * Gera e injeta os botões de número de página dinamicamente (Mini-Display).
 */
function renderPageNumbers() {
    pageNumbersContainer.innerHTML = '';
    
    if (totalPages <= 1) return;

    const maxButtons = 5; 
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxButtons) {
        let range = Math.floor(maxButtons / 2);
        startPage = currentPage - range;
        endPage = currentPage + range;

        if (startPage < 1) {
            startPage = 1;
            endPage = maxButtons;
        }

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxButtons + 1;
        }
        
        if (startPage < 1) startPage = 1; 
    }

    if (startPage > 1) {
        createPageButton(1, pageNumbersContainer);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i, pageNumbersContainer);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages) { 
             if (endPage < totalPages - 1) {
                 const ellipsis = document.createElement('span');
                 ellipsis.className = 'page-ellipsis';
                 ellipsis.textContent = '...';
                 pageNumbersContainer.appendChild(ellipsis);
             }
            if (endPage !== totalPages) { 
                 createPageButton(totalPages, pageNumbersContainer);
            }
        }
    }
}

/**
 * Atualiza o estado (disabled) dos botões Anterior/Próxima e renderiza os números.
 */
function updatePagination(prev: number | null, next: number | null) {
    prevPageButton.disabled = !prev;
    nextPageButton.disabled = !next;
    renderPageNumbers(); 
}

// =========================================================
// 4. LÓGICA DE RENDERIZAÇÃO DE CARDS E TOOLTIP
// =========================================================

function renderCharacters(characters: any[]) {
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

function showTooltip(character: any, x: number, y: number) {
    if (!globalTooltip) return;

    const statusClass = character.status;

      globalTooltip.innerHTML = `
        <span class="status-indicator ${statusClass}">
            ${character.status}
        </span>
    `;

    moveTooltip(x, y);
    globalTooltip.classList.add('tooltip-visible');
}

function moveTooltip(x: number, y: number) {
    if (!globalTooltip) return;
    
    const offsetX = 15;
    const offsetY = 15; 

    let top = y + offsetY;
    let left = x + offsetX;
    
    const tooltipRect = globalTooltip.getBoundingClientRect();

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
    if (!globalTooltip) return;
    globalTooltip.classList.remove('tooltip-visible');
}

// =========================================================
// 5. LÓGICA DO MODAL DE DETALHES 
// =========================================================

async function showCharacterDetails(id: string) {
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
    
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
    
        const data = await response.json();
        const character = data.data.character;
    
        // 1. INJETA A IMAGEM NO CONTAINER FLUTUANTE
        modalImageContainer.innerHTML = `
            <img src="${character.image}" alt="${character.name}">
            <span class="image-label">${character.name}</span>
            <span class="image-sub-label">${character.species}</span>
        `;
        
        // 2. INJETA OS DETALHES NA FICHA (Mantendo o estilo futurista)
        detailsContainer.innerHTML = `
            <h2 class="ficha-title">DETALHES DA UNIDADE</h2>
            
            <p><strong>Status:</strong> ${character.status}</p>
            <p><strong>Espécie:</strong> ${character.species}</p>
            <p><strong>Origem:</strong> ${character.origin.name}</p>
            <p><strong>Localidade:</strong> ${character.location.name}</p>
        `;
    
        modal.classList.add('modal-visible');
    } catch (error) {
        console.error('Falha ao buscar detalhes do personagem:', error);
        detailsContainer.innerHTML = `<h2 class="ficha-title">ERRO</h2><p>Não foi possível carregar os detalhes do personagem.</p>`;
        modal.classList.add('modal-visible');
    }
}


// =========================================================
// 6. INICIALIZAÇÃO (Particles.js) - MANTIDO
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

// =========================================================
// 7. INICIALIZAÇÃO DA APLICAÇÃO
// =========================================================

/**
 * Função para carregar os personagens iniciais (catálogo completo)
 */
async function initializeApp() {
    searchInput.value = '';
    
    // Chamada inicial para carregar todos os personagens
    currentPage = 1;
    await fetchCharacters('', currentPage);
}

// Inicia a aplicação automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', initializeApp);