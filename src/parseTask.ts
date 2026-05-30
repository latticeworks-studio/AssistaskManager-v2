import * as chrono from "chrono-node";
import { Priority } from "./store";

const PRIORITY_PATTERNS: [RegExp, Priority][] = [
  [/\bP0\b/i, "P0"],
  [/\bP1\b/i, "P1"],
  [/\bP2\b/i, "P2"],
  [/\bP3\b/i, "P3"],
  [/\bP4\b/i, "P4"],
  [/\bP5\b/i, "P5"],
  [/\b(critical|urgent)\b/i, "P0"],
  [/\bhigh\b/i, "P1"],
  [/\bmedium\b/i, "P3"],
  [/\blow\b/i, "P4"],
];

// Matches the first actual date/time word in a chrono result text.
// Used to skip context nouns chrono includes before the real date token.
const DATE_START_RE =
  /\b(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?|today|tomorrow|yesterday|now|morning|afternoon|evening|night|noon|midnight|next|last|this|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i;

function trimToDateStart(matchText: string, matchIndex: number) {
  const m = DATE_START_RE.exec(matchText);
  if (!m || m.index === 0) return { text: matchText, index: matchIndex };
  return { text: matchText.slice(m.index), index: matchIndex + m.index };
}

// Remove orphaned trailing connective words left after stripping a date/priority.
const TRAILING_FILLERS = /\s+\b(for|by|at|on|in|to|from|with|a|an|the)\b\s*$/i;
const LEADING_FILLERS  = /^\s*\b(for|by|at|on|in|to|from|with)\b\s+/i;

export interface ParsedTask {
  text: string;
  priority?: Priority;
  dueAt?: number;
  detectedPriority?: string;
  detectedDate?: string;
}

export function parseTask(input: string, keepKeywords = false): ParsedTask {
  let text = input;
  let priority: Priority | undefined;
  let detectedPriority: string | undefined;
  let dueAt: number | undefined;
  let detectedDate: string | undefined;

  for (const [pattern, p] of PRIORITY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      priority = p;
      detectedPriority = match[0];
      if (!keepKeywords) {
        text = text.replace(pattern, "").replace(/\s{2,}/g, " ").trim();
      }
      break;
    }
  }

  const results = chrono.parse(keepKeywords ? input : text, new Date(), { forwardDate: true });
  if (results.length > 0) {
    const result = results[0];
    dueAt = result.date().getTime();
    detectedDate = result.text;

    if (!keepKeywords) {
      const { text: dateText, index: dateIndex } = trimToDateStart(result.text, result.index);
      text = (text.slice(0, dateIndex) + text.slice(dateIndex + dateText.length))
        .replace(TRAILING_FILLERS, "")
        .replace(LEADING_FILLERS, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
  }

  return {
    text: keepKeywords ? input : text,
    priority,
    dueAt,
    detectedPriority,
    detectedDate,
  };
}

export function formatDetectedDate(dueAt: number): string {
  const d = new Date(dueAt);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `today ${time}`;
  if (isTomorrow) return `tomorrow ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}
