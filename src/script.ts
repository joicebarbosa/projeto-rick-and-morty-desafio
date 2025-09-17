const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const charactersContainer = document.getElementById('characters-container') as HTMLElement;
const modal = document.getElementById('modal') as HTMLElement;
const detailsContainer = document.getElementById('character-details') as HTMLElement;
const closeButton = document.querySelector('.close-button') as HTMLElement;
const prevPageButton = document.getElementById('prev-page-button') as HTMLButtonElement;
const nextPageButton = document.getElementById('next-page-button') as HTMLButtonElement;

let currentPage = 1;

// Evento de busca principal
searchButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const characterName = searchInput.value;

    if (characterName) {
        currentPage = 1; // Reseta a página para 1 em uma nova busca
        await fetchCharacters(characterName, currentPage);
    }
});

// Evento para a página seguinte
nextPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value;
    if (characterName) {
        currentPage++;
        await fetchCharacters(characterName, currentPage);
    }
});

// Evento para a página anterior
prevPageButton.addEventListener('click', async () => {
    const characterName = searchInput.value;
    if (characterName && currentPage > 1) { // Garante que a página não seja menor que 1
        currentPage--;
        await fetchCharacters(characterName, currentPage);
    }
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('modal-visible');
});

// Função para buscar os personagens
async function fetchCharacters(name: string, page: number) {
    const query = `
        query GetCharactersByName($name: String!, $page: Int!) {
            characters(filter: { name: $name }, page: $page) {
                info {
                    next
                    prev
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

    const variables = {
        name: name,
        page: page
    };

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
        const characters = data.data.characters.results;
        
        renderCharacters(characters);

    } catch (error) {
        console.error('Falha ao buscar personagens:', error);
    }
}

// Função para renderizar os cards dos personagens
function renderCharacters(characters: any[]) {
    charactersContainer.innerHTML = ''; // Limpa o contêiner
    
    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.classList.add('character-card');
        characterCard.addEventListener('click', () => {
            showCharacterDetails(character.id);
        });
        
        const statusColor = character.status === 'Alive' ? 'green' : 'red';
        
        characterCard.innerHTML = `
            <img src="${character.image}" alt="${character.name}" style="border: 2px solid ${statusColor};">
            <h3>${character.name}</h3>
            <p>Status: ${character.status}</p>
            <p>Espécie: ${character.species}</p>
        `;
        
        charactersContainer.appendChild(characterCard);
    });
}

// Função para exibir os detalhes do personagem no modal
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
    } catch (error) {
        console.error('Falha ao buscar detalhes do personagem:', error);
    }
}