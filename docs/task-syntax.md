# Task Syntax

Assistask parses plain English. You don't need to fill out forms — just describe the task the way you'd say it out loud, and the app figures out the rest.

A live preview strip above the input shows the detected priority and due date before you press Enter.

---

## Due Dates

Assistask uses natural language date parsing and understands a wide range of phrases.

### Relative Dates

| Phrase | Resolves to |
|---|---|
| `today` | Today |
| `tomorrow` | Tomorrow |
| `yesterday` | Yesterday |
| `next week` | Start of next week |
| `end of month` | Last day of this month |
| `in 3 days` | Three days from now |
| `in 2 hours` | Two hours from now |

### Day of Week

| Phrase | Example |
|---|---|
| `next [day]` | `next friday` |
| `this [day]` | `this tuesday` |
| `last [day]` | `last monday` |
| Abbreviated | `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun` |

### Times

Append a time to any date phrase:

| Phrase | Example |
|---|---|
| `at [time]` | `tomorrow at 3pm` |
| `by [time]` | `by 9am` |
| 12-hour | `3pm`, `9:30am` |
| 24-hour | `15:00`, `09:30` |
| Named | `noon`, `midnight`, `morning`, `afternoon`, `evening` |

### Combined Expressions

```
next Friday at 3pm
tomorrow noon
in 2 days at 5:30pm
end of month by 9am
```

---

## Priority

### Keyword Phrases

Type any of these anywhere in your task text:

| Keyword | Priority |
|---|---|
| `critical`, `urgent` | **P0** — Critical |
| `high` | **P1** — High |
| *(none detected)* | **P2** — Default |
| `medium` | **P3** — Normal |
| `low` | **P4** — Low |
| *(lowest)* | **P5** — Muted |

### Direct Notation

You can also type the priority level directly:

```
fix login bug P1 tomorrow
```

```
write release notes P3
```

P-level notation (`P0`–`P5`) is matched first, before keyword phrases.

---

## Keep Keywords Setting

By default, Assistask **strips** the detected keywords from the final task text so your task stays clean:

> You type: `call dentist next friday urgent`
> Task saved as: `call dentist`

If you prefer to keep the original text as-is, enable **Keep keywords in task text** in Settings.

---

## Examples

| You type | Priority | Due |
|---|---|---|
| `call dentist next friday. Important!` | P1 | Next Friday |
| `finish the slides by end of month` | P2 | Jun 30 |
| `pay invoice asap!!` | P0 | Today |
| `review PR high tomorrow at 9am` | P1 | Tomorrow 9:00 AM |
| `tidy desk low` | P4 | *(none)* |
| `deploy to prod P0 in 2 hours` | P0 | 2 hours from now |
