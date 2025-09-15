const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;

searchButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Impede o formulário de recarregar a página
    const characterName = searchInput.value;

    if (characterName) {
        console.log('Buscando personagem:', characterName);
        await fetchCharacters(characterName);
    }
});

async function fetchCharacters(name: string) {
    const query = `
        query GetCharactersByName($name: String!) {
            characters(filter: { name: $name }) {
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
        name: name
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
        console.log('Dados recebidos:', data);

        // Aqui vamos processar os dados para mostrar na tela no próximo passo
        // Por enquanto, vamos apenas ver os dados no console
    } catch (error) {
        console.error('Falha ao buscar personagens:', error);
    }
}
