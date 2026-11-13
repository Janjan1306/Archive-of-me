# Round 11 — Six-book Sample Library

Implemented on `codex/a1-full-concept`; not merged into `main`.

## Sources and data safety

The supplied folder was found at `/Users/janjan/Downloads/archive-of-me-sample-content-v2/` (there was no pre-existing `sample-content/` directory in the checkout). Its JSON and supporting markdown are now stored under `sample-content/`. The compiler `scripts/prepare-sample-plan.py` generates `dist/sample-plan.js`; it does not read or bundle EPUBs. Expanded `sample_characters`, `sample_relationships`, `sample_cards` and `sample_trees` take precedence over the older short plans. No temporary fallback editorial content remains.

All six provided EPUB sizes and SHA-256 hashes match the supplied JSON. The browser importer checks those hashes again before importing. All supplied card and relationship chapter references, including the Tru Tiên HTML fragments, were found in the actual reading spines; all supplied search cues were found. Chapter references remain editorial metadata, not Quote source anchors.

Installation uses one additive IndexedDB transaction in the existing four stores and schema version 3. It writes only new books, the new Library, new required font records, and an installation marker. It does not clear stores or overwrite colliding IDs. Concurrent installs serialize and commit once. The marker survives edits/deletions, so another install cannot recreate deleted sample content. Existing Libraries with the same display name remain separate and unchanged.

The connected preview on port 8000 now has the six-book Sample Library alongside the existing three Libraries and sixteen books. Before installation a complete private backup was downloaded to `~/Downloads/archive-of-me-backup (1).zip`. Complete before/after ZIPs were compared with every embedded asset canonicalized to its SHA-256: all 16 original books, 3 original Libraries, and unrelated settings were unchanged. The final private six-book package is `~/Downloads/archive-of-me-library-seed (1).zip`. No supplied EPUB or private seed ZIP was added to Git or to the deployment directory. The previously bundled Alice edition remains the application's existing asset.

## Imported content

| Book, order | Characters | Registry relationships | Editorial cards | Linked Character Cards | Board connections | Trees |
|---|---:|---:|---:|---:|---:|---|
| 01 Alice’s Adventures in Wonderland | 7 | 6 | 3 | 7 | 0 | — |
| 02 Pride and Prejudice | 7 | 11 | 2 | 7 | 0 | Bennet Family: 7 explicit members |
| 03 Dracula | 4 | 3 | 6 | 4 | 5 | — |
| 04 Tru Tiên | 5 | 3 | 5 | 5 | 3 | Thanh Vân Môn: 5; Đại Trúc Phong: 4 |
| 05 Thiên Quan Tứ Phúc | 6 | 3 | 6 + 2 reading prompts | 6 | 3 | — |
| 06 Guilt | 5 | 3 | 7 | 5 | 6 | — |

Alice and Pride have no supplied Board connections; none were invented. Their relationships are visible on linked Character Cards and in the Map. Tru Tiên ranks reference the same selected character IDs across both trees; the diagrams remain explicitly described as simplified demonstrations.

Colors come from the JSON, with default serif spines and numbering 01–06. The last two books are horizontal and use normal automatic stacking. EPUB covers are retained and editable. No final artwork was generated.

One short Tạ Liên paragraph was resolved from the supplied search cue against the same sanitized DOM used by Reader. Its exact chapter/text offsets were verified in the browser, including clicking **Jump to Source** and observing the marked passage. The other two proposed highlights (chapters C2/C4) remain informative Free Notes requesting Reader selection. The moodboard placeholder becomes an informative note; no empty image asset or fake highlight record is created. All other editorial cards remain unanchored summaries. The shared `epub-document.js` parser prevents importer/Reader offset drift.

## Customize and export

1. Open `http://127.0.0.1:8000/` in the connected preview and select **Sample Library**.
2. Use **Customize Book** for cover, spine artwork, colors and shared fonts. Use Story Board and Relationship Map normally to edit cards, images, characters, relationships and trees. Select text in Reader to create additional genuine highlights/Quotes.
3. Open **Settings → Sample Library**, select the Library, then **Export Library seed**.
4. On another browser/device, open **Settings → Sample Library → Add Sample Library** and choose that ZIP.

The seed contains only the selected Library, its book payloads (including EPUBs, covers, spine images, annotations, Registry, trees, Board assets and workspace configuration) and referenced shared fonts. It carries no global settings and does not change the destination's application appearance or workspace tab order. Imported fonts receive fresh IDs and only incoming font references are rewritten. It uses the existing version-2 ZIP asset encoding, extended with `kind: library-seed` and a versioned seed identity. Complete ZIP backups remain supported.

IndexedDB belongs to each browser and origin: opening Chrome does not automatically copy the connected preview's data. Import the private exported seed there. Local paths are not stored as asset dependencies.

## Validation

- Nine Node regression files pass. Round 11 reports 58 browser checks, Round 09 reports 139, and Round 10 reports 183 (380 browser checks total).
- Round 11 real-browser acceptance covers all six Readers, exact order, actual Network/Family/Hierarchy DOM rendering, shared registry references, Dracula Split, exact Quote source, image refresh, complete binary ZIP round trips, required fonts/artwork, collision rollback, concurrent install, and idempotence after edits/deletions.
- Round 09 and Round 10 browser regressions pass, including 1024/1280/1440/1920 layouts, short laptop heights, custom fonts/colors/images, GIF bytes, Split and fullscreen. The Round 09 harness now creates its own navigation overflow fixtures instead of depending on earlier test runs.
- The actual port-8000 UI imported six EPUBs using the native file chooser, created/edited reading notes, opened the Network and both tree views, and jumped from the Quote Card to the exact highlighted passage.
- A private per-Library ZIP was exported through the UI and installed through **Add Sample Library** on a fresh browser origin. The restored Dracula EPUB opened correctly; the destination's existing starter Library remained intact.
- Screenshots and detailed browser output are saved outside Git in the sibling `round11-review/` directory.

## Limits

- Keep supplied editions and exported packages private until redistribution rights are confirmed. No public six-book package is shipped; installation requires the user's original EPUBs or an authorized private seed.
- A seed is an additive installation, not a synchronization/update mechanism. A later package with the same identity intentionally preserves existing local edits instead of replacing them. Conflicting IDs from an unrelated archive are rejected; arbitrary remapping/merging of book histories is not attempted.
- Other proposed highlights need Reader selection. No default moodboard image is supplied. Reader remains the normal entry workspace; demonstrating the preferred Split/Map/Board view is a user action, without changing existing navigation behavior.
- Existing prototype ZIP import limits remain 250 MB compressed / 500 MB decoded. Fonts needed by the selected content are included; global UI preferences belong in the complete backup.

## Changed files and commits

- `dist/sample-library.js`, `dist/sample-plan.js`, `scripts/prepare-sample-plan.py`, and `sample-content/*`: normalize the editorial plan, import verified private EPUBs, install/export Library seeds, and expose Settings controls.
- `dist/storage.js`: additive atomic seed installation and durable installation marker.
- `dist/archive.js`: reusable ZIP encoding and manifest-aware decoding; complete backup reads the latest database.
- `dist/epub-document.js`, `dist/reader.js`: shared chapter text parsing.
- `dist/index.html`, `.gitignore`: load the modules and exclude private editions/packages.
- `tests/round11-browser.html`, `tests/round09.{html,js}`: acceptance coverage and self-contained regression fixtures.
- `README.md`, `ROUND11.md`: usage, results and limitations.

Implementation commit: `07a59bd`. The following validation commit includes the final reading-prompt handling, browser tests and documentation; obtain its hash with `git log -1 --oneline`.
