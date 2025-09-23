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
declare let currentPage: number;
declare function fetchCharacters(name: string, page: number): Promise<void>;
declare function renderCharacters(characters: any[]): void;
declare function showCharacterDetails(id: string): Promise<void>;
//# sourceMappingURL=script.d.ts.map