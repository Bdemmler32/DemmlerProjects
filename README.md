# The Artifact Index

A link-tree style landing page that pulls a live thumbnail for each project
straight from its URL, no manual screenshotting.

## Files

- `index.html` — page structure
- `style.css` — all styling
- `script.js` — loads your link list and fetches thumbnails
- `links.csv` — local, editable list of links (used if you don't set up a Google Sheet)

## 1. Add your links

Two ways to manage the list — pick one, switch anytime.

### Option A — Google Sheet (edits go live instantly, no commit needed)

1. Make a Google Sheet with three columns, exactly: `title`, `url`, `description`
   (description is optional, leave blank cells if you don't want one).
2. **File > Share > Publish to web**. Choose the sheet tab, set the format
   dropdown to **CSV**, click Publish.
3. Copy the URL it gives you.
4. Open `script.js` and paste it into:
   ```js
   const SHEET_CSV_URL = "PASTE_YOUR_PUBLISHED_CSV_URL_HERE";
   ```
5. Commit that one change. From now on, editing the sheet and refreshing the
   page is all you need — no redeploying.

### Option B — local CSV (edit in Excel/Numbers, commit to update)

1. Leave `SHEET_CSV_URL` blank in `script.js`.
2. Edit `links.csv` directly, or edit it in Excel and re-export/save as CSV
   with the same filename, same three columns: `title,url,description`.
3. Commit and push. GitHub Pages picks it up on the next deploy.

## 2. Thumbnails — how they work

For each link, the page first tries to load the site's own preview image
(the same `og:image` used by iMessage/Slack link previews). If a site
doesn't have one, it automatically falls back to a live screenshot of the
page instead. Both are fetched through [microlink.io](https://microlink.io),
which requires no API key for light traffic.

**Note:** the free, keyless tier has a modest daily rate limit. If you have
a lot of visitors or a lot of links, you can get a free API key from
microlink and add it as a query param (`&apiKey=...`) in `script.js` inside
`ogImageUrl` and `screenshotUrl` for higher limits.

## 3. Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo **Settings > Pages** → set source to your default branch, root folder.
3. Your page will be live at `https://<username>.github.io/<repo>/` within a
   minute or two.

## Customizing

- Page title / intro copy: edit the `<header class="hero">` block in `index.html`.
- Colors, fonts, spacing: all in `style.css` under the `:root` variables at the top.
