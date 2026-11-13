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


## Feedback Round 02 acceptance

All four Node suites passed: library compatibility, concept models, stacking and static assets. JavaScript syntax and `git diff --check` passed. The isolated port-8001 `tests/studio02.html` browser harness reached DONE with all assertions passing. It drives production form controls and actual image Files, EPUB parsing, IndexedDB and ZIP serialization/restore, without touching the personal archive on port 8000.

Passed coverage: all background modes and empty state; grouped artwork controls; loaded artwork retained through Fit/Zoom/X/Y and repeated mode/orientation changes; stable object URL; reset adjustments retaining the file; shared text color; independent cover/art uploads; Save/reload and Cancel isolation; custom cover with/without embedded EPUB cover; explicit EPUB/custom selection and removal fallback; actual EPUB replacement preserving custom cover, artwork and Story Board; transparent cover-only preview with actual 0% and no invented chapter, viewport bounds and 220ms transition; presentation-only Shelf gap versus zero Spines gap; aligned gutters, white Settings and 38px footer controls; ZIP export/decode and isolated restore retaining independent assets and the board.

A separate native browser interaction used the real file chooser to upload a 320×180 PNG, changed Fit using the select control and Zoom using keyboard slider input, and confirmed the loaded image remained visible with the same object URL. Screenshot evidence is saved outside the repo as `round-02-studio.png` in the parent workspace.

The updated font/refinement browser suite also reached DONE: shared TTF import, iframe rendering metrics, independent spine/Reader settings, refresh, ZIP restore and deletion fallbacks. Its obsolete Shelf zero-gap assertion now checks the approved small gap; cover identity is checked through image alt text instead of removed visible metadata. The stack browser suite reached DONE for migration/reopen, automatic grouping, 16-book fitting, collision-free upright/tilted geometry, uniform scaling and production edge/center drop handlers.

Root cause: app.js held direct references to the old preview function in form input/change listeners. Overriding the function alone did not replace those listeners; they ran after the new editor update and removed the artwork presentation. Round 02 replaces the callbacks, keeps a stable session draft with asynchronous upload guards, and uses one image renderer for preview and saved spines. Slider changes reuse the asset URL rather than replacing or revoking it.

No database reset, sample recreation or destructive migration was used. Reader/Story Board JavaScript and storage/model code are unchanged. Remaining manual verification: subjective rapid-hover animation/flicker, touch long-press and physical drag gestures across browsers; diverse JPEG/WebP files and quota failures; additional laptop/desktop optical layouts. Existing A1 limitations above remain outside this refinement.


## Feedback Round 03 and Library addendum

### Automated checks

All four Node suites passed: library compatibility, concept models, automatic/manual stacking and static assets. Syntax checks passed for every changed JavaScript file; `git diff --check` passed. The isolated browser `tests/workspace03.html` harness completed DONE with real production DOM handlers, a full Alice EPUB, real IndexedDB, ZIP export/decode and synthetic fixtures. It never resets the database and uses only port 8001, separate from the personal archive on port 8000.

Passed browser coverage:

- Three horizontal books with lengths 340/230/280 and thicknesses 45/65/55 preserve their individual proportions and typography in both views. Shelf gap returns; Spines has zero gap. A 16-book arrangement fits at 1024, 1280 and 1440px, with Library text/header/shelf alignment checked through rendered text bounds. Stack data and designs remain unchanged through toggling and refresh.
- Long real chapter expands the iframe to complete content height with no inner scrolling; short cover chapter remains fully visible. Centered text width, initial closed drawer/settings, downward/upward toolbar visibility and overlay position/width preservation pass.
- Select → Highlight → Add Note; repeated Pin sharing one highlight; existing highlight color synchronization; editing an existing note; Escape; Select → Add Note → Highlight/Pin. Captured context stays available after saves.
- Reading Settings remains visible deep in a chapter; font-size reflow restores the source passage. Reader/Split/Board transitions and divider resizing retain that passage without advancing progress.
- Split uses remaining viewport height; keyboard divider changes persist per book without auto-fit. Split Pin leaves the camera unchanged. Separate Full camera survives Split fit/return and zoom. Card coordinates and connections remain unchanged.
- New chapters start at the top, visited chapters restore text locations, refresh retains the current source, and unknown legacy fields survive. Jump to Source applies and clears its one-second flash without changing the saved highlight color.
- Start Over clears chapter positions/progress while retaining notes/highlights/cards. Opening the final chapter does not mark Finished; scrolling to its end does. Empty Board shows a message with no tutorial card. ZIP retains separate cameras, ratio and annotations; pre-existing book IDs and Library memberships remain present.

The Round 02 studio regression completed DONE for artwork modes, Fit/Zoom/X/Y, orientation, Save/Cancel, independent cover management, actual EPUB replacement, stack presentation and asset ZIP restore. Its hover assertion now uses actual persisted chapter state, since opening/replacing an EPUB may already have saved its initial chapter. The shared-font/refinement suite completed DONE, including a real TTF loaded inside the sandboxed chapter, different rendered glyph metrics, refresh, ZIP restore and safe deletion fallbacks.

### Direct browser inspection

Used actual browser controls to open Contents and navigate to Chapter I. Physically dragged the Split divider (57% to approximately 51%), then selected a passage with a pointer drag and clicked Highlight → Add Note → Save without reselecting; the toolbar remained open after both actions. Reader, Split and Full Board were visually inspected. The application's error/warning log was empty during this direct interaction check. Screenshots are saved in the parent workspace: `round-03-reader.png`, `round-03-split.png`, `round-03-annotations.png`, and `round-03-board.png`.

### Scope and remaining verification

Location persistence uses validated chapter/text-offset anchors rather than EPUB CFIs; replacing a chapter's text may require source relinking, as before. Existing incomplete A1 features listed above remain outside this round. This round does not validate tablet/mobile touch interactions, every publisher EPUB layout, every font/image timing combination, or prolonged cross-browser gesture sessions. Actual divider dragging and annotation selection were directly tested; additional cross-browser optical and interaction review remains useful. Storage schema stays version 3; additive fields default safely for old books. No personal database reset, sample recreation, force push or main merge was performed.


## Feedback Round 04 acceptance

The initial live port-8000 inspection reported intrinsic sizes (for example 330×100, 330×38 and 280×38 before composition scaling), rather than full-width rows. The equal lengths among some existing books came from their saved 330px dimensions. Round 04 does not change those user values; it makes intrinsic spine/slot sizing explicit in the renderer and versions the updated assets so older list styles cannot supply row dimensions. The previous workspace width restriction was reproduced: the shared 1600px cap and 5vw/72px gutters limited the working surface.

All four Node suites passed, with stacking coverage extended to five-member manual groups, preserved appearance references, idempotent automatic normalization, and rejection of a sixth member. Existing automatic two/three grouping, legacy migration, separation and manual restacking remain covered. Syntax and diff checks passed.

