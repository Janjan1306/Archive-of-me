# Validation performed

- JavaScript parsed successfully with Node vm.Script.
- Static preview served and rendered in the in-app browser.
- First-visit demo library and placeholders visible.
- Sample detail dialog displayed its readable excerpt and editable metadata.
- Vietnamese title edit survived page reload; library count remained 3.
- At narrow width, multiple shelves were generated and next-shelf control was enabled. At wider width, all three sample books fit together.
- Real EPUB fixture and invalid file are provided in tests/ for repeatable manual import checks.

## Verification limits

The browser automation's file-chooser event timed out, so real-file import and backup download have not been end-to-end verified in this session. The application contains real ZIP/XML import logic and transaction-backed storage; these are not mocked. Cover extraction, DRM rejection, storage quota errors, delete confirmation, trackpad input, and exhaustive narrow-width cases still need the manual checks in README.md. Reader/annotation/board scenarios are deferred by design to the later phases.


# Main Library redesign validation

## Passed automated checks

`node --check dist/app.js` and `node tests/library.test.cjs` pass. Tests cover empty/3/16/17/32/33-book collections, the 17th book on Shelf 02, legacy fallbacks without mutation, invalid appearance fallbacks, horizontal dimensions, rotated bounding-box space, intentional stacks, escaped labels, and hero removal.

## Browser checks performed

- Existing local IndexedDB still contained the same three demos, including a previously edited Vietnamese title. No database migration or reset occurred.
- Hero absent; library is immediately beneath the header. The shelf scroll container remains within the narrow preview window.
- Opened existing demo details and the new appearance editor.
- Set horizontal orientation, saved, refreshed, reopened and confirmed Horizontal remained selected.
- Previewed a tilted orientation, canceled, reopened and confirmed the saved Horizontal remained selected.
- Imported tests/sample.epub through the real file chooser; extracted Vietnamese title and author, and opened its detail dialog with new appearance controls.
- Edited that imported title, saved, reloaded and confirmed the imported book and edited title remained.

## Remaining manual verification / limitations

Repeated file-chooser automation was unreliable, so a full 17-import browser run was not completed. Shelf membership at that boundary is verified by the regression test, not an end-to-end run of 17 uploads. Exhaustive drag/trackpad gestures, all appearance sliders, reset/save combinations, Spines view round trips, backup download contents and quota-failure paths should still be checked manually. The EPUB parser, DRM checks, backup handler and database version/store were kept unchanged; metadata export includes the added appearance object through its existing object-rest serialization. This is code-level preservation, not a claim of new end-to-end testing for those paths.

For a manual full regression: import until 17 books exist; ensure 16 stay on Shelf 01, the 17th is on Shelf 02; resize the window and switch views; edit a tilted/horizontal book, cancel once and save once; reload; export ZIP and inspect library.json for appearance and original EPUBs. Check labels/tooltips and keyboard focus for every book, and verify scrolling within a shelf never changes its membership. Stacks retain individual click targets. Large mixed-size collections deliberately scroll rather than fit 16 books into unreadably narrow spines.
