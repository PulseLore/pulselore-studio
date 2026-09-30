# Design Direction — Midnight Studio Archive

## Theme Name

**Midnight Studio Archive**

## Intro

A premium liner-note interface for a single recording's production provenance: dark, tactile, blue-lit and quietly technical rather than corporate.

## Design movement

Independent music publishing meets recording-session documentation. The interface should feel like a collectible insert or archival sleeve opened on a phone, with the web used as the delivery format—not like a SaaS dashboard.

## Core principles

- Let the official cover artwork lead the experience.
- Make hierarchy legible at a glance after a QR scan.
- Use rules, labels and whitespace instead of card stacks.
- Treat credits as authored liner notes and metadata as technical annotations.
- Keep verification calm and credible; avoid legal or blockchain language.

## Color philosophy

Use the cover's near-black night, deep navy, saturated cobalt/blue, and moonlit cream. The page background is ink-black/navy; blue is reserved for emphasis, focus, links and route markers; cream is the reading color and verification accent. Avoid gradients except for a restrained cover scrim where text needs contrast.

## Layout paradigm

Mobile is a measured vertical reading sequence. Desktop becomes a two-column editorial spread: cover/identity on the left, the living record on the right, with a wide verification footer. Dividers and numbered section markers create a quiet archive rhythm.

## Signature elements

- Monospace passport IDs and release metadata.
- Hairline blue rules and small section numerals.
- A vertical provenance rail with connected nodes, styled like a studio log rather than a business flowchart.
- A real QR lives on the separate shareable Passport Card; the verification page uses a restrained View / Download Passport Card action instead of a QR block.
- Tiny “field notes” labels, used sparingly.

## Interaction philosophy

Links should be obvious and direct. Hover/focus states use a blue underline or lift, not heavy motion. The route should be readable without interaction; motion is limited to a subtle entrance and pulse on the verification accent.

## Animation

Use a short, reduced-motion-friendly fade/translate for sections entering the viewport and a restrained verification glow. Disable non-essential animation for `prefers-reduced-motion`.

## Typography system

Display: a high-contrast editorial serif stack for track/title moments. Body: a clean system sans stack for readable credits. Technical: `ui-monospace` for IDs, labels and release data. Use uppercase labels with tracking, but keep the title and artist warm and human.

## Brand essence

PulseLore Studio documents the path from idea to finished recording with care, clarity and a human production perspective.

## Brand voice

Measured, specific, archival, human-made, non-legalistic.

## Wordmark / logo

Use the supplied official PulseLore Studio logo unchanged in the header, studio section, Passport Card, favicon and footer. Keep it subtle and legible without redrawing or reinterpretation.

## Signature brand color

Cobalt blue `#2e75c9`, balanced by moonlight cream `#e9efdc` and ink `#060b15`.
