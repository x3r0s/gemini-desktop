# v1.1.0

Release date: 2026-02-15

## Highlights

- In-app update UX added:
  - Update download progress toast
  - Update-ready toast with one-click restart/install action
  - Auto-dismissed error toast for update failures
- Auto update flow improved in main process:
  - Explicit status events (`downloading`, `ready`, `error`) are sent to renderer
  - Periodic update checks every 30 minutes
  - Duplicate update-check guarding added
- Desktop app quality improvements since `v1.0.3`:
  - ARM64 Windows build target support
  - `Ctrl+R` reload shortcut support
  - Single-instance lock and settings panel behavior improvements
  - Startup and always-on-top settings enhancements

## Commits included (v1.0.3..v1.1.0)

- `6411ec3` feat: add in-app update status toast and install action
- `d938c7b` feat: add ARM64 Windows build target
- `3d9115b` feat: add Ctrl+R reload shortcut, fix settings modal covering titlebar
- `4e26dc1` feat: single instance lock and settings panel with blurred backdrop
- `42c9aef` feat: add settings panel with close behavior, startup, and always-on-top options

## Full Changelog

https://github.com/x3r0s/gemini-desktop/compare/v1.0.3...v1.1.0
