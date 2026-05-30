# Assistask

Minimalist meeting task capture. VSCode dark aesthetic. System tray, global shortcut, overdue notifications.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (stable toolchain)
- Tauri v2 system dependencies: https://v2.tauri.app/start/prerequisites/

## Setup

```bash
npm install
```

## Dev

```bash
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Usage

| Action | How |
|---|---|
| Add task | Type in bottom bar → Enter |
| Complete task | Click checkbox |
| Delete task | Hover row → click ✕ |
| Set due time / priority | Click clock icon in input bar |
| Clear completed | Click "clear done" in header |
| Show / hide window | `Ctrl+Shift+A` or left-click tray icon |
| Quit | Right-click tray → Quit |

## Notes

- Tasks persist in `localStorage` (via Zustand persist).
- Overdue tasks are checked every 30 seconds. A system notification fires once per overdue task.
- The window stays on top (`alwaysOnTop: true`) and hides to tray on close — it never quits unless you use the tray menu.