`tests/layout04.html` completed DONE in the browser. It uses real IndexedDB and production rendering with a saved manual stack of five books: lengths 340/200/290/240/315 and thicknesses 32/46/65/80/105. At 1024, 1280, 1440 and 1920px it verifies five distinct widths/heights, unchanged aspect ratios, artwork transforms and typography, zero Spines gaps, restored Shelf gaps and a uniformly fitting 16-book composition. Saved dimensions, artwork asset sizes, order and membership remain identical after view switches and refresh.

At all four widths, Full Board and Split use the client viewport minus 16–24px gutters, with the canvas filling the panel width. Compared with the former grid, the usable width increases by approximately 70–416px depending on viewport size. Header/navigation alignment remains intact. Reader retains its 850px maximum chapter column, complete measured chapter height and outer scrolling. Divider changes persist without moving the Split camera; returning Full Board restores its camera. No horizontal overflow, card-coordinate changes, connection changes or bookshelf-data changes were detected. Minimap, Fit and Reset controls remain present.

These are isolated browser fixtures on port 8001, distinct from the personal archive on port 8000. No personal books, designs or database stores were reset. Additional optical/cross-browser review remains manual; desktop/laptop is the focus, as in Round 03. Existing EPUB text-anchor and other A1 limitations remain unchanged.


The full Round 03 workspace browser regression also completed DONE after these width changes. It exposed cumulative passage drift through repeated Reader/Split/Board reflows: sampling the newly wrapped first visible line each time moved the anchor slightly. Layout transitions, divider changes and font styling now reuse the retained source anchor, while user scrolling still records a fresh location. The rerun passed annotation sequences, source flashes, per-chapter refresh/Start Over, Finished rules, separate cameras, ratio persistence and ZIP preservation.

Direct visual inspection used an isolated saved five-member stack with loaded artwork and a Full Board filling 1248px of a 1280px viewport (16px gutters), compared with the previous 1152px surface. A physical Split divider drag changed its ratio to 58% successfully. The direct browser error/warning log was empty. Evidence screenshots in the parent workspace: `round-04-spines.png`, `round-04-board.png`, `round-04-split.png`. Additional cross-browser and extended gesture testing remain manual.


## Round 04 critical correction: actual physical Spines rendering

Root cause of the previous failed fix: the active A1 controller routed both modes through `shelfMarkup(row)`. Its intrinsic-sizing additions prevented stretching in the measured fixture but did not create the requested all-horizontal presentation. The base renderer also retained an old alternative list-row branch. Prior checks inspected a fixture already made of horizontal books and did not require upright/tilted books to lie horizontally. This was a rendering/acceptance mismatch, not an outdated Git checkout.

The active renderer now branches to `spinesMarkup(row)` with presentation-only groups. Each saved Shelf unit remains intact and ordered inside compact groups of up to five. The natural spine renderer accepts a presentation parameter: standing/tilted spines rotate as complete designs inside horizontal slots, preserving their saved dimensions and all design coordinates. Existing horizontal designs are unchanged. The old `.list` markup hooks, row branch and selectors are removed. Zero gap applies only to physical Spines groups. One composition-scale transform applies uniformly, with centering when space permits.

The isolated `tests/spines-physical.html` browser suite reached DONE. At 1280 and 1440px it measured the actual shelf, composition, stacks, slots and books, including computed width/height, flex, alignment, gap and transform. The five-book fixture has loaded PNG artwork and custom Georgia typography. Both viewport widths used composition scale 1.8:

| Book | Natural size | Rendered rectangle |
| --- | --- | --- |
| Field Notes | 280 × 42 | 504 × 75.6 |
| The Long Journey | 330 × 55 | 594 × 99 |
| Small Worlds | 245 × 38 | 441 × 68.4 |
| Ways of Seeing | 310 × 68 | 558 × 122.4 |
| Collected Things | 270 × 46 | 486 × 82.8 |

Computed group gap is 0px; adjacent slot edges match within 0.1px. No book width equals the shelf width. At 1440px the centered composition rectangle is 594 × 448.2px. Shelf restores small gaps. A separate 16-book fixture includes upright, left-tilted and right-tilted records: every rendered book has width = saved length × composition scale and height = saved thickness × the same scale at 1024/1280/1440/1920px. All groups fit within the shelf. Complete fixture snapshots confirm unchanged orientations, dimensions, custom designs, stack IDs and ordering after view changes and refresh. Keyboard cover preview and saved Shelf manual grouping also pass.

Screenshots of the same five-book Library were captured and visually compared for both modes at both required widths. Evidence in the parent workspace: `physical-shelf-1280.png`, `physical-spines-1280.png`, `physical-shelf-1440.png`, `physical-spines-1440.png`. `physical-stack-measurements.json` contains all recorded rectangles and computed properties. The Spines images show a compact centered stack with different lengths/thicknesses and touching edges, rather than viewport-width rows.

No personal archive reset or orientation/data migration is used. Broader publisher design and cross-browser optical review remain manual; source-anchor and existing A1 limitations are unchanged.


Final regressions: all four Node suites passed; JavaScript syntax and diff checks passed. The full Round 03 workspace suite reached DONE for Reader layout, annotation persistence, chapter positions, Split ratio/cameras, Board coordinates and ZIP fields. The Round 02 studio suite reached DONE for artwork settings, custom covers, Save/Cancel, EPUB replacement and image ZIP restore. Direct inspection of the actual port-8000 personal Library showed all 16 existing books in four horizontal presentation groups, with `class="books"` and `data-view="spines"`; its error/warning log was empty. `physical-live-library.png` records that real Library rendering. Saved personal designs and arrangements were not edited to obtain that result.


## Round 04 final single-column correction

Spines now renders the Library's direct book order into exactly one column, ignoring Shelf grouping for presentation. Every spine shares the same horizontal center. Natural maximum length and summed thickness determine a single proportional composition scale. Shelf markup, automatic/manual membership and saved book designs remain unchanged. The selected view persists in IndexedDB settings.

Browser acceptance passed at 1024/1280/1440/1920px for all 16 books, one stack, centered book/stack bounds, zero adjacent gaps, preserved dimensions/order/data, hover and refresh. Direct screenshot inspection confirmed one column. At the inspected 1280px browser, shelf center was 632.5px and stack center 632.499px; stack bounds were 119.843 × 338.102px at scale 0.36316. A tall stack necessarily scales down as a whole to fit; individual books are not shrunk independently. Screenshot: parent workspace `round-04-final-single.png`. This supersedes the previous grouping into multiple presentation stacks.


## Round 05 shared registry and Map validation

### Model and persistence

