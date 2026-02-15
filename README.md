# Gemini Desktop

An unofficial desktop client for [Google Gemini](https://gemini.google.com), built with Electron.

Google does not provide an official desktop application for Gemini. This project wraps the Gemini web interface in a native desktop window, offering a streamlined experience with system-level integration.

## Features

- **Native Desktop Window** — Runs Gemini as a standalone application, separate from your browser.
- **System Tray** — Closing the window minimizes the app to the system tray instead of quitting. Right-click the tray icon for quick access.
- **Global Shortcut** — Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on macOS) to instantly show or hide the app from anywhere.
- **Persistent Session** — Login state and cached data are preserved across restarts using a dedicated Electron session partition.
- **Auto-Update** — The app checks for new releases on GitHub and updates automatically with in-app progress notifications.
- **Settings Panel** — Configure close behavior, launch at startup, and always-on-top mode.
- **Single Instance** — Only one instance of the app can run at a time. Launching again focuses the existing window.
- **Keyboard Shortcuts** — `Ctrl+R` / `Cmd+R` to reload the Gemini view, plus navigation controls (Back / Forward).
- **Cross-Platform** — Available for Windows (x64, ARM64) and macOS.

## Installation

Download the latest release for your platform from the [Releases](https://github.com/x3r0s/gemini-desktop/releases) page.

| Platform | Architecture | Format |
|----------|-------------|--------|
| Windows | x64 | `.exe` (NSIS installer) |
| Windows | ARM64 | `.exe` (NSIS installer) |
| macOS | Universal | `.dmg` / `.zip` |

The Windows installer allows you to choose a custom installation directory.

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm

### Steps

```bash
git clone https://github.com/x3r0s/gemini-desktop.git
cd gemini-desktop
npm install
```

Run in development mode:

```bash
npm run dev
```

Build distributable packages:

```bash
npm run package
```

Output files will be placed in the `release/` directory.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the app in development mode with hot-reload |
| `npm run build` | Compile the source with electron-vite |
| `npm run preview` | Preview the built app |
| `npm run icons` | Generate platform-specific icons from `src/assets/icon.png` |
| `npm run package` | Full build: generate icons, compile source, and create distributable packages |

## Project Structure

```
gemini-desktop/
├── .github/workflows/     # CI/CD (GitHub Actions release workflow)
├── build/                 # Build resources and generated icons
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App lifecycle, window, tray, IPC, auto-updater
│   │   └── settings.ts    # Persistent settings (JSON in userData)
│   ├── preload/
│   │   └── index.ts       # Context bridge (safe IPC for renderer)
│   └── renderer/          # React UI
│       ├── components/
│       │   ├── TitleBar.tsx      # Custom titlebar with nav controls (Windows)
│       │   ├── Settings.tsx      # Settings modal
│       │   └── UpdateToast.tsx   # Auto-update notification toast
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.html
│       └── index.css
├── electron-builder.yml   # electron-builder packaging config
├── electron.vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Electron](https://www.electronjs.org/) |
| UI | [React](https://react.dev/) 19 |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Bundler | [Vite](https://vite.dev/) via [electron-vite](https://electron-vite.org/) |
| Packaging | [electron-builder](https://www.electron.build/) |
| Auto-Update | [electron-updater](https://www.electron.build/auto-update) |

## Contributing

Contributions are welcome! Whether it's a bug report, feature suggestion, or pull request, your input helps improve the project.

### Reporting Issues

- Use [GitHub Issues](https://github.com/x3r0s/gemini-desktop/issues) to report bugs or request features.
- Include your OS, architecture, and app version when reporting bugs.
- Attach relevant logs or screenshots if possible.

### Submitting Pull Requests

1. **Fork** the repository and create your branch from `main`.
2. **Install dependencies** with `npm install`.
3. **Make your changes** — keep commits focused and descriptive.
4. **Test locally** by running `npm run dev` and verifying your changes work on your platform.
5. **Build** with `npm run package` to confirm the distributable builds without errors.
6. **Open a pull request** against `main` with a clear description of what changed and why.

### Code Style

- TypeScript strict mode is enabled for the entire codebase.
- Use functional React components with hooks.
- Style with Tailwind CSS utility classes — avoid custom CSS unless necessary.
- Follow the existing project structure when adding new files.

### Branch Strategy

- `main` is the primary branch. All development and releases flow from here.
- Feature branches should be short-lived and merged via pull requests.

## Versioning

This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Breaking changes | `MAJOR` | Fundamental architecture changes |
| New features, enhancements | `MINOR` | Adding settings panel, ARM64 support |
| Bug fixes, small tweaks | `PATCH` | Fixing window behavior, icon corrections |

### Release Process

Releases are fully automated through GitHub Actions:

1. Create and push a git tag following the `v*` pattern (e.g., `v1.2.0`).
2. The CI workflow automatically:
   - Syncs `package.json` version with the git tag.
   - Builds the app for Windows (x64, ARM64) and macOS.
   - Publishes the artifacts to a [GitHub Release](https://github.com/x3r0s/gemini-desktop/releases).
3. Existing installations will detect the new version and prompt users to update.

## License

This project is licensed under the [MIT License](LICENSE).
