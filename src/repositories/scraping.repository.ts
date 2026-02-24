import { Database } from "better-sqlite3";

export class ScrapingRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}
}