`node tests/world.test.cjs` passed: additive empty legacy defaults with no startup mutation; stable IDs and non-merging identical names; ordered rank IDs/multiple memberships; inverse parent/child and master/disciple deduplication; symmetric reverse deduplication; deterministic finite layouts including cyclic fictional genealogy; character deletion retaining Board notes/coordinates; valid old archive loading and rejection of invalid references/IDs. Existing library, concept, stacking and static suites also pass. All changed JavaScript passes syntax checks and `git diff --check`.

There is no destructive IndexedDB upgrade. World data is a versioned optional field on existing book records and defaults lazily. Book updates retain unknown fields, existing assets, Board records and general connections. Registry validation participates in archive validation when world data is present; older ZIPs without it pass. The existing recursive ZIP serializer retains image Blobs and all world/settings references.

### Real browser acceptance

`tests/world.html` reached DONE using production dialogs, selectors, Map/Board rendering, real IndexedDB, a genuine PNG portrait File, ZIP encode/decode and isolated restore. It creates its explicit fictional fixture only on port 8001. Passed:

- Empty Map adds no characters/cards; name-only creation; name/alias/role/source edits; loaded portrait persistence.
- Independent creation of two sects and a family; multiple structured memberships and custom rank assignment/reordering.
- Directed/inverse mentorship and symmetric relationship deduplication; automatic Hierarchy rank order; Family parent/partner/sibling edges; Network characters, organizations, labels and organization/type filters; zoom, Fit and Reset.
- Linking legacy Character Cards to existing registry IDs without duplication; live card names/roles/aliases/organizations; profile rename synchronization; Board-created formal relationship appearing in Map; Map edits/deletion reflected on Board; unchanged narrative connections and independent coordinates.
- Refresh retaining registries, memberships, links and view settings; confirmed character deletion retaining unrelated Board data.
- Full ZIP containing portraits, characters, memberships, formal relationships and links; atomic restore into a separate fixture database; loading an older archive without world fields; retention of original Library/book IDs and unknown book fields.

Direct native browser checks physically panned the Map (the transform moved +50px/+20px), used Quick Add to create an endpoint and return to the relationship form with both references preserved, then saved and rendered a `Travel companions` edge. No error/warning messages were logged in that direct session. Hierarchy, Family and Network were visually inspected; screenshots in the parent workspace are `round-05-hierarchy.png`, `round-05-family.png`, `round-05-network.png`.

### Scope and limits

The two approaches reference the same book.world records by stable ID; they do not maintain separate character databases. Existing narrative connections remain distinct from formal relationships. The prototype has simple automatic layouts and can require filtering/zooming for label density. It has no graph-edit undo history or spoiler timeline; existing Board card Undo remains. Node positions are generated per view, and formal Board edges use the first linked card when a character has multiple card copies. Physical map panning and Quick Add were checked directly; longer cross-browser sessions, large portraits/emblems and touch behavior remain manual. No fictional registry content is inserted into personal books automatically.


Final Round 05 regression runs completed DONE for the full Reader/workspace suite, studio artwork/cover suite, shared-font suite, and the final 16-book single-stack suite at all four widths. The world browser suite was rerun after final UI changes and reached DONE. All five Node suites passed. Board/Map screenshots were refreshed and inspected after the final layout changes; `round-05-board.png` shows linked character profiles, formal dashed edges and the unchanged general narrative connection. The application error/warning log remained empty in the direct inspection session.


## UX refinement: readable stack and expansive canvases

The old Spines calculation always took the minimum of width-fit and height-fit. Sixteen books with a combined natural thickness of 1050px were scaled to 0.361049 to fit one screen, producing a 119.146 × 379.102px composition. The new uniform scale floor favors readability and lets the page grow. In the same real Library, with the same 16 books at the same 1280×720 viewport, the composition measured 412.5 × 1312.5px at scale 1.25 (about 3.46× larger linearly). Before/after screenshots were inspected (the new capture includes the full scrollable section); one centered column, natural proportions and touching edges are preserved. Native page scrolling moved scrollTop from 0 to 720 through the enlarged stack. Evidence: parent workspace `ux-spines-before.png` and `ux-spines-after.png`.

The viewport and virtual content are separate. Compact working-mode chrome and Board authoring popover increase the interaction area. Board/world content retains independent coordinates, including negative and distant positions. Full Board retains its camera on edits/resize; Map no longer auto-fits a new view. Split retains its intentional initial Fit and separate camera. A root width observer handles scrollbar removal after switching from long reading/Spines pages so canvas gutters remain correct. Reader mode's chrome and text column are unchanged.

`tests/ux-space.html` reached DONE. At 1024/1280/1440/1920px it verifies:

- Readable uniform scale, one shared center, zero gaps, full unclipped section bounds, no horizontal overflow, ordinary page scrolling to the bottom spine, unchanged Shelf presentation and saved appearance/arrangement records.
- Board width/gutters and occupation of remaining height, preserved saved camera on resize, keyboard and two-axis wheel panning, a visible minimap viewport, explicit Fit retrieving cards at positive/negative coordinates, Reset, creation in an explored region beyond the initial viewport without camera movement, and Undo preserving original coordinates/connections.
- An 18-character Network, eight-rank hierarchy and multi-generation family at readable 1×; structures extending beyond the viewport; all-width Map occupancy, independent panning, explicit Fit/Reset, and registry edits retaining the camera.
- Wide Split panels with practical minimum widths at all four widths; initial Fit; stable camera through divider/viewport changes; expanded height; restoration of the Full camera; unchanged original card dimensions/connections and registry relationships.

Direct native inspection created a new note through Edit tools, edited it, resized it from 260×200 to 300×230px, panned the Board, and dragged the Split divider while the camera remained translate(40px,40px) scale(1). A Map pan changed translate(30px,30px) to translate(-50px,-30px) at the same 1× zoom. Clicking the minimap retrieved the previously offscreen `far` card fully into view with its unchanged 260×210px dimensions. The direct session's error/warning log was empty. Working viewport screenshots were captured and inspected: `ux-board.png`, `ux-split.png`, `ux-map.png` in the parent workspace.

All five Node suites passed (library, concept, stacking, static, world), plus JavaScript syntax and diff checks. Browser regressions for the full Reader/workspace, shared registry/relationships and studio artwork/cover flows reached DONE. They include annotations, chapter locations, Split ratios/separate cameras, portrait/art assets, ZIP restore and older archives. No personal database reset, sample recreation or persisted book/card-dimension migration was performed.

Remaining manual checks: device-specific trackpad gestures, extended cross-browser use, very large graph label density and optical review at additional heights. Existing saved Map/Board cameras are respected; Reset returns a small saved overview to readable 1×. Deliberate Fit can still yield small objects for extremely large spatial content, while ordinary navigation retains readable zoom. Existing graph-layout/undo/timeline limitations from Round 05 remain.

