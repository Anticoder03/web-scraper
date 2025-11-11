import express from "express";
import cors from "cors";
import { scrapeAndZip } from "./scraper.js";

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing url");

    const buffer = await scrapeAndZip(url);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=scraped_data.zip");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log("Local server running at http://localhost:3000"));
