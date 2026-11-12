# A1 validation and acceptance report

## Automated suites

- `node tests/library.test.cjs`: passed. Preserved legacy helpers, EPUB/file association, notes/appearance preservation and legacy ZIP serialization. Its historical pagination helper is not the new Library UI; A1 capacity is covered below.
- `node tests/concept.test.cjs`: passed. Versioned migration, 33-book distribution, exactly-once conversion, malformed-record rejection, capacity blocking, book moves, duplicate pin sharing, color synchronization, keeping quotes after highlight deletion, source preservation on replacement, board edits preserving concurrent pins.
- `node tests/static.test.cjs`: passed. Relative static entrypoint assets exist; bundled EPUB CRC/MIME/container checks pass.
- JavaScript syntax checks and `git diff --check`: passed.

## Isolated browser acceptance harness

Run on port 8001 as documented in README. The production/local user archive on port 8000 is not used by this harness. It uses the real IndexedDB, real ZIP/EPUB parsing, DOM rendering, form submission, text selection, annotation and canvas persistence handlers. Fixture confirmations are handled by the test harness itself. A first fresh run seeded the complete Alice EPUB and connected sample board. Later repeated runs retained the sample and existing fixtures.

| Acceptance test | Result | Evidence and limits |
| --- | --- | --- |
| A — First-time | Passed | Fresh isolated database seeded editable Sample Library, complete Alice EPUB and connected sample cards. |
| B — Design First | Partial | Draft not saved early; color/design saved. Cancel isolation implemented. Font/artwork uploads and drag positioning need manual coverage. |
| C — Quick Import | Passed | Real sample EPUB created exactly one book, preserved original bytes, and allowed title correction. |
| D — Reader | Partial | Real 15-item TOC, actual Chapter I text, saved chapter, reopening and Continue Reading passed. Start Over and all Finished/scroll edge cases need manual checks. |
| E — Pin integration | Passed | Selected actual chapter text, pinned twice, one highlight/two independent cards, stayed in Reader, changed highlight color and verified linked quote colors, Jump to Source reached correct chapter. |
| F — Full Canvas | Partial | Persistent creation, Undo, search, type filtering and saved Fit to Content camera passed. Pointer move/resize, group moves, connections/curve dragging, alignment, minimap clicks and Redo need manual end-to-end coverage. |
| G — View Mode | Partial | Default View disables authoring controls and Last Pinned preserves View. Pointer editing guards inspected in code; full gesture matrix not automated. |
| H — Shelf | Partial | Filled Library through Design First to 16, verified Scale to Fit/no horizontal scroll and disabled creation/import; 17th real import blocked. Manual Shift-drop stacking and cross-tab drag moves need gesture coverage. |
| I — Data protection | Passed | Soft deletion retained record, restore returned it, Library archive/restore preserved books. No user records permanently deleted in tests. |
| J — Backup | Partial | Actual ZIP export decoded/validated, restored into an isolated database retaining EPUB bytes/highlights/board. Invalid metadata and mid-transaction cloning errors preserved previous stores. Library patches retained a newer reading position. Font/image round trips and conflict-choice UI still need manual coverage. |
| K — Migration | Passed | Actual v1 fixture with 17 books upgraded to 2 Libraries; EPUB bytes retained; note converted once; repeated open did not duplicate; corrupt notes aborted upgrade and kept v1. |
| L — Responsive | Partial | At 390px iframe width, canvas authoring disabled and Split View hidden. Full mobile reading, touch pan/zoom and desktop divider gestures need manual review. |

The latest full browser harness run reached DONE with all of its assertions passing. Initial defects found and fixed during validation included cover-page readiness in the test, a queued dialog-close race affecting rapid Design First submissions, correct XHTML parsing for self-closing anchors, explicit abort on synchronous cloning failures, and preventing native focus scrolling inside the transform-driven canvas. No acceptance item is labeled fully passed beyond its stated scope.

## Static and console checks

The app ran at `/dist/index.html` beneath the isolated server root, proving relative asset paths work beneath a subpath. A standalone Reader/Split View inspection loaded the real EPUB, highlights and canvas. Its browser error log was empty at inspection. The sandbox uses no script permission and a restrictive chapter CSP; external chapter resources and executable markup are omitted.

## Manual checklist before treating the entire brief as complete