The shared-font browser regression also reached DONE after the final changes, including actual iframe FontFace rendering, independent spine/Reader preferences, refresh and font ZIP restoration. All working-mode screenshots were visually inspected. The isolated test server is separate from the personal port-8000 preview.


## Round 06 — full-width Spines and application fullscreen (2026-11-13)

Implemented on `codex/a1-full-concept` from `b58e3f7`. No merge into main, database reset, destructive migration, personal-book edits or sample recreation. Test writes use isolated port-8001 origins/fixture archives; the personal port-8000 Library was opened for visual inspection only, with its view selector changed normally.

Changed source files: `dist/app.js`, `dist/archive.js`, `dist/reader.js`, `dist/ui.css`, `dist/index.html`; added `dist/immersive.js` and `dist/immersive.css`. Documentation: `README.md`, `VALIDATION.md`. Added `tests/round06.html` and `tests/round06.js`; updated Spines assertions/cache versions in `tests/workspace03.html`, `tests/workspace03.js`, `tests/studio02.html`, `tests/studio02.js`, `tests/ux-space.html`, `tests/ux-space.js`.

The new rendering branch makes each horizontal spine 100% content width without a collection transform. Rows retain thickness variation, readable text, shared image-fit settings and normal page scrolling. Text positions/rotations reflow for the horizontal row while stored designs remain unchanged. Shelf geometry, natural proportions and stack logic are unchanged. The previous physical-stack width ceiling, reverse-column order and shared viewport-fit calculation no longer apply to Spines. No record dimensions or stack IDs/orders are rewritten by presentation.

The fullscreen controller changes one body class and resizes the existing panels beneath a compact 44px top bar. It keeps the Reader iframe and canvas DOM mounted. Cameras preserve zoom and world-space center across entry/exit/resizing; raw screen translation changes as viewport dimensions change. Source anchors and progress suppression preserve Split passage position. Existing mode-entry Fit remains separate; fullscreen toggles do not call Fit. A generation guard prevents stale layout restoration. Modal dialogs, native selectors, tools, selection actions, drawers and inspectors receive Escape before fullscreen exits; the iframe has its own delegated Escape bridge. Focus returns to Expand, and notification/annotation layers remain above the canvas/below the compact bar where appropriate.

Browser results:

- `tests/round06.html`: **121 PASS, DONE**. Uses production HTML/CSS/JS, real IndexedDB and a 16-book fixture. Browser-rendered iframe viewports at 1024/1280/1440/1920px verify equal full widths, thickness variation, readable/custom typography, unchanged artwork fit/zoom/position, no horizontal overflow, zero gaps and unchanged saved dimensions/membership/order. All three fullscreen modes fill the viewport below 44px and preserve center/zoom through entry, resize and exit. Tests cover mounted Reader identity, unchanged reading progress, source passage, drawer/settings, Highlight → Add Note → Pin, divider persistence, independent Reader scrolling, card create/move/resize, minimap, explicit Fit/Reset, nested Escape, all Map views/inspector/creation, and refresh persistence of designs/cards/registry. Quote source comparison treats missing `unresolved` and explicit `false` as equivalent: the existing Reader resolves sources on refresh.
- Updated `tests/workspace03.html`: DONE. Full-page Reader/comfortable column, toolbar/drawer, highlight/note/pin/color sharing, source navigation, chapter positions, reflow, Split cameras/ratio, progress/Finished, refresh, ZIP and preserved original membership.
- Updated `tests/studio02.html`: DONE. Art fit/modes/zoom/position, independent custom cover, draft Save/Cancel, EPUB replacement, hover, shared alignment, zero Spines gaps and ZIP restore.
- Updated `tests/ux-space.html`: DONE. Full-width page-scrolling Spines, unchanged Shelf/data, far/negative Board coordinates, camera controls/minimap, keyboard/trackpad pan, Undo, large graphs, explicit Fit, Split minimum widths and separate cameras.
- `tests/world.html`: DONE. Shared character/relationship registry, labeled/inverse edges, ranks/families/organizations, linked Board cards, filtering/views, portrait uploads, refresh, ZIP/atomic restore and older archives.
- `tests/refinement12.html`: DONE on fresh isolated `localhost:8001` origin. Actual custom FontFace glyph metrics, independent fonts, refresh, font ZIP restore and safe fallback on font removal. An initial run against the heavily accumulated `127.0.0.1:8001` fixture archive failed its old one-screen shelf-baseline assumption because dozens of test Library tabs wrapped above it; the fresh-origin run passes without resetting any archive.
- `tests/acceptance.html`: DONE on isolated `localhost:8001`. Recently Deleted and restore, Library archive preserving books, valid ZIP restore, invalid/mid-transaction rollback, concurrent reading-position preservation, capacity/import/create flows, annotation/Board authoring and mobile restrictions.
- All five Node suites PASS (`node --test tests/*.test.cjs`); changed JavaScript syntax checks and `git diff --check` pass.

Direct native browser interaction additionally verified Split divider dragging, Board movement and resizing (the near card moved from screen x40/y132 to x300/y247, then resized from 240×180 to 314×241 at zoom 1), creating a Character named Round 06 native test with role Cartographer through the fullscreen form, closing the inspector before fullscreen with Escape, and Escape from inside the EPUB iframe. The direct session's warning/error log was empty. Fixture tests also simulate pointer handlers with the native pointer-capture boundary stubbed; native drag checks above independently validate real input.

Actual personal Library at the browser's 1280×720 viewport: 16 spine widths all **1137px**, displayed heights **76–192.75px**, page scrollHeight **2085px**. Images were saved and visually inspected in the parent workspace:

- `round06-spines.png` — actual personal 16-book Library, viewport capture.
- `round06-spines-full.png` — complete vertically scrollable Library.
- `round06-split.png` — fullscreen Split, live EPUB and Board.
- `round06-board.png` — fullscreen Board after native move/resize, inspector and minimap.
- `round06-map.png` — fullscreen Network with a newly created character's overlay inspector.
- `round06-browser-results.txt` — complete 121-check acceptance output.

Limitations: fullscreen state is deliberately temporary; changing workspace mode uses the normal tabs after Exit. Spines text reflows rather than preserving small-spine absolute positioning/rotation, while saved designs remain intact for Shelf/customization. Very large graph label density, extended browser/device coverage and device-specific pinch/trackpad gestures remain manual. No OS/browser native fullscreen is requested. Historical natural-length physical Spines assertions are intentionally superseded by the new Round 06 direction.


## Round 07 — unified shell, custom Split and relationship interactions (2026-11-13)

Work started at `5e439fc` on `codex/a1-full-concept`. Milestone commits: `a50b2c4` (shared shell and custom Split), `509cab3` (graph interactions/layouts and Board focus), followed by the current validation/persistence polish commit. No main merge or database reset. Production books, EPUB files, fonts, annotations, cards, Library memberships and world records are not recreated by this upgrade.

