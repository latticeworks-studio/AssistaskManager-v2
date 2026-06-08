# Settings

Open Settings from the **☰** menu.

---

## Display

### Title Color

Sets the color of the pixel-art **ASSISTASK** title. Enter a hex value or use the color picker. Default is `#52D7C6`.

### Keep Keywords in Task Text

When **off** (default): priority and date keywords are stripped from the final task title, leaving just the task description.

> Input: `fix login bug urgent tomorrow`
> Saved as: `fix login bug`

When **on**: the full input text is preserved exactly as typed.

---

## Timezones

### Show Timezones

Toggle the multi-clock display in the header on or off.

### Timezone 1 & Timezone 2

Each slot has two fields:

- **Label** — a short name shown in the header (up to 5 characters, e.g. `NYC`, `LON`, `AEST`)
- **Timezone** — select from the full IANA timezone list (e.g. `America/New_York`, `Europe/London`, `Australia/Sydney`)

Your local system timezone is always shown automatically and cannot be removed.

---

## Notifications

### Enable Notifications

Turns system-level task due notifications on or off.

### Repeat Interval

How often to re-notify if an overdue task remains incomplete. Set in hours (1–24). Set to `1` for hourly reminders, or `24` to be notified once per day.

---

## Startup

### Launch at Startup

When enabled, Assistask starts automatically with Windows and minimizes to the tray. Uses the Tauri autostart plugin.

---

## Data

### Export Data

Downloads a timestamped JSON file of all your tasks (including completed ones). Useful as a backup before clearing.

### Clear Completed

Permanently removes all completed tasks. Active tasks are not affected.

### Clear All

Permanently removes all tasks — active and completed. This cannot be undone. Export your data first if you need a record.
