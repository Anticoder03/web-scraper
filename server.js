const express = require("express");
const path = require("path");
const cors = require("cors");
const scrapePage = require("./scraper");
const archiver = require("archiver");

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/scrape", async (req, res) => {
  const siteUrl = req.query.url;
  if (!siteUrl) return res.status(400).send("URL is required");

  try {
    console.log("Scraping:", siteUrl);
    const { jsonOutput, csvOutput } = await scrapePage(siteUrl);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=scraped_data.zip");

    const archive = archiver("zip");
    archive.pipe(res);

    archive.append(jsonOutput, { name: "data.json" });
    archive.append(csvOutput, { name: "data.csv" });

    archive.finalize();

  } catch (err) {
    console.log(err);
    res.status(500).send("Scraping failed.");
  }
});

app.listen(3000, () => console.log("✅ UI running at http://localhost:3000"));