Changed application files: `dist/archive.js`, `dist/board.js`, `dist/immersive.js`, `dist/immersive.css`, `dist/index.html`, `dist/model.js`, `dist/ui.css`, `dist/world-model.js`, `dist/world.js`, `dist/world.css`. Added `dist/workspace.js` and `dist/workspace.css`. Tests: added `tests/round07.html`, `tests/round07.js`, `tests/round07.test.cjs`; updated `tests/workspace03.html`, `tests/workspace03.js`, `tests/world.html`, `tests/world-browser.js`. Documentation: `README.md`, `VALIDATION.md`.

### Workspace and data implementation

A single shell replaces the previous competing archive/world/immersive tab handlers. It owns visibility, grid slots, shared navigation and viewport sizing. The three workspace instances stay mounted; external Split selectors survive internal renders. All six distinct ordered pairs are supported, and selecting an occupied type swaps automatically. `ArchiveModel.splitWorkspace()` supplies lazy defaults without writing old records. Pair and existing divider ratio are stored per book. Reader retains page scrolling in standalone normal/fullscreen modes, and iframe scrolling in Split. Canvas modes occupy the remaining viewport without page overflow. Fullscreen stays active across all four modes; the compact navigation has normal tab keyboard semantics. Exit/resize restores camera world-space centers and Reader source anchors. Cameras now save optional viewport dimensions to restore the same center after a fullscreen refresh; old camera objects remain compatible. Routes restore Reader/Split/Board/Map as requested. No IndexedDB schema bump or destructive migration.

The Map uses the existing shared character/organization/membership/relationship records, not a new registry. Character creation is name-only and inline. Exact name matches offer selection or explicit separate creation. Both Relationship actions use one endpoint-search form, including live preview and inline missing-character creation. Editing preserves the existing relationship ID and formal Board edges. A membership edge edit with unchanged endpoints retains its membership ID and rank. Category text accompanies node colors. SVG paths have transparent 16px hit areas, accessible endpoint/type labels and keyboard activation. Node selection does not move the camera; deliberate Focus/search or Fit can navigate. Overlay inspectors leave the graph viewport intact.

Network is deterministic spring/repulsion relaxation, not the old rectangular grid. Hierarchy positions rank peers on one level, with side-rail membership routing to avoid lines passing through lower-level nodes; labels reveal on selection/hover while rank headings remain visible. Family positions known parents above children, groups partner/sibling constraints when compatible with known ancestry, and condenses cycles into finite components. It does not create records or infer missing relationships. Network supports free manual positions; Hierarchy/Family retain vertical constraints and permit horizontal adjustments. Per-view positions, filters, view and cameras persist under `world.mapSettings`; generic ZIP encoding includes these plus the new Split fields.

### Board zoom findings

The prior `Board.setView(..., enter=true)` called Fit on every Split entry. This could replace a readable Split camera with a very small overview when a distant/negative card expanded complete content bounds. That automatic Fit was removed; existing saved zooms are preserved. Focus Selected and Reset provide explicit readable navigation, while Fit continues to show complete geometry without moving cards. Zoom details updates after saves as well as camera draws.

The book open in the user's browser during investigation had **0 Board cards and a saved zoom of 51%**, so its current state did not reproduce the earlier 15% observation. The isolated acceptance fixture explicitly stores 15%, includes positive and negative distant cards, and verifies that opening the Board respects it. Its final seven-card content spans **7840 × 5090** world units; at the screenshot viewport, a complete overview requires approximately **11%**, while Focus Selected shows the near card at **125%**. Current/saved zoom both read 125% after the save. No card coordinates, dimensions or connections are changed by these camera operations. The exact historical personal 15% state cannot be reconstructed from the currently open empty Board without inventing or modifying personal data.

### Automated and actual-browser validation

- **Six Node suites PASS:** library, concept, stacking, static, world and the new Round 07 suite. New pure checks cover additive Split defaults/all pairs, deterministic force layout, rank peers including >5 members, three generations/partners/siblings, stable relationship and membership IDs, inverse duplicate prevention, manual positions and independent Board content. JavaScript syntax and diff whitespace checks pass.
- **`tests/round07.html`: 117 PASS, DONE.** Real production rendering and IndexedDB fixtures. It verifies shared fullscreen navigation through all four modes, full-page Reader, mounted component identity, all six custom pairs, swapping and duplicate-type auto-swap, world-center preservation, ratio/pair/route refresh, hidden-Board Pin without camera/panel changes, linked visible Board/Map synchronization without panning, name-only creation and duplicate suggestions, optional edits, both relationship entry points, inline missing-character creation, type/target/notes editing under the same ID, preserved formal Board references and freeform coordinates/connections, 15% camera preservation, explicit Fit/Reset/Focus Selected, circular nodes and selectable curved edges in all views, visible rank levels and three generations/partners, direct-neighbor focus, search and filters, manual-position persistence, unsubmitted inline drafts through fullscreen switching, nested Escape, generic ZIP/isolated restore and old-field defaults. Final refresh from fullscreen verifies world-space center/zoom in the smaller normal viewport.
- **Responsive browser-rendered iframe viewports:** 1024, 1280, 1440 and 1920px, all four modes and custom Split. Canvas panels fill the viewport below the 44px bar; Reader remains page-height; no horizontal page overflow. Resizing uses the real browser layout/events, not mocked rectangles.
- **Updated `tests/workspace03.html`: DONE.** Reader full-page column/toolbar/drawer, annotations/note/pin/color sharing, source/chapter navigation, position/progress/Finished, independent cameras, divider persistence, refresh and ZIP. Its old wording about forced Split Fit was updated to camera restoration without refitting.
- **Updated `tests/world.html`: DONE.** Name-only inline creation replaces old create-modal steps; remaining registry roles/aliases/portrait, organizations/ranks, memberships, inverse/symmetric deduplication, three layouts, linked Board synchronization, direct relationship editing/deletion, refresh and ZIP/old archives pass.
- **`tests/studio02.html`: DONE.** Existing artwork/fit/zoom/position, custom covers, drafts, EPUB replacement, hover/alignment, Shelf/Spines gaps and ZIP restoration pass.
- **`tests/refinement12.html`: DONE.** Actual iframe custom font glyph metrics, independent Reader/spine fonts, refresh, ZIP and safe font fallbacks pass.
- **`tests/acceptance.html`: DONE.** Existing reading/import/create flows, annotations, Board authoring, Recently Deleted/restore, Library archival, capacity, valid/invalid/rollback ZIP restore and mobile restrictions pass.

Direct native input additionally created a character with only a name, created a Disciple relationship from its inspector, changed it to Ally and verified the same fixture ID (`e3bd8f8d…`) remained selected, dragged its circular node by +90/-60 screen pixels at zoom 1 and confirmed the saved position after refresh, and clicked the curved edge using its actual rendered geometry to open the Relationship Inspector. Native selectors changed Split from Reader/Map to Board/Map; screenshots show both pairs and the single shared fullscreen bar. Actual personal data was inspected only to read the current Board zoom/bounds; all authoring tests used isolated port-8001 archives.

