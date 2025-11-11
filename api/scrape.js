import { scrapeAndZip } from "../scraper.js";

export default async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Missing ?url parameter" });
    }

    const zipBuffer = await scrapeAndZip(url);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=scraped_data.zip"
    );

    return res.send(zipBuffer);

  } catch (err) {
    console.error("SCRAPE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
