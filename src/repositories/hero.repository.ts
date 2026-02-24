import { Database } from "better-sqlite3";

export class HeroRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	getHeroByName(name: string): any {
		const query = `
            SELECT * FROM hero WHERE name = ?
        `;
		const stmt = this.db.prepare(query);
		return stmt.get(name);
	}
	getAllHeroes(): any[] {
		const query = `
            SELECT * FROM hero
        `;
		const stmt = this.db.prepare(query);
		return stmt.all();
	}
	postHero(hero: { name: string }): void {
		const query = `
            INSERT INTO hero (name) 
            VALUES (?)
        `;
		const stmt = this.db.prepare(query);
		stmt.run(hero.name);
	}
}
