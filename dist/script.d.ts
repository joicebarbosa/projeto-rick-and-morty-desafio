declare var particlesJS: any;
declare const searchInput: HTMLInputElement;
declare const searchButton: HTMLButtonElement;
declare const charactersContainer: HTMLElement;
declare const modal: HTMLElement;
declare const detailsContainer: HTMLElement;
declare const closeButton: HTMLElement;
declare const prevPageButton: HTMLButtonElement;
declare const nextPageButton: HTMLButtonElement;
declare const paginationContainer: HTMLElement;
declare const pageNumbersContainer: HTMLElement;
declare const globalTooltip: HTMLElement;
declare let currentPage: number;
declare let totalPages: number;
declare function fetchCharacters(name: string, page: number): Promise<void>;
/**
 * Mudar de página ao clicar em um número
 */
declare function goToPage(pageNumber: number): Promise<void>;
/**
 * Cria um único botão de página numerado.
 */
declare function createPageButton(pageNumber: number, container: HTMLElement): void;
/**
 * Gera e injeta os botões de número de página dinamicamente (Mini-Display).
 */
declare function renderPageNumbers(): void;
/**
 * Atualiza o estado (disabled) dos botões Anterior/Próxima e renderiza os números.
 */
declare function updatePagination(prev: number | null, next: number | null): void;
declare function renderCharacters(characters: any[]): void;
declare function showTooltip(character: any, x: number, y: number): void;
declare function moveTooltip(x: number, y: number): void;
declare function hideTooltip(): void;
declare function showCharacterDetails(id: string): Promise<void>;
//# sourceMappingURL=script.d.ts.map