/* ============================================================
   CONFIG
   ------------------------------------------------------------
   Option A — Google Sheet (recommended, no re-commit needed):
     1. Create a sheet with columns: title, url, description
     2. File > Share > Publish to web > pick the sheet > CSV
     3. Paste the resulting URL below.

   Option B — leave SHEET_CSV_URL empty and this page will read
   ./links.csv from the repo instead. Edit that file (Excel,
   Numbers, Google Sheets export, plain text — anything that
   saves a CSV) and commit to update the page.
   ============================================================ */

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQe8pR8ufaj2XozNofVQ-d_gwodpz92dHvYIorDWqcQFaWUxZdqG-yfK2B9sf5E3p-SE5UjWLn6z9gB/pub?output=csv";
const LOCAL_CSV_FALLBACK = "./links.csv";

// Thumbnail sources (no API key required for light use).
// 1) tries the site's own og:image via microlink
// 2) falls back to a live screenshot via microlink
// 3) falls back to a plain placeholder if both fail
function ogImageUrl(url) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
}
function screenshotUrl(url) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&waitFor=800`;
}

const catalogEl = document.getElementById("catalog");
const emptyStateEl = document.getElementById("empty-state");
const metaLineEl = document.getElementById("meta-line");

init();

async function init() {
  renderSkeletons(6);

  let rows = [];
  try {
    rows = await loadRows();
  } catch (err) {
    console.error("Could not load links:", err);
  }

  rows = rows
    .filter((r) => r.url && r.url.trim())
    .map((r) => ({
      title: (r.title || r.url).trim(),
      url: r.url.trim(),
      description: (r.description || "").trim(),
    }));

  if (rows.length === 0) {
    catalogEl.innerHTML = "";
    emptyStateEl.hidden = false;
    metaLineEl.textContent = "0 entries";
    return;
  }

  emptyStateEl.hidden = true;
  metaLineEl.textContent = `${rows.length} ${rows.length === 1 ? "entry" : "entries"} on file`;
  renderCards(rows);
}

async function loadRows() {
  let text = null;

  if (SHEET_CSV_URL) {
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (res.ok) text = await res.text();
    } catch (err) {
      console.warn("Google Sheet fetch failed, falling back to local links.csv", err);
    }
  }

  if (!text) {
    const res = await fetch(LOCAL_CSV_FALLBACK, { cache: "no-store" });
    if (!res.ok) throw new Error("links.csv not found");
    text = await res.text();
  }

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  return parsed.data;
}

function renderSkeletons(n) {
  catalogEl.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const div = document.createElement("div");
    div.className = "card skeleton";
    div.innerHTML = `
      <div class="thumb-wrap"></div>
      <div class="card-body">
        <div class="line" style="width:80%;height:1.1em;"></div>
        <div class="line"></div>
        <div class="line short"></div>
      </div>`;
    catalogEl.appendChild(div);
  }
}

function renderCards(rows) {
  catalogEl.innerHTML = "";
  const frag = document.createDocumentFragment();

  rows.forEach((row, i) => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = row.url;
    card.target = "_blank";
    card.rel = "noopener";

    const num = String(i + 1).padStart(3, "0");
    let domain = row.url;
    try {
      domain = new URL(row.url).hostname.replace(/^www\./, "");
    } catch (_) {}

    card.innerHTML = `
      <div class="thumb-wrap">
        <span class="catalog-no">NO. ${num}</span>
        <img alt="" loading="lazy">
      </div>
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(row.title)}</h2>
        ${row.description ? `<p class="card-desc">${escapeHtml(row.description)}</p>` : ""}
        <p class="card-url"><span class="arrow">&rarr;</span>${escapeHtml(domain)}</p>
      </div>
    `;

    const img = card.querySelector("img");
    loadThumbnail(img, row.url);

    frag.appendChild(card);
  });

  catalogEl.appendChild(frag);
}

function loadThumbnail(img, url) {
  img.onload = () => img.classList.add("loaded");
  img.onerror = () => {
    if (img.dataset.stage === "screenshot") {
      // both attempts failed — leave the gradient background as-is
      img.onerror = null;
      return;
    }
    img.dataset.stage = "screenshot";
    img.src = screenshotUrl(url);
  };
  img.dataset.stage = "og";
  img.src = ogImageUrl(url);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
