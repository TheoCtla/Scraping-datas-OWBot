import express from "express";
import { config } from "./config/env";
import skinRouter from "./routes/skin.route";
import scrapingRouter from "./routes/scraping.route";
import heroRouter from "./routes/hero.route";

const app = express();
app.use(express.json());

app.use("/api/skins", skinRouter);
app.use("/api/scraping", scrapingRouter);
app.use("/api/heroes", heroRouter);

app.listen(config.PORT, config.HOST, () => {
	console.log(`🚀 Serveur STARTED sur http://${config.HOST}:${config.PORT}`);
});
