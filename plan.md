# PulseLore Track Passport — First Managed Preview Plan

## Outcome

Build only the public, read-only Track Passport preview for **Stay In The Blue — The 404 Pages**. The preview must be available at the verification route `/verify/PL-404-STB-001` and use the supplied cover artwork unchanged. No DNS, Supabase, permanent QR, admin tools, evidence storage, fingerprinting, or production publication is in scope.

## Architecture

- **Frontend:** Vite + React + TypeScript, served as a static single-page application during Preview.
- **Data:** typed local/mock records in `src/data/passport.ts`, separated into artists, tracks, passports, credits, and official links so future database wiring does not require a UI rewrite.
- **Routing:** lightweight pathname-based rendering for `/` and `/verify/PL-404-STB-001`; the Vite fallback keeps the verification URL previewable directly. The canonical route is also listed in `public/manus-routes.json`.
- **Assets:** the uploaded cover artwork is copied into `public/assets/` without transformation. A small PulseLore mark is created as a project-specific square logo for site identity; it is separate from and does not alter the cover artwork.
- **Serving:** static Preview on the managed runtime port 3000, listening on `0.0.0.0`; no server or database features are enabled.

## Page composition

- **Mobile:** sequential editorial sections: identity/cover, writing, performance, source, production record, creation route, release record, official links, and official verification.
- **Desktop:** split editorial composition with a sticky cover/identity column and a structured record column, plus a horizontal/rail-like creation route and verification panel. It is not a stretched mobile stack.
- **Visual system:** dark ink background, electric/cobalt blues sampled from the cover, moonlight cream highlights, hairline rules, grain/noise, compact monospace metadata, and restrained serif/sans display typography.

## Verification

The page explicitly uses the phrase **Production Record Verified by PulseLore Studio** and distinguishes provenance documentation from legal ownership/copyright certification. Suno is labeled only as an AI Demo / Source Stems stage. Official links are real direct destinations; the QR area is a visual placeholder only.

## Validation

Run TypeScript/build checks, confirm the dev process responds on port 3000, request `/manus-routes.json` for a 200 JSON response, inspect source against the acceptance criteria, and capture the requested mobile and desktop screenshots with the managed Webdev screenshot tool. Do not call the publish endpoint; Preview and checkpoint only.
