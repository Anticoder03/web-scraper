

# 🌐 **URL → JSON + CSV Converter (Node.js)**

A neat little tool that takes any **URL you paste**, grabs its structured data, and hands you a clean **ZIP file** containing a ready-to-use **JSON** and **CSV** export. Quick, lightweight, and perfect for workflows where you just need clean data without the drama.

---

## ✨ **What This Tool Does**

✅ Accepts **any valid URL**
✅ Fetches the page and extracts:

* Visible **text content**
* All **image sources** (auto-converted to absolute URLs)
  ✅ Generates **output.json** and **output.csv**
  ✅ Bundles both files into a single **ZIP download**
  ✅ No heavy browser engines — just fast HTML parsing

Zero fluff. Zero bloat. Just data.

---

## 🚀 **Tech Stack**

* **Node.js**
* **axios** → Fast page fetching
* **cheerio** → HTML parsing (jQuery vibes)
* **json2csv** → CSV output
* **adm-zip** → ZIP file creation
* **Express** → Tiny backend for link → ZIP UI
* **Tailwind CSS** → Clean UI
* **Font Awesome** → Icons

Classic tools. Reliable stuff.

---

## 📦 **Installation**

Make sure Node.js is installed, then grab the required packages:

```bash
npm install axios cheerio json2csv adm-zip express cors
```

For the frontend:

```bash
npm install
```

(If you’ve added Tailwind manually, skip this step.)

---

## ▶️ **How to Use**

### **1️⃣ Start the Backend**

```bash
node server.js
```

### **2️⃣ Open the UI**

Paste your target URL into the input box → hit **Generate ZIP**.

### **3️⃣ Download the ZIP**

Inside, you’ll get:

📄 `output.json`
📄 `output.csv`

Clean and ready for use anywhere — Excel, ML models, dashboards, whatever.

---

## 📁 **Output Format**

Each row looks like:

```json
{
  "page": "https://example.com",
  "text": "Visible text from the page",
  "image": "https://example.com/image.png"
}
```

Simple. Structured. Developer-friendly.

---

## 🧩 **Project Structure**

```
url-data-converter/
 ├── server.js
 ├── public/
 │    ├── index.html
 │    ├── style.css
 │    └── script.js
 ├── output/
 │    ├── output.json
 │    ├── output.csv
 │    └── result.zip
 └── README.md
```

---

## ⚙️ **Config Options**

Inside `server.js`:

```js
const VISIT_CHILDREN = false;
```

Set `true` if you want to crawl internal links from the same domain.

---

## 📝 **Notes**

* Works best on **static HTML** pages
* For sites that rely heavily on JavaScript rendering, switch to a Puppeteer-based version
* Be respectful — scrape only content you’re allowed to access
* Converts all images to **absolute URLs** automatically

---

## 🏷️ **Credits**

All rights reserved © **Anticoder03**

