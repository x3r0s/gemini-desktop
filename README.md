# Gemini Desktop

An unofficial desktop client for [Google Gemini](https://gemini.google.com), built with Electron.

Google does not provide an official desktop application for Gemini. This project wraps the Gemini web interface in a native desktop window, offering a streamlined experience with system-level integration.

## Features

- **Native Desktop Window** — Runs Gemini as a standalone application, separate from your browser.
- **System Tray** — Closing the window minimizes the app to the system tray instead of quitting. Right-click the tray icon for quick access.
- **Global Shortcut** — Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on macOS) to instantly show or hide the app from anywhere.
- **Persistent Session** — Login state and cached data are preserved across restarts.
- **Auto-Update** — The app checks for new releases on GitHub and updates automatically.
- **Cross-Platform** — Available for Windows and macOS.

## Installation

Download the latest release for your platform from the [Releases](https://github.com/x3r0s/gemini-desktop/releases) page.

| Platform | Format |
|----------|--------|
| Windows  | `.exe` (NSIS installer) |
| macOS    | `.dmg` / `.zip` |

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

## Tech Stack

- Electron
- React
- TypeScript
- Tailwind CSS
- Vite (via electron-vite)
- electron-builder
- electron-updater

## License

This project is licensed under the [MIT License](LICENSE).
