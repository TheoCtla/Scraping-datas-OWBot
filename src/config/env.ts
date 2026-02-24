import dotenv from "dotenv";

dotenv.config();

export const config = {
	PORT: Number(process.env.PORT) || 3000,
	HOST: process.env.HOST || "localhost",
	SHOP_URL:
		process.env.SHOP_URL || "https://shop.battle.net/fr-fr/family/overwatch",
};
