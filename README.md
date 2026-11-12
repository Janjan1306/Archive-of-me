# Archive-of-me
A customizable digital library and EPUB reader with visual story mapping, annotations, and personalized reading spaces.

---

# Archive of Me — A1 concept prototype

A static, browser-local library, real EPUB reader and linked Story Board. This upgrade extends the existing vanilla HTML/CSS/JavaScript app. No server, account, paid API or build step is required.

## Run

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8000/. Data belongs to the browser, device and origin. `localhost`, `127.0.0.1`, ports 8000/8001, GitHub Pages and Sites have separate archives. There is no automatic cloud synchronization. Export a complete ZIP before moving origins or clearing browser storage.

A genuinely fresh database receives one editable Sample Library with the complete Alice EPUB and two connected sample cards. Existing archives upgrade without receiving additional samples. Deleted samples are never recreated. Sample source and original redistribution terms: [Project Gutenberg #11](https://www.gutenberg.org/ebooks/11), also documented in `dist/assets/README.md` and retained inside the EPUB.

## Libraries and book workflows

Create Libraries manually using **＋ Library**, even if the current one has room. Tabs display one Library at a time. Manage/Settings renames, reorders, changes shelf-line colors, archives and restores Libraries. Archiving preserves books and workspaces.

Each Library holds at most 16 non-deleted books. Full Libraries block creation, quick import and moves; no automatic overflow Library is created. The shelf scales the whole composition proportionally to fit, without horizontal scrolling. Few books begin at the left. Hover or focus a spine for title, author, progress/status and chapter. Click to enter Reader.

Drag books to reorder, or onto a Library tab to move them. Right-click / Shift+F10 opens management; **Book actions** in the workspace is another accessible entry. Move to Library and Unstack are available there. Hold **Shift while dropping one horizontal book onto another** to explicitly make a stack (maximum three). Pink dashed outlines indicate stacking; yellow indicates ordinary reordering. Stacks are never automatic.

**Create New Book** is Design First: enter title/author, optionally attach EPUB, design the spine, choose destination and Save. Canceling either stage leaves no unfinished record. **Import EPUB** remains Quick Import: validate, extract metadata, save default design directly into the selected Library; customize afterward to correct metadata.

Attach/Replace EPUB preserves the existing ID, chosen title/author, design and board. Replacement requires confirmation, resets only reading position, retains annotations and marks source references unresolved for validation. Extracted title/author are stored separately, never silently substituted.

## Spine studio

Customize Book opens the existing editor as a two-column studio. It retains color, type, thickness, height, orientation, tilt, live preview and Save/Cancel/Reset behavior.

Artwork supports PNG/JPG/WebP, color/image/image+type modes, cover/contain, zoom and positioning. Background color fills unused space. Title and author independently support visibility, built-in or shared imported fonts, size, weight, spacing, color, free-angle rotation and numeric X/Y positioning. Once independent controls are enabled, their text can also be dragged in the preview. The original design dimensions remain stored; shelf scaling transforms the complete composition.

Import TTF/OTF/WOFF/WOFF2 in Settings → Shared Font Library. Fonts are browser-validated before saving and reusable across book designs. Cancel discards the draft. Reset clears artwork/independent type and restores intended default shape/colors; Save is still required.

## Reading and annotation

The real reader opens the imported EPUB ZIP, reads its OPF spine and EPUB3 navigation, and renders one sanitized chapter in a script-free sandboxed iframe. It uses vertical scrolling, Previous/Next Chapter and a TOC selector. Documents without EPUB3 navigation get a numbered spine TOC. It deliberately omits original executable content and author CSS, favoring readable text and permitted raster illustrations over exact publisher layout.

Reader font/size/line spacing/margins and light/cream/dark themes are separate from spine design. Position stores chapter path plus a text offset, and progress records the chapter. Reopening always starts in Reader, offers Continue Reading / Start Over, and restores the saved chapter/anchor. Start Over clears reading position and Finished status, not highlights/cards. Finished is set only after reaching the end of the final spine item; opening Finished books preserves the status. Very short final chapters currently use a downward desktop wheel gesture to acknowledge the visible end (mobile caveat below).

Select text in a chapter for **Highlight**, **Add Note**, **Pin to Board**, five preset colors or a custom color. The sidebar lists highlights, notes, color editing and deletion. Anchors use chapter path, UTF-16 text offsets and exact quote text; these are stable validated text anchors, not EPUB CFIs. Overlapping ranges remain stored; the visual renderer avoids overlapping nested marks.

Pin creates an independent Quote Card without leaving Reader or moving the board camera. Repeated pins of the same range share one highlight. Highlight color changes update all linked quotes. Deleting a highlight keeps cards, quote text, source and last color. Jump to Source changes chapter and indicates the passage. Changed EPUBs retain unresolved quotes; exact matching chapter text validates anchors when visited, and Relink Source targets an individual card. Go to Last Pinned Card is persistent and does not enable Edit Mode.

## Story Board and Split View

One board per book stores cards, connections and camera inline with the book. Six types: Character, Event, Clue/Theory, Quote, Free Note and Image. Optional raster images can be embedded in any card. View Mode is the default; mobile is View-only. Switch to Edit to create/edit/drag/resize/delete cards, Shift-select and move groups, align tops, distribute horizontally, connect two selected cards and edit a connection label/curve bend. A selected connection exposes a quadratic curve handle. Resize currently uses the lower-right corner only.

The dot-grid canvas supports pan, zoom, search, type filtering, minimap, Fit to Content and Last Pinned. Inspector fields edit selected cards. Undo/Redo is session-only and persisted after successful application. Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Escape and selected-card Delete/Backspace are supported; text fields retain their normal editing shortcuts. Saved is shown only after successful transactions. Board deltas preserve independent pins added while another edit is pending.

Reader / Board / Split View remain mounted when switching, preserving independent scroll/camera. Split defaults to 55/45; drag the 10px gap to resize, with ratio saved in Settings. Mobile hides Split and disables canvas authoring.

## Persistence, migration and recovery

Database: `personal-reading-workspace`, now version 3. Stores: `books`, `libraries`, `fonts`, `settings`. EPUB Files, covers, artwork, reader preferences/position, highlights, board/cards/connections, deleted flags and original legacy fields remain associated with their book records.

Version 1 → 3 migration runs inside the IndexedDB version-change transaction:

1. Validate existing records and retain IDs, metadata, Files, appearance, notes and unknown fields.
2. Distribute existing books into groups of at most 16 Libraries. This is a migration-only exception to manual Library creation.
3. Convert old standalone notes to Free Note Cards with stable legacy-note IDs, exactly once. Original notes remain archived in the record for preservation; future edits happen in cards.
4. Mark the existing archive initialized so no new samples are appended.

If any migration step fails, the entire upgrade aborts; the original database version and its stores remain intact. Other open tabs must close or reload before a blocked upgrade can complete. Successful upgrades do not downgrade: the older main-branch application requests version 1 and cannot open version 3 at the same origin. Review older code using a separate origin/profile; export a backup before switching versions.

Book deletion moves its entire record to Recently Deleted, excluded from Library capacity. Restore uses the original active Library when possible; archived/missing/full destinations require an explicit available destination. Deleted records remain indefinitely. Permanent deletion requires confirmation.

## Backup, restore and Settings

Complete ZIP export recursively includes every store and every Blob/File asset: EPUBs, images, fonts, reader state, highlights, boards, Libraries, settings and Recently Deleted. Restore validates metadata, assets and capacity before writing.

Merge is the default: current data is preserved unless you explicitly choose INCOMING for matching IDs; KEEP preserves current versions, Cancel aborts. Unique incoming records are merged, with 16-book limits enforced. Replace requires explicit confirmation. All stores write in one transaction, including explicit rollback on synchronous cloning errors. Library/settings changes merge field deltas so they do not overwrite newer reading progress.

The old version-1 library-only ZIP format is not a full archive restore format; its EPUBs can still be extracted and imported. Complete backups use `archive.json`, version 2. Prototype restore limits are 250 MB compressed / 500 MB expanded. EPUB imports retain the previous 50 MB compressed/file-count/DRM checks. These limits do not constitute hardened hostile-ZIP protection.

Settings also includes storage usage, imported fonts and local backup reminders (7/14/30 days or Off; default 14). No cloud notifications are sent. Browser storage/quota failures show explicit errors; data is never automatically removed to make room.

## Files

- `dist/app.js`: retained original core, models and EPUB validation, with startup delegated to the A1 controller.
- `dist/model.js`: pure migration, capacity, pin/highlight and board-delta invariants.
- `dist/storage.js`: versioned IndexedDB upgrade and atomic archive writes/patches.
- `dist/archive.js`: Library management, workflows, studio, assets, Settings, trash and backup/restore.
- `dist/reader.js`: sandboxed chapter renderer, stable text anchors, progress and highlights.
- `dist/board.js`: canvas, inspector, camera, edit history and source navigation.
- `dist/index.html`, `styles.css`, `concept.css`: existing shell/styles plus A1 application layout.
- `dist/assets/alice.epub`: complete licensed sample.
- `tests/`: legacy compatibility, concept models, static assets and isolated browser acceptance harness.

## Validation

No build step. Run:

```sh
node tests/library.test.cjs
node tests/concept.test.cjs
node tests/static.test.cjs
```

Also syntax-check the JavaScript files with `node --check`. To run browser acceptance tests, start a SECOND server from the repository root:

```sh
python3 -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001/tests/acceptance.html and click Run tests. The harness uses only the isolated port-8001 archive and uniquely named fixture databases; it never clears or modifies the port-8000 archive. It creates test Libraries/books and handles confirmations only for its isolated synthetic fixtures. The first clean run verifies fresh sample seeding; subsequent runs retain prior fixtures and create another test Library. `VALIDATION.md` records exact acceptance coverage and limitations.

## Remaining work

This is a working A1 concept slice, not a claim that every item in the full brief is finished or exhaustively verified. Remaining details include: resizing from all four corners, fully independent two-axis curve controls, precise pixel crop controls, EPUB2 NCX labels/complex publisher layout, full keyboard alternatives to every drag operation, touchscreen completion for short final chapters, hardened decompression budgets, and automatic restoration of old library-only ZIPs. End-to-end coverage of font/artwork uploads, pointer gestures, manual stacking, relinking after an actual file replacement, merge-conflict UI, all Finished edge cases and every split-divider interaction is still manual.

## Static deployment

Upload `dist/` unchanged to any static host. For GitHub Pages use `upload-pages-artifact` with `path: dist`, followed by `deploy-pages` with `pages: write` and `id-token: write`. Alternatively publish dist contents at a branch root. All scripts, styles and bundled sample paths are relative; the browser tests also exercise the app from `/dist/index.html`, verifying a non-root subpath. Source pushes do not automatically redeploy the separate Sites preview.

## Horizontal stacking compatibility fix

Version 3 preserves explicit stacks and converts older implicit runs of horizontal books to saved groups of two or three once. `stackId` stores membership; `stackOrder` stores bottom-to-top order. Explicit `stackId: null` means intentionally unstacked and is never inferred back into a stack. New books carry this marker from creation. No book ID, appearance, EPUB, notes or Library is changed by the version-2-to-3 stack upgrade.

Drop onto the center of a horizontal spine to stack; drop near its left/right edges to reorder beside it and remove it from its previous stack. The upper/lower half of a center drop chooses above/below the target. Shift remains a stacking shortcut. Pink dashed feedback means stack, yellow means reorder; the shelf caption labels the action. Separate stacks reserve their own full width before the uniform shelf transform.

Run `node tests/stacking.test.cjs`, or serve the repository on port 8001 and open `/tests/stacking.html` for real IndexedDB migration/reopen and production CSS/drop-handler checks in uniquely named fixture databases.

## Automatic horizontal stacks (current product behavior)

Adjacent horizontal books now automatically form groups of two or three, including existing records with null stack membership. Membership and bottom-to-top order are reconciled into IndexedDB on load and after layout changes; no schema reset or sample recreation is used. Existing explicit manual groups remain intact. New books default to automatic mode.

Center-drop to restack. Edge-drop separates a single book and saves `stackMode: separate`, so it stays separate after refresh. Alt-drag on an edge moves an entire stack as a unit. Center-drop turns a group into a saved manual stack. Whole-shelf Scale to Fit still transforms the complete stack artwork uniformly. Earlier instructions saying stacks are never automatic are superseded by this product direction.

## Feedback Round 01 — minimal Library UI

The header now contains Archive of Me, one compact + book menu, and application Settings. Create Book and Import EPUB retain their existing flows inside that menu. The duplicate Library heading, header subtitle, introductory footer section, instructional copy and decorative landing-page dividers are removed; the shelf line remains.

Library names live in minimal tabs. The adjacent + opens an in-app Library dialog, independent of book capacity. Names are freely editable without numeric prefixes. The single far-right ⋯ manages the selected Library (Rename, Shelf Line Color, Archive and Manage Libraries). Library-specific settings are separate from application storage/font/backup Settings. The selected Library is saved in IndexedDB settings and restored after refresh. Empty Libraries show one understated line.

`tests/library-ui.html` on the isolated port-8001 server verifies creation at 0/3/16 books, selection after reload, contextual name/colors, + menu dispatch, preservation of existing designs/membership, automatic stacks and Scale to Fit at 800px iframe width. Native prompt creation was replaced with a form dialog so the flow does not depend on browser prompt availability.

## Feedback Round 01.2 — immersive shelf and shared fonts

The landing surface is consistently #0A0A0A. Historical Library background values remain stored for preservation but have no visual effect and no editor; shelf-line colors and book design controls remain independent. Brand icon/wordmark use a centered flex layout. One far-right Library menu replaces per-tab menus. The shelf consumes available viewport height, with a proportional composition scale capped at 1.8× and constrained by both width and height. Stack interiors use zero gap; separate groups retain their normal spacing.

Hover/focus now displays a fixed cover-led preview with metadata/status/progress. It uses the saved EPUB cover, then a saved `userCover` / `coverImage` / `customCover` Blob, otherwise a metadata cover. Corrupt covers fall back safely. Spine artwork is never substituted as a cover. Position is clamped to the viewport and does not affect shelf geometry. Touch supports a short long-press preview; moving cancels it and a held press does not also open the book.

The shared Font Library feeds both studio and live Reader dropdowns. Imported font bytes are loaded into each script-free chapter iframe's own FontFaceSet, and the user's reading font takes precedence over chapter font-family rules. Spine and Reader selections remain separate. Saved Reader choices restore on reload; complete ZIP backups retain the font assets and preferences. Deleting a used font warns and saves Georgia for Reader and the default spine type as safe fallbacks. Invalid fonts are rejected before persistence.

Run the isolated browser page `/tests/refinement12.html` on port 8001 for current acceptance checks. The unmodified ABeeZee TTF in `tests/fixtures/` is a regression fixture from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/abeezee), accompanied by its full OFL license. It is not automatically installed into personal archives.
