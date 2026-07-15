# Baby QA's Panda Garden

A private locked QA workspace for collecting testing notes, bug lists, small project tasks, screenshots, and calm break notes in one place.

This is a static HTML/CSS/JavaScript app with a soft access screen, browser-local saving, mobile layout, and PWA support.

## Public Access Boundary

- The public route shows the locked access screen first.
- No access password is written in this README.
- Access details should be shared directly only with approved users.
- This is a soft private lock for a static site, not high-security authentication.
- Do not store company secrets, payment details, or sensitive personal data inside the app.

## Files

```text
baby-qa-garden/
- index.html
- script.js
- manifest.json
- service-worker.js
- images/
```

## Run Locally

Open `index.html` directly for a quick check, or serve the site from the repository root and visit:

```text
/baby-qa-garden/
```

## Deploy Notes

This app can run on static hosting such as Cloudflare Pages or GitHub Pages. Future production login, database storage, and stronger privacy controls should move to a backend/auth system.
