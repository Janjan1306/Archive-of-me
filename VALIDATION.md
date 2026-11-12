# Current validation: book creation and workspace navigation

## Passed automated checks

Run `node --check dist/app.js` and `node tests/library.test.cjs`.

- Fixed shelf boundaries for 0, 3, 16, 17, 32 and 33 books; 17th book belongs to Shelf 02.
- Legacy appearance fallback without mutating records; landscape proportions, tilted bounding boxes, stacks and escaped text.
- Empty book creation without a file, unique stable IDs and initialized isolated workspace notes.
- Note create/edit/delete preserves IDs, unrelated fields and prior record state.
- Attachment/replacement keeps the original book ID, chosen title/author, appearance, notes, reading progress and unknown workspace fields; stores EPUB metadata separately.
- The actual existing backup handler runs with real JSZip. Its ZIP contains notes, appearance and the same book ID in library.json, and the EPUB bytes as a separate file.
- `git diff --check` passes.

## Passed browser checks in the local preview

- Existing three demo records remained present at 127.0.0.1:8000; no IndexedDB version/store changes or reseeding.
- Separate Create New Book and Import EPUB actions are visible.
- Created “Workspace test — Sổ tay” without EPUB. Count increased from 3 to 4 and the new spine appeared immediately.
- Selected the spine and entered its workspace directly. Reader showed the honest no-EPUB state.
- Saved a Vietnamese text note, refreshed and confirmed the same workspace/tab and note returned.
- Customize Book opened the existing live appearance editor from the workspace.
- Attached the real tests/sample.epub using the file chooser. Workspace URL retained the same book ID and chosen title; action changed to Replace EPUB. Library count stayed 4, and the existing note remained present afterward.
- Alice’s workspace had 0 notes, confirming isolation from the newly created book.
- All three existing demo books opened their individual workspaces with clearly labeled sample excerpts.
- Direct Import EPUB created a separate “Thành phố trong sách” workspace with an attached file and honest deferred-reader state.
- Back to Library navigation worked between these flows.

## Remaining manual checks / limits

Appearance preservation and replacement data merges are covered by model tests; a complete confirmed-replacement browser cycle and every editor control have not been re-tested end to end in this iteration. Note edit/delete are model-tested; browser creation/persistence were exercised. The file chooser automation sometimes needed an explicit Escape to leave the editor before proceeding. Invalid-file/quota failures and browser backup downloads should still be rechecked manually. The real ZIP backup serialization is covered by the Node regression test.

The 17-book boundary is tested at the model level, not by creating 17 books through browser automation. No full EPUB reader or visual board canvas is claimed. Original EPUB parsing, DRM checks, database version and store remain unchanged. Test books/notes created during browser validation are local fixtures, not seeded application content and not committed to GitHub.

## Suggested manual acceptance flow

1. Create a book with a chosen title/author and no file. Open its spine and verify the empty Reader state.
2. Customize its appearance and save. Add a note in Story Board, edit it, reload, and confirm its content.
3. Attach sample.epub. Check ID, title, author, appearance, count and notes. Export backup and inspect those fields and the original file.
4. Cancel Replace EPUB; confirm no change. Replace with a valid file; verify data preservation. Try invalid.epub and verify no file replacement or duplicate record.
5. Open each demo’s excerpt and notes. Confirm no cross-book note leakage. Delete a test note only after its confirmation.
6. Return to the library, switch views, test keyboard tab navigation and narrow-screen scrolling. Create enough books for Shelf 02 and verify membership stays fixed across resizing.
7. Test denied storage/quota failures in a separate browser profile; no successful-save message or phantom record should appear.