### Visual evidence

Actual browser screenshots were saved in `/Users/janjan/Documents/ChatGPT/Archive of me/` and visually inspected:

- `round07-normal-workspace.png` — normal shell, book context/actions, focused Network and inspector.
- `round07-network.png` — fullscreen Network direct-neighbor overview, circular categories and labeled edges (explicit Fit).
- `round07-hierarchy.png` — fullscreen rank peers with clean side-rail membership connections at 1×.
- `round07-family.png` — focused three-generation Family graph; generation headings follow the visible nodes.
- `round07-custom-split.png` — fullscreen Reader/Map pair and both panel selectors.
- `round07-board-map-split.png` — fullscreen Board/Map with independent canvas tools and minimap.
- `round07-reader-fullscreen.png` — full-page Reader with shared navigation and reading toolbar.
- `round07-board-focus.png` — selected card at 125%, Inspector and accurate 11% complete-fit diagnostic.
- `round07-browser-results.txt` — complete 117-check output.

### Remaining prototype limits

The force layout is deterministic static relaxation, not a continuously animated physics simulation; very large/dense graphs still need further performance and label-collision tuning. Hierarchy/Family manual vertical movement is deliberately constrained to retain rank/generation semantics. Contradictory/cyclic fictional family structures are grouped finitely rather than treated as a strict pedigree or assigned invented ancestors. Fullscreen is temporary presentation state after refresh, while mode/pair/ratio, cameras, view, filters and data persist. Device-specific pinch/trackpad behavior, extended cross-browser coverage and very small mobile authoring remain manual checks; the task targets desktop/laptop. Full Fit of truly distant content may still be small by definition; Focus Selected/Reset avoid changing the underlying data. Earlier Round 06 tests expecting no fullscreen Reader and a forced Split Fit are intentionally superseded by the current Round 07 acceptance suite.

## Round 08 — Network, My Trees and shared reorderable navigation (2026-11-13)

Implementation milestone: `45bf8eb` (Add curated My Trees and unified reorderable workspace navigation). Follow-up commit adds legacy-format guards, the camera transition correction and this validation report. Both commits are on `codex/a1-full-concept`; main is not merged.

### Changes and root causes

The missing Network edges had several interacting causes: edge filtering happened before the revealed endpoint was appended; rapidly created nodes could share the exact same saved center; stale focus/type/organization filters could hide newly saved facts; and parallel/opposite connections could occupy the same curve. Network now derives edges from the final visible node IDs, separates coincident rendered positions without overwriting saved positions, avoids quick-create collisions, reveals saved relationships immediately, and gives parallel connections separate curves. Editing preserves IDs and redraws endpoints/labels immediately. SVG edges have contrast, non-scaling strokes and a transparent 16px selection hit area. Explicit filters still apply.

One physical `#workspaceNavigation` tablist moves between normal/fullscreen hosts, with identical compact typography, alignment and yellow underline. Horizontal pointer movement must exceed 6px before reordering starts. A yellow insertion line and subtle dragged-tab feedback precede drop; drag suppresses activation. Every tab, including Reader, can move anywhere. Alt+Shift+Left/Right moves the focused tab without changing the active workspace; ordinary arrow/Home/End switching follows its current order. Focus outlines and a live announcement are provided. The global `workspaceTabOrder` application setting is a strictly validated four-ID permutation, defaulting safely for duplicates/missing/unknown values. Reorder writes settings only, never book records, and complete ZIP backup includes the setting.

My Trees replaces implicit top-level Family/Hierarchy views with unlimited explicitly curated tree records in `book.world.trees`. Family, Hierarchy and Blank templates all start empty and reference shared character IDs. The collection supports create/edit/open/duplicate/delete. Member search, multi-select, inline character creation, scoped removal and separately confirmed global deletion are functional. Global relationships remain shared; adding outside endpoints requires explicit membership consent. Family scopes the graph before generating known generations and places unrelated selected members in an Unconnected Members area. Hierarchy ranks, order and assignments are local structured data, with optional organization linkage and explicit rank import. Blank positions and labeled local connection IDs persist independently from global facts. The shared graph renderer/inspectors/pan/zoom/fit are used in normal, Split and fullscreen modes.

Existing registries, Library membership, EPUB bytes, artwork, annotations, Story Board links/cards/cameras and future fields are retained. Legacy Family/Hierarchy view/filter/camera data is preserved, with no inferred populated tree. Unknown tree formats are retained byte-for-byte as structured data; a visible notice pauses tree mutations where an unambiguous migration is unavailable. Compatible optional tree fields receive read defaults without rewriting stored records. ZIP uses the existing complete archive path; old ZIPs remain importable. No IndexedDB reset, schema bump or sample recreation was performed.

Regression testing found a Board camera transition could attach the new panel's viewport dimensions to the previous camera. `cameraSave(false)` now uses the previous measured workspace size when changing full/Split modes. Reader and Board tests verify raw x/y/zoom plus accurate viewport metadata. The A1 recovery test now creates its own complete EPUB/Board fixture rather than selecting an arbitrary prior test book; it retains all other isolated archive data.

### Files changed

Production: `dist/app.js`, `archive.js`, `board.js`, `immersive.js`, `immersive.css`, `index.html`, `model.js`, `workspace.js`, `world-model.js`, `world.js`, `world.css`; new `dist/navigation.js`, `navigation.css`, `tree-model.js`, `trees.js`, `trees.css`.

Tests/documentation: new `tests/round08.html`, `round08.js`, `round08.test.cjs`; adapted `tests/world.html`, `world.js`, `workspace03.html`, `workspace03.js`, `acceptance.html`, `acceptance.js`; `README.md`, `VALIDATION.md`.

### Automated and actual-browser results

