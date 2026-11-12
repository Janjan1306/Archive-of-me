# Archive-of-me
A customizable digital library and EPUB reader with visual story mapping, annotations, and personalized reading spaces.

---

# Personal Reading Workspace

A desktop-first digital library for DMS4 A1. Books are personal workspaces; EPUB files are optional attachments. The static application uses no backend, required account, paid API or automatic synchronization.

## Run locally

From this directory run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8000/. No build step or Node installation is required to run the app. Google Fonts is optional; fallback fonts work offline. JSZip 3.10.1 is vendored with its license header retained.

## Use the library

- **Create New Book** opens a title/author dialog. A book is saved to IndexedDB immediately after Create, without an EPUB. Select its spine to enter its workspace.
- **Import EPUB** validates a DRM-free EPUB and creates a separate book from its metadata.
- The shelf's plus placeholder creates an empty book. Shelf and Spines views remain available.
- A shelf contains at most 16 actual books: books 1–16, 17–32 and so on. No filler books are generated. New books append to the collection, and the library shows the shelf containing them.
- Scroll horizontally or Tab through book buttons within a shelf. Previous/next and Shift + horizontal trackpad scrolling explicitly change shelves. Books retain readable dimensions on narrow windows.

Three existing demo records remain intact. Each has a clearly labeled sample excerpt, not a full EPUB. Existing metadata and appearance customizations are retained.

## Per-book workspace

Click a spine to open its workspace directly. **Back to Library** returns to the shelf and view you were using.

**Reader** displays a white reading area with black text. Empty books show “No EPUB attached yet.” Demos show their available sample excerpt. Attached books show the saved file and a working download action. Full EPUB rendering is deferred; the app never pretends to display the attached book's chapters.

**Story Board** currently provides functional text notes. Create, edit and delete notes for the current book; deletion requires confirmation. Notes persist locally, have stable IDs, and never appear in another book. A future canvas can extend this data model.

**Attach EPUB** adds a validated file to the same book. **Replace EPUB** requires confirmation before choosing a replacement. Attachment and replacement retain the ID, title, author, appearance, notes and other workspace fields. Extracted EPUB title/author are stored separately under `epubMetadata`; they never automatically overwrite your chosen title/author. A failed parse or save leaves the existing record unchanged.

Workspace URLs use `#book/<id>/reader` or `#book/<id>/board`, so refreshing restores that book and tab on the same browser/origin. These URLs do not share local book data with another device.

## Customize Book

From the workspace choose **Customize Book** to open the existing editor: title, author, color, typography, thickness (32–140 px), height (180–340 px), upright/left/right/horizontal orientation and tilt (2–12 degrees). Changes preview live; Save persists them. Cancel, Close and Escape discard preview edits. Reset restores the saved default appearance, and is also a draft until Save. It does not reset notes, EPUB content, title or author.

Horizontal books have landscape typography. Consecutive horizontal books form stacks of at most three. Rotated bounding boxes reserve space for tilted shapes. Long spine text can ellipsize; full title/author remain in accessible names, tooltips and workspace details. Thin upright spines omit the visible author to avoid overlap.

## Data and compatibility

The IndexedDB name remains `personal-reading-workspace`, version 1, with the same `books` store. Existing records are never deleted, reset, duplicated or migrated on startup. Demo seeding occurs only on the original first-visit condition.

Book records can contain:

- Legacy `color`, `width`, `height`, `type` fields, used as appearance fallbacks without writes.
- Optional `appearance` and `appearanceDefaults` objects.
- Optional original EPUB `file`, raster `cover`, `packagePath`, and attachment metadata.
- Optional `workspace: {schemaVersion: 1, notes: [{id, title, body, createdAt, updatedAt}]}`.

Unknown workspace fields are preserved for future visual cards/connections. Note and attachment updates read/modify/write a record in one IndexedDB transaction, so an attachment does not replace workspace data with an older snapshot. The UI reports successful saves only after transaction completion.

Storage belongs to the browser, device and origin. `localhost`, `127.0.0.1`, GitHub Pages and Sites have separate libraries. Export before clearing browser data or changing origins. Export library backup creates a ZIP with all book metadata (including workspace notes and appearance), covers and original EPUBs. EPUBs can be re-imported; automatic restoration of backup metadata is deferred.

The EPUB parser keeps the existing MIME/container/XML/OPF validation, encryption rejection except known font obfuscation, file-count bound and 50 MB compressed-file limit. EPUB content is never inserted as executable HTML. Storage and import errors are visible. Extremely large decompressed archives remain a memory risk; this is not a hardened hostile-file processor.

## Project structure

- `dist/index.html`: library, creation dialog, per-book workspace, appearance editor.
- `dist/styles.css`: responsive flat saturated spines, editor and workspace UI.
- `dist/app.js`: IndexedDB transactions, navigation, optional attachment, note models, EPUB parsing and backup.
- `dist/vendor/jszip.min.js`: pinned ZIP parser and generator.
- `tests/library.test.cjs`: model/pagination and real ZIP backup regression tests.
- `tests/sample.epub` / `tests/invalid.epub`: synthetic import fixtures.
- `VALIDATION.md`: checks performed and remaining limits.
- `.openai/hosting.json`: separate Sites hosting configuration.

## Tests

Run `node --check dist/app.js` and `node tests/library.test.cjs`. Node is only needed for regression tests, not the website.

Manually test: create a book without a file; open its workspace; save/edit/delete a note and reload; attach an EPUB and verify ID/count/title/appearance/notes; cancel replacement, then replace; try the invalid fixture; open all three demo excerpts; use Customize Book; return to the library; create enough books for Shelf 02; export ZIP and inspect `library.json` and EPUB files. Test denied storage/quota errors in an isolated profile. See VALIDATION.md for what was actually run.

## Deferred

Full EPUB rendering/TOC/progress, CFI annotations, visual board cards/connections, split view, music widgets and custom CSS/HTML are deferred. Notes are a real foundation for the board; attached EPUBs are stored but are not yet rendered.

## GitHub Pages

Use GitHub Settings → Pages → GitHub Actions with `upload-pages-artifact` pointing to `dist`, followed by `deploy-pages`, with `pages: write` and `id-token: write` permissions. Alternatively copy the contents of `dist/` to a publishing branch root and select that branch in Pages. All links are relative, so repository subpaths work. HTTPS is recommended.

Pushing source to GitHub does not itself redeploy the separately hosted Sites preview. Keep reviewing the local preview until a deployment is requested.
