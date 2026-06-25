# Baby's QA Garden

A private soft QA helper gift made by Ko Ko for Baby. It is a static HTML/CSS/JavaScript web app with a gentle access screen, local browser saving, mobile layout, and PWA support.

## Files

```text
Baby-QA-Garden-Ready/
├─ index.html
├─ style.css
├─ script.js
├─ manifest.json
├─ service-worker.js
├─ sw.js
└─ images/
   └─ panda-garden.svg
```

## Run Locally

You can open `index.html` directly in a browser for a quick check.

For PWA and service worker testing, use the included local server:

```bash
node local-server.js
```

Then open:

```text
http://127.0.0.1:8088/
```

## Access Code

The access code is stored in one clearly marked place near the top of `script.js`:

```js
const GARDEN_ACCESS_CODE = "Khin@159518";
```

To change it later, edit that value and redeploy the app.

This is only a soft private gift lock. It is not high-security authentication.

## Change App Name

Update the name in:

- `index.html` title and visible headings
- `manifest.json` `name` and `short_name`
- `README.md` if needed

## Deploy

### Netlify

1. Drag the whole `Baby-QA-Garden-Ready` folder into Netlify Drop.
2. Or connect a Git repository and set the publish directory to the folder.
3. No build command is needed.

### Vercel

1. Import the project folder.
2. Framework preset: Other.
3. Build command: leave empty.
4. Output directory: `.`.

### Cloudflare Pages

1. Create a Pages project.
2. Upload the folder or connect the repository.
3. Build command: leave empty.
4. Output directory: `.`.

## Send the Link as a Gift

After deployment, copy the final HTTPS URL and email it to Baby with the access code:

```text
Here is your private QA Garden:
https://your-deployed-link.example

Access code:
Khin@159518
```

## Add to Home Screen

On iPhone:

1. Open the deployed HTTPS link in Safari.
2. Tap Share.
3. Tap Add to Home Screen.

On Android:

1. Open the deployed HTTPS link in Chrome.
2. Tap the menu.
3. Tap Install app or Add to Home screen.

## Data Saving

The app saves access state, form fields, generated outputs, and re-test basket items in `localStorage`. Data stays on that browser only. Use Backup Garden to export/import saved data.