- All seven Node test files pass: concept, library, Round 07, Round 08, stacking, static assets and world. Round 08 additionally covers more than 16 trees, opaque legacy preservation, stable IDs, explicit membership, scoped deletion, ranks, local links and coincident edges.
- `tests/round08.html`: **68 PASS, DONE** in the actual browser on isolated localhost:8001. Covers immediate edge create/edit/delete and filtering, stable relationship IDs, all templates, no inferred members, shared registry renames, safe removals/deletions, ranks, local connection persistence, independent cameras, Split swapping, fullscreen, Reader position, settings-only tab reordering, second-book/refresh persistence, strict invalid-order fallback and ZIP/new/old restore.
- Actual rendering at 1024, 1280, 1440 and 1920px checked for normal/fullscreen tree overflow and navigation usability by the Round 08 browser suite.
- Native physical mouse dragging moved Relationship Map before Split, Reader to last, and Story Board while fullscreen. Each drop changed the order immediately without activating the dragged tab. Exit and refresh retained the same order. Native normal click switched Reader, and Alt+Shift+Left reordered it while retaining the active Reader state.
- Native form creation of Mira → Rowan Parent rendered its line immediately. Clicking that actual line opened the inspector; editing to Ally retained relationship ID `9f4e6c03-5df7-45f3-943e-fa961ca5a6c3` and updated the label immediately.
- Native Blank Tree node drag changed its position from (-210,270) to approximately (-150.69,227.64); refresh retained the exact rendered position. Its local edge opened a clearly identified tree-local connection inspector.
- Actual-browser regression suites all reached DONE: shared World/Registry/Board/old ZIP; Reader/annotation/source/Split/cameras; appearance studio/Spines/ZIP; custom font rendering/ZIP fallback; A1 migration/recovery/capacity/import/ZIP rollback/mobile. A1 recovery contains 45 passing assertions.
- Test fixtures use isolated port 8001; the user's port 8000 archive was not reset or replaced. No real user book was used for destructive fixture scenarios.

Screenshots were saved and visually inspected under `/Users/janjan/Documents/ChatGPT/Archive of me/`:

- `round08-network.png` — actual visible edited Network edges and compact fullscreen navigation.
- `round08-my-trees.png` — minimal collection with three independently named templates.
- `round08-family.png` — selected family generations and separate unconnected member, fullscreen.
- `round08-hierarchy.png` — custom rank levels, peers and scoped membership.
- `round08-blank.png` — native moved node and local connection inspector.
- `round08-split.png` — normal customizable Map/Reader Split with saved tab order.
- `round08-split-fullscreen.png` — same shared navigation and tree in fullscreen Split.
- `round08-browser-results.txt`, `round08-recovery-results.txt` — full browser assertion logs.

### Remaining prototype limitations

Network uses deterministic static relaxation; very large or dense graphs may still need label-collision/performance tuning. Contradictory family relationships form finite groups rather than inventing a definitive genealogy. Hierarchy rank import is explicit, not continuous organization synchronization. Unknown legacy tree formats are preserved but require a later explicit migration before editing those tree collections. Fullscreen presentation itself is temporary across refresh; tree selection, cameras, Split configuration and global tab order persist. Device-specific touch/trackpad and cross-browser coverage remain additional manual work. Existing mobile authoring restrictions, including hidden Split below 700px, remain unchanged.

## Round 09 — unified layout, application appearance and Story Board images (2026-11-13)

Starting branch HEAD: `ae38810` on `codex/a1-full-concept`. Implementation milestone: `c7b15e2`. A separate follow-up commit records the final gutter/theme refinements, safety cases, updated regression expectations and this report. No merge into main and no database reset or sample recreation.

### Layout and shared workspace UI

`layout.css` centralizes `--page-gutter`, `--content-max-width`, `--workspace-gutter`, `--toolbar-control` and `--toolbar-gap`. Global header, Back to Library, title/actions and the one shared draggable tablist use the same global grid. Canvases use a wider symmetric gutter; Reader retains its independent centered 850px EPUB text column. Root `scrollbar-gutter: stable` reserves consistent scrollbar space. Canvas sizing measures the body's usable width, avoiding a second allocation of the reserved scrollbar gutter.

Only `body.library-route` is viewport-locked (`100dvh`, flex layout, scoped overflow). `html` and unscoped `body` do not receive overflow:hidden. Header/footer are fixed flex sections; the Library is the remaining min-height:0 area. Many Library tabs have an internal capped scroll region. Spines retains full-width, natural-thickness, zero-gap rendering and vertical scrolling inside `#books`. Shelf scales its entire arrangement, including stacks, to the available region. Horizontal shadow overflow is clipped inside the shelf. Reader still grows the page; Split Reader scrolls internally. Route changes remove the Library lock.

Board and Map share toolbar/button/search measurements, surface tokens, canvas boundaries, lower-left camera controls, and secondary **More** menus. Existing control nodes/IDs/handlers are moved, not cloned or deleted. `container-type:inline-size` adapts compact controls at panel widths of 650/390px, including divider changes. Inspectors are dismissible absolute overlays, independently scrollable and bounded by their panel; they do not consume canvas width or trigger camera fitting. Board now has an explicit Close inspector action. Fullscreen retains the existing single tablist, global saved order, keyboard reorder, all four workspaces and independent cameras.

### Global appearance and fonts

`AppearanceModel` owns normalization, preset definitions, neutral token derivation, luminance/contrast warnings and reliable font stacks. `appearance.css` maps these semantic tokens to global chrome, dialogs, controls, toolbars, canvases, grids, labels, edges, minimap and inspectors. Black uses #0A0A0A / #F5F5F5 / #F2EF24. White uses #FFFFFF / #171717 / #777777 and neutral UI shades. Warm Paper uses #F0E9DB / #171717 / #171717 with tonal paper surfaces. Custom retains exactly the user's background/text/accent values and remembers them when presets change. Category/avatar colors, artwork and annotation colors remain content colors. EPUB iframe styles remain owned by Reader.

The global setting `applicationAppearance` stores `{theme, custom:{background,text,accent}, font}` through the existing settings store. Two live DOM previews (Library and Workspace) have their own scoped tokens/font and do not apply drafts to the rest of the application. Save/Apply persists; Cancel discards; Reset previews Black/default and confirms before discarding unsaved work. Editable hex fields and color pickers synchronize. Low contrast is warned about, never silently rewritten.

The Interface Font selector offers Application Default, Arial, Helvetica, Georgia, Times New Roman and Courier New plus the existing Shared Font Library. Font import reuses that library, validates actual FontFace decoding, supports TTF/OTF/WOFF/WOFF2 under 15 MB and stores the original font Blob. FontFace is reconstructed after refresh/restore; no transient blob URL is persisted. Missing/failed fonts use the default stack; deleting the selected UI font resets the global selection safely and retains other fonts. Fallback glyph stacks support Vietnamese text when the chosen font lacks glyphs. Fonts do not override book-spine typography, EPUB fonts or explicit card font overrides. Import saves a shared font asset even if the appearance draft is canceled; the UI states this clearly.

### Existing Image Cards extended

`board-images.js` extends the existing `image` card type. Edit tools provides **Add Image** with a real file chooser and multi-file support. Native File drag events are recognized separately from pointer-based card movement/panning; View mode supplies an Edit mode message without changing cards. Dropped files map `(client - canvas origin - camera translation) / zoom` into board coordinates. PNG/JPEG/WebP/GIF decoding, 10 MB limits and 60-megapixel limits give useful errors. Original GIF bytes remain animated browser images rather than flattened bitmaps.

