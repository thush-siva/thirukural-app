# Thirukkural

A visual reader for the Thirukkural, the 2,000-year-old Tamil classic of 1,330 couplets. Built for the global Tamil community, especially second-generation learners who want to read the original, not just a translation.

**Live prototype:** https://thush-siva.github.io/thirukural-app/

Works best on a phone. On desktop, move your pointer over the sections and use the scroll wheel or arrow keys in the reader.

<p>
  <img src="docs/01-home.png" width="200" alt="Home screen with the three sections shown as 3D books">
  <img src="docs/02-section.png" width="200" alt="The Wealth section opened, with chapter cards">
  <img src="docs/04-word.png" width="200" alt="A kural with one word selected and its meaning in a bottom sheet">
  <img src="docs/05-word-by-word.png" width="200" alt="Word by word mode, with the transliteration and meaning under every word">
</p>

## What it does

- **Three sections as 3D books.** Virtue, Wealth and Love sit on a shelf. The front book tilts and catches light as you move, and tapping it swings the cover open.
- **Chapters as cards.** Each section opens to a row of chapter cards with their own imagery, reading progress and a bouncy, TV-style focus.
- **A full-screen reader.** Swipe up through the ten kurals of a chapter. Reaching the end returns you to the section.
- **Tap any Tamil word.** A sheet slides up with the word, how to say it and what it means, with previous and next to walk through the couplet.
- **Word by word.** One toggle shows the pronunciation and meaning under every word at once, for study.

## Design decisions

- **The text is the hero.** Navigation is reduced to thin indicators so the couplet fills the screen.
- **Learning without leaving the page.** Most Kural apps give you a translation. This one teaches you the words, so readers slowly need the translation less.
- **Each section has its own world.** Colour, cover pattern and imagery change per section. The cover patterns are drawn from kolam, the dot-grid patterns drawn at Tamil doorsteps.
- **iOS-native feel.** Floating glass controls, spring physics and large type, in the direction of Apple's Liquid Glass.

## Status

This is a design prototype in HTML, CSS and JavaScript. Three sample chapters are included:

| Section | Sample chapter |
|---|---|
| I · Virtue | Chapter 1, கடவுள் வாழ்த்து (In Praise of God) |
| II · Wealth | Chapter 40, கல்வி (Learning) |
| III · Love | Chapter 109, தகையணங்குறுத்தல் |

Every chapter card in a section opens that section's sample chapter. Audio, Saved and Ask are placeholders.

## Content and accuracy

- The Tamil text of the Thirukkural is in the public domain.
- Word splits, transliterations and glosses in `js/data.js` are working drafts and have not yet been reviewed by a Tamil scholar.
- The chapter image is a placeholder. Each chapter will get its own artwork.

## Roadmap

- Native iOS app in SwiftUI, with lock-screen widgets for a daily kural
- All 1,330 kurals with reviewed word-by-word glosses
- Original artwork for each of the 133 chapters
- Audio recitation
- Saved kurals and "a kural for this moment" search

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

Then visit http://localhost:8000.

## Structure

```
index.html        Screens and layout
css/styles.css    Visual design and motion
js/data.js        Sections, chapters and kural content
js/app.js         Interactions
assets/           Chapter imagery
docs/             Screenshots
```

Designed by Thushjanthan (TJ) Sivagurunathan · [Portfolio](https://www.thushjanthansivagurunathan.xyz)
