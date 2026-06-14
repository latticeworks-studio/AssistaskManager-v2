# Assistask

A lightweight floating task manager built for people who live in meetings. Capture tasks without breaking your flow — just hit `Ctrl+Shift+A`, type, and go. Assistask parses natural language so you never have to touch a date picker.

Built with Tauri + React + TypeScript. VS Code dark aesthetic. Always on top, always out of the way.

---

## Features

**Natural language input**
Type tasks the way you think. `Fix login bug P1 tomorrow 3pm` creates a P1 task titled "Fix login bug" due tomorrow at 3:00 PM. Priority keywords (`urgent`, `high`, `P0`–`P5`) and dates (`next Monday`, `in 2 hours`, `Friday at 5`) are detected and stripped automatically.

**CRITICAL / TASKS split**
P0 and P1 tasks surface in a dedicated Critical section sorted by due date. Everything else lives below in Tasks. High-priority items are never buried.

**Morning Standup view**
One tap shows what's overdue, due today, and what you completed yesterday — formatted and ready to copy into Slack or Teams with a single button.

**Slash commands**
| Command | Effect |
|---|---|
| `/search <text>` | Filter tasks live as you type |
| `/alldone` | Mark everything done |
| `/clearall` | Send all tasks to Completed |
| `/clear critical` | Clear the Critical section |
| `/deleteall` | Permanently remove all tasks |
| `/shiny` | Toggle rainbow wave on the title |
| `/vu` | Toggle VU meter — ASSISTASK reacts to your system audio |

**Overdue notifications**
System notifications fire when a task hits its due time, with a configurable repeat interval for tasks that stay overdue.

**All Completed view**
"Clear done" hides tasks from the main view without deleting them. Browse, search, and permanently clear from the dedicated Completed view.

**My Lists**
Save your active task list as a named snapshot at any time. Browse all saved snapshots from the My Lists view and restore any of them with Replace (swap out your current tasks) or Append (merge in without losing what's there). Snapshots persist across restarts and reboots. For quick transfers between devices, copy the list code directly from Settings and paste it on the other machine.

**Global shortcut**
`Ctrl+Shift+A` shows or hides the window from anywhere. Left-click the tray icon does the same. The window hides to tray on close — it never quits unless you tell it to.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Enter` | Add task |
| `↑` / `↓` | Cycle through input history |
| `Escape` | Clear input |
| `Tab` | Fill selected slash command |
| `Ctrl+Shift+A` | Show / hide window |

---

## Settings

- **Title color** — color picker + hex input for the pixel art header
- **Timezones** — display up to 2 additional time zones alongside local time
- **Keep keywords** — optionally preserve priority/date tokens in the task text
- **Notifications** — enable/disable + repeat interval for overdue tasks
- **Launch at startup** — auto-start with Windows
- **Export** — download all tasks as JSON
- **List code** — copy active tasks as a portable string or save as a named snapshot; restore via My Lists with Replace or Append

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (stable toolchain)
- Tauri v2 system dependencies: https://v2.tauri.app/start/prerequisites/

## Dev

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Installer output: `src-tauri/target/release/bundle/nsis/`