Cards support caption, image preview, Contain/Cover, move/resize, connections, replacement and deletion/Undo. Replacement changes the source asset reference while retaining the card ID, coordinates, dimensions, caption, display mode and connection IDs. Immutable original Blob assets are stored once per board under `board.assets[assetId]`; cards reference `imageAssetId`. Legacy inline `card.image` continues to work. Merge/Undo unions immutable assets to preserve concurrent/shared references; deletion does not garbage-collect assets still needed elsewhere. Session object URLs are regenerated from stored assets and cached by immutable asset ID, never persisted. The existing generic complete ZIP encoder includes all Blob assets, settings and fonts; restore validates image decoding and missing references. No new IndexedDB store/schema is required.

### Changed files

Production additions: `dist/layout.css`, `layout.js`, `canvas-ui.js`, `appearance-model.js`, `appearance.js`, `appearance.css`, `board-images.js`.

Production updates: `dist/index.html`, `archive.js`, `board.js`, `model.js`, `workspace.js`.

Test additions: `tests/round09.html`, `round09.js`, `round09.test.cjs`, `round09-safety.html`, `round09-safety.js`, `desktop-drop.html`, `desktop-drop.js`, `layout-preview.html`, `layout-preview.js`, and generated test-only `tests/fixtures/board-image.png` / `board-image.gif`.

Regression/documentation updates: `tests/round08.html/js`, `workspace03.html/js`, `studio02.html/js`, `README.md`, `VALIDATION.md`. Old tests now measure usable Spines width inside its scrollbar, fullscreen usable body width after deliberate scrollbar reservation, theme-aware Settings text, and actual saved reading progress in the cover tooltip. These changes reflect the new requirements; original geometry/artwork/annotation assertions remain.

### Actual test results

- **8 Node test files pass** (`node --test tests/*.test.cjs`), covering migrations, stable IDs, stacks, Reader/Board merges, trees/relationships, ZIP/assets, appearance normalization/contrast/font fallback and immutable asset merge safety. Static root JS syntax and git whitespace checks pass.
- **139 Round 09 actual-browser assertions — DONE.** Library viewport behavior at 1024/1280/1440/1920px × 560/900px, 16-book full-width Spines internal scrolling and readable typography; shared alignment and Reader scrolling; isolated live previews/Cancel; all presets reaching Board/Network/My Trees; custom retention/contrast; font refresh/missing/invalid handling and rendered Vietnamese text; unchanged EPUB styles/content colors; four image formats/invalid/oversize handling; captions/fit/replacement IDs/connections; transformed file-drop coordinates; refresh, image deletion/Undo; Split 30/50/70 ratios at all four widths without toolbar/page overflow; member presence and non-destructive inspectors; fullscreen switching; exact GIF bytes, image metadata/fonts/settings in ZIP and atomic clean-database restore.
- **11 safety assertions — DONE.** Reset confirmation/cancellation/defaults; selected-font deletion and safe fallback with other fonts retained; two cards sharing one asset survive scoped deletion; View mode drop preserves cards and provides feedback.
- **68 Round 08 browser regression assertions — DONE.** Explicit tree membership and all templates, Network edge creation/editing with stable IDs, scoped deletion, shared registry, ranks/local connections, tab-order drag threshold/keyboard/global persistence, fullscreen, Split, old/new ZIP compatibility and original user data preservation.
- **62 Reader/workspace browser regression assertions — DONE.** Long/short chapter page sizing; actual page and Split scrolling; annotations/notes/repeated Pins; source progress/reflow; full/Split cameras and positions; chapter return, Jump to Source, Start Over, Finished semantics and ZIP.
- **40 artwork/studio browser regression assertions — DONE.** Original renderer/fit/zoom/position/orientations, independent cover/spine assets, drafts/Cancel, EPUB replacement, cover tooltip, stack gaps, alignment and ZIP restore.
- Total: **320 passing browser assertions across five suites**, plus native interactions below. Test apps use isolated localhost:8001. Existing port 8000 user data was not reset, replaced or used for destructive scenarios. Existing test-origin records are preserved additively.

Native in-app browser checks:

1. The real file chooser imported `board-image.png` and rendered the new card.
2. Physical mouse dragging moved card `fc98439f-3c86-4dac-9c02-cd8449196b05` from approximately (680.77,133.08) to (1010.90,244.69). Physical corner resizing changed it from 300×266.15 to 394.32×340.04. Refresh retained these dimensions/position and the 520px original image.
3. Physical Reader-tab dragging placed it before Relationship Map without changing active Story Board.
4. Physical Split divider dragging changed the saved ratio from 70 to 50. Compact tools remained usable; explicit fullscreen Fit framed the complete arrangement.
5. Opening/closing the actual tree inspector preserved the exact rendered transform and canvas width.
6. The Finder-to-native-Chrome drag attempt was blocked: macOS Computer Use permissions were not granted. No native desktop drop success is claimed. A prepared `tests/desktop-drop.html` harness is available for this final OS-level check when permissions are enabled. Browser File-drop event handling and transformed placement were tested in the actual app separately.

### Screenshot evidence

Saved under `/Users/janjan/Documents/ChatGPT/Archive of me/`, captured from the real browser and visually inspected:

- `round09-appearance-preview.png` — interactive White Workspace preview inside the unchanged saved application.
- `round09-white-map.png` — actual light My Trees canvas, neutral chrome and preserved category colors.
- `round09-paper-tree-inspector.png` — Warm Paper genealogy and dismissible overlay.
- `round09-paper-images.png` — Warm Paper Board with uploaded images.
- `round09-black-split.png` — dark normal Split after native divider drag.
- `round09-black-fullscreen.png` — dark fullscreen Split, shared draggable navigation, genealogy and Image Cards after explicit Fit.
- `round09-library-spines-1024x560.png`, `round09-library-shelf-1024x560.png` — actual 1024×560 embedded app viewport with 16 books and internal navigation/shelf overflow. The screenshot crops only the test harness chrome.
- `round09-library-spines-1280x720.png`, `round09-library-shelf-1280x720.png` — additional default-viewport Library captures from the earlier visual pass.
- Logs: `round09-browser-results.txt`, `round09-safety-results.txt`, `round09-round08-regression.txt`, `round09-reader-regression.txt`, `round09-studio-regression.txt`.

### Remaining limitations

Native Finder-to-Chrome drag remains unverified due to denied macOS Computer Use permissions; implementation and browser File-drop coordinates are covered. Very dense graphs still have the earlier prototype label/performance limits. Image assets are retained conservatively for Undo/shared references; orphan-asset garbage collection is not implemented, so repeated replacements can grow backups. Multi-image drops are validated as one batch and images are initially offset for manual arrangement. Font coverage depends on the selected font and installed fallbacks; unavailable glyphs cannot be invented. Cross-browser/device testing beyond the available browser remains future work. Existing mobile authoring restrictions and Round 08 opaque legacy-tree preservation remain unchanged.
