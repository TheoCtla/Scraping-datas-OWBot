export interface Skin {
	name: string | null;
	price: string | null;
	code: string | null;
}

export interface SkinWithHero {
	id: number;
	name: string;
	price: number;
	code: string | null;
	isActive: number; // 0 ou 1 car SQLite n'a pas de vrai booléen
	heroName: string; // Le nom qu'on va récupérer via la jointure
}
