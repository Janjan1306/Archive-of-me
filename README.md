# Archive-of-me
A customizable digital library and EPUB reader with visual story mapping, annotations, and personalized reading spaces.

---

# Personal Reading Workspace

Phase 1 of DMS4 A1: a desktop-first, flat typographic digital library. This is a static application, with no account, server, paid API, or sync. The reference images guide the saturated spine design; no 3D effects are used.

## Run locally

From this directory run `python3 -m http.server 8000 --directory dist`, then visit http://localhost:8000. Use an HTTP server rather than opening index.html directly. No build step or Node installation is required. Google Fonts is optional; system fallback fonts work offline. JSZip 3.10.1 is vendored, with its license header retained.

## Architecture and structure

- `dist/index.html`: semantic shell, import and book-detail controls.
- `dist/styles.css`: black/saturated design tokens, responsive spines and horizontal selection view.
- `dist/app.js`: IndexedDB repository, EPUB ZIP/XML metadata parsing, library rendering, edit/delete and backup.
- `dist/vendor/jszip.min.js`: pinned MIT-licensed ZIP parser and backup generator.
- `.openai/hosting.json`: Sites hosting configuration; not required by GitHub Pages.

A strict single HTML file conflicts with the vendored dependency and readable modular assets. The smallest alternative is this static directory. Core library behavior requires no network after assets are loaded. The app uses IndexedDB to retain original EPUB Files, metadata and cover Blobs; a transaction must finish before the UI reports a save. Import failures do not remove existing data. LocalStorage only records whether sample books were initialized.

EPUB content is never inserted as executable HTML. Imports validate the MIME entry, container XML and OPF spine; encrypted content other than known font obfuscation is rejected. Files are limited to 50 MB. Malformed packages fail visibly. Very large decompressed archives remain a memory risk; this prototype is not a hardened hostile-file processor.

## Implemented

- Three labeled demos with usable excerpts, including original Vietnamese sample text.
- Upright books with varied heights, widths and typography, slight tilts and landscape stacks; add-book placeholders.
- Horizontal spine selection, book details and sample excerpts.
- Responsive shelf pagination, previous/next buttons, horizontal scrolling within each shelf; Shift + horizontal trackpad gestures switch shelves.
- Real DRM-free EPUB import: title, author, optional raster cover and original file storage.
- Editable titles, author, color and typography; confirmed deletion.
- Persistent IndexedDB library; visible storage/import errors.
- ZIP backup containing original EPUBs, covers and JSON metadata.

## Phase checklist / deferred work

- [x] Phase 1: foundation, library, selection, EPUB import and storage.
- [ ] Phase 2: EPUB.js rendering, TOC, reader customization and saved EPUB CFI position.
- [ ] Phase 3: CFI-linked selection, highlights, editable notes and restored annotations.
- [ ] Phase 4: per-book canvas, typed cards, drag/pan/zoom, labeled connections and source jumps.
- [ ] Phase 5: themes, split view, validated Spotify/YouTube embeds.

Reader/board controls are deliberately absent: this phase does not pretend to render EPUB chapters. Later EPUB.js content should run in sandboxed frames without scripts; annotations should persist stable CFIs and source text by book ID in versioned IndexedDB stores. Advanced CSS, HTML widgets and backup metadata restore are deferred. EPUBs from the backup can already be re-imported.

## Manual acceptance checks

1. Start in a fresh browser profile. Confirm exactly 3 clearly labeled sample books and add placeholders. Open each sample and read its excerpt.
2. Use both Shelf and Spines views. Open book details, change a title to Vietnamese, pick a color and typography, save, reload and check restoration.
3. Import a valid DRM-free EPUB with metadata/cover. Confirm title, author and cover; reload and confirm the imported book remains. Inspect IndexedDB `personal-reading-workspace` / `books` to confirm the original File is retained.
4. Try a renamed non-ZIP file, invalid XML, missing package and encrypted EPUB. Confirm visible errors and preservation of existing books.
5. Import enough books to fill multiple shelves. Check previous/next, horizontal trackpad navigation and window resizing. Verify all books remain reachable, including at 375px.
6. Delete a book, cancel once, then confirm. Reload and check that only the confirmed book is gone.
7. Export backup, unzip it, inspect JSON and re-import an exported EPUB.
8. Deny browser storage; confirm a visible error and disabled import. Simulate a quota failure and ensure no successful-save message or phantom book appears.
9. Keyboard-tab through navigation, shelves and details; Escape closes dialogs.

The full brief's reader/annotation/board scenarios belong to Phases 2–5 and must be tested then. See VALIDATION.md for checks actually run in this implementation session.

## GitHub Pages deployment

Create a repository containing these files. In GitHub Settings → Pages choose GitHub Actions. Use an upload-pages-artifact action with `path: dist` followed by deploy-pages, with `pages: write` and `id-token: write` permissions. Alternatively copy the contents of `dist/` to a publishing branch root and select that branch under Pages. All application links are relative, so repository subpaths work. HTTPS is recommended. Browser data belongs to its origin: localhost, GitHub Pages and a hosted preview have separate libraries. Export before changing origin or clearing data.

## Main Library redesign

The hero has been removed. Each shelf contains exactly up to 16 real books (1–16, 17–32, etc.), independent of viewport width or orientation. No filler books are created. Scroll horizontally within a shelf, or Tab through book buttons to reveal offscreen books. Previous/next and Shift + horizontal trackpad scrolling change shelves explicitly. Large collections retain readable book dimensions rather than shrinking to fit.

Open a book and use **Customize Book Appearance** to edit title, author, color, typography, thickness (32–140 px), height (180–340 px), orientation and tilt (2–12 degrees). Changes preview live. Save commits them; Cancel, Close or Escape discard the draft. Reset restores that book's original legacy proportions/color/type and default orientation; it is also a draft until saved. Consecutive horizontal books form stacks of at most three; each book remains its own button. Long titles may ellipsize on the spine; full titles and authors remain in accessible button names, tooltips and details. Very thin upright spines omit the visible author to prevent text overlap.

Records now optionally contain `appearance: {orientation, thickness, height, tilt, color, typography}`. Older records read their top-level `width`, `height`, `color`, and `type` without any database migration or write. The existing database name, version and keys are unchanged. Demo defaults illustrate upright, tilted-left and horizontal books; saved appearance always takes precedence. New imports use an intentional repeating size/orientation sequence. EPUB parser, DRM checks and backup code remain unchanged; the existing metadata export naturally includes appearance. Reset does not change title, author, EPUB content or other metadata.

Run `node tests/library.test.cjs` for regression checks of pagination boundaries, legacy appearance fallbacks and geometry. See VALIDATION.md for browser results and remaining manual checks. This redesign is synchronized through GitHub; pushing code does not by itself update the separately hosted Sites preview.
