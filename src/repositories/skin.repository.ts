import { Database } from "better-sqlite3";

export class SkinRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	getAllSkinsWithHero(): any[] {
		const query = `
            SELECT 
                skin.id, 
                skin.name, 
                skin.price, 
                skin.code, 
                skin.isActive, 
                hero.name as heroName 
            FROM skin
            JOIN hero ON skin.id_hero = hero.id
        `;
		const stmt = this.db.prepare(query);
		return stmt.all();
	}
	postSkin(skin: {
		name: string;
		price: number;
		code: string;
		heroId: number;
	}): void {
		const query = `
            INSERT INTO skin (name, price, code, id_hero) 
            VALUES (?, ?, ?, ?)
        `;
		const stmt = this.db.prepare(query);
		stmt.run(skin.name, skin.price, skin.code, skin.heroId);
	}
}