- Upload valid/invalid PNG/JPG/WebP and all four supported font types; reload and verify artwork, crop/zoom/position, independent text positions and shared fonts.
- Drag reorder, Shift-drop stacks (2/3), move across Library tabs, reject a full destination, and use accessible menu alternatives.
- Drag, resize, Shift-select/move groups, connect two cards, bend/label/delete an edge, align/distribute, Undo/Redo and keyboard shortcuts without stealing text editing.
- Replace an EPUB, retain unresolved quotes, validate a surviving anchor and manually relink just one card; delete a shared highlight and confirm quote retention/color.
- Check final-chapter Finished behavior and explicit Start Over. Short final chapter mobile completion remains incomplete.
- Export/restore actual fonts/images, test KEEP/INCOMING merge conflicts, full destinations, Replace Restore confirmation and quota failures.
- Resize Split View, pin without moving its camera, switch views and open Settings without losing positions.
- Use a fresh origin to recheck first-run behavior. Do not clear an existing personal archive to simulate fresh installation.

## Known implementation limits

The README lists the remaining functional gaps: lower-right resizing rather than all corners; a one-parameter quadratic bend rather than a fully independent control point; CSS crop/position rather than a pixel crop editor; no EPUB2 NCX title parsing; old ZIP metadata restoration not supported; incomplete keyboard alternatives for every drag; no touch completion of a short final chapter; limited decompression defense. These are deliberately reported as unfinished. Exact quote-text validation is used instead of CFIs. Imported publisher styling, scripts, SVG and remote resources are excluded.

Successful migration upgrades this origin to database version 3. Older main-branch code cannot reopen v2 using its v1 request; use an isolated origin/profile for historical code and retain a complete backup.


## Horizontal stacking regression

Compared the pre-A1 renderer's consecutive-horizontal grouping with the A1 `stackId`-only renderer. Added atomic v3 stack metadata migration (without changing stores), persistent bottom-to-top `stackOrder`, center/edge drag intent and above/below insertion. Model tests pass for 2/3 members, order, unstack, capacity rejection, idempotence and unchanged appearance/File/Library. Isolated browser tests use real IndexedDB and production markup/CSS/Scale to Fit for 16 mixed books: migration/reopen ordering, vertical geometry, non-collision and uniform fitting pass. The browser fixture also exercises the actual production drop handler for edge unstack and center restack. Physical mouse/trackpad drag gestures have not been automated in this fix.


## Automatic stacking direction change

Model tests cover adjacent current null-membership books, groups of 2/3, idempotent saved automatic order, explicit separation, and manual restacking. The isolated browser fixture additionally persists automatic membership into actual IndexedDB, reopens it, renders the production shelf, verifies vertical ordering/collision-free Scale to Fit with 16 mixed books, and exercises production edge/center drop handlers. Actual port-8000 browser rendering was inspected: adjacent horizontal spines share a stack, with equal horizontal position and distinct vertical bounds. Cache-versioned model/controller scripts ensure refresh uses the new implementation. Existing designs are not reoriented or recolored to manufacture a sample result.


## Feedback Round 01 validation

Browser harness `tests/library-ui.html` completed DONE with every assertion passing. It exercised the production application in a separate origin: create another Library with 0, 3, and 16 books; immediately select the new tab; reload and retain selection; rename and customize background/shelf colors; dispatch Create Book and the existing Import EPUB picker action through the compact + menu; verify no existing book design or Library membership changed; retain automatic horizontal stacks; and fit a 16-book shelf at an 800px iframe width. Import picker dispatch is tested via a temporary test-only stub; EPUB parsing itself was not changed. No Reader or Story Board code changed. The prior acceptance harness now creates Libraries through the new dialog instead of stubbing native prompts.


## Feedback Round 01.2 acceptance

The isolated `tests/refinement12.html` harness completed DONE. Passed: black body/Library despite a saved colored background; no background picker; preservation of that stored value; exactly one Library settings button; brand center alignment at 1100px and 800px iframe widths; lower visible shelf baseline; zero stack gap; actual saved cover and user-cover precedence, metadata and viewport bounds; keyboard preview; immediate shared font options after a real TTF import; loaded iframe FontFace with different measured glyph widths; chapter font-family override; independent spine preference; Reader font persistence after reload; real ZIP export/decode and isolated restore retaining font bytes and selection; invalid font rejection; and used-font deletion warning plus persisted safe fallbacks.

The previous Library workflow harness also completed DONE after adapting to the unified menu and shelf-line-only color editor: creation at 0/3/16 books, switching/rename, settings separation, persistence, book/design membership preservation, automatic stacks and 16-book fitting at 800px. Model/static suites and syntax checks passed.

Remaining manual checks: physical pointer hover/rapid drag/long-press behavior across browsers, optical alignment on additional screens, OTF/WOFF/WOFF2 files from different font vendors (the end-to-end binary fixture is TTF), missing-glyph fallbacks, font quota failures and prolonged repeated cover previews. Production pointer handlers and real cover image layout were exercised through the browser harness; physical hover and touchscreen gestures have not been automated. Existing unrelated A1 limitations remain listed above. No database reset, new sample seeding or schema migration was used for this refinement.
