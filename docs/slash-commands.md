# Slash Commands

Type `/` in the task input to open the command palette. Use `↑` / `↓` to browse, `Tab` to autocomplete, and `Enter` to run.

---

## Command Reference

### Search & Filter

| Command | What it does |
|---|---|
| `/search <text>` | Live-filters the task list to tasks containing `<text>`. Clear the input to exit search. |

### Bulk Actions

| Command | What it does |
|---|---|
| `/alldone` | Marks every visible task as complete |
| `/clearall` | Moves all tasks to the Completed view (hides from main list) |
| `/clear critical` | Hides P0 and P1 tasks only |
| `/deleteall` | **Permanently deletes all tasks.** This cannot be undone. |

### Extras

| Command | What it does |
|---|---|
| `/shiny` | Toggles a rainbow wave animation on the ASSISTASK title |
| `/vu` | Toggles the VU meter — pixels in the title react to system audio via WASAPI |

---

## Tips

- Commands are **case-insensitive** — `/Search`, `/SEARCH`, and `/search` all work.
- The palette filters as you type — you don't need to remember exact names.
- `Escape` clears the input and dismisses the palette without running anything.
