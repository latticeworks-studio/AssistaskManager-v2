import { useState } from "react";
import { useTaskStore, Task } from "../store";

function formatDue(dueAt: number): string {
  return new Date(dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const DOT: Record<string, string> = {
  P0: "bg-vscode-red", P1: "bg-vscode-orange", P2: "bg-vscode-yellow",
  P3: "bg-vscode-blue", P4: "bg-vscode-green", P5: "bg-vscode-muted",
};

function TaskRow({ t }: { t: Task }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 border-b border-vscode-border">
      <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[t.priority]}`} />
      <span className={`flex-1 text-sm leading-relaxed ${t.done ? "line-through text-vscode-muted" : "text-vscode-text"}`}>
        {t.text}
      </span>
      {t.dueAt && (
        <span className="text-xs text-vscode-muted flex-shrink-0 mt-[2px]">{formatDue(t.dueAt)}</span>
      )}
    </div>
  );
}

function Section({ title, items, accent }: { title: string; items: Task[]; accent: string }) {
  if (!items.length) return null;
  return (
    <div className="mb-1">
      <div className={`px-3 py-1 text-xs font-medium tracking-wide uppercase ${accent} border-b border-vscode-border`}>
        {title}
      </div>
      {items.map((t) => <TaskRow key={t.id} t={t} />)}
    </div>
  );
}

function buildClipboardText(
  overdue: Task[], dueToday: Task[], highPriority: Task[], doneYesterday: Task[]
): string {
  const lines: string[] = [];
  const fmt = (t: Task) => `  - ${t.text}${t.dueAt ? ` (${formatDue(t.dueAt)})` : ""}`;

  if (doneYesterday.length) {
    lines.push("✅ Done yesterday");
    doneYesterday.forEach((t) => lines.push(fmt(t)));
  }
  if (overdue.length) {
    if (lines.length) lines.push("");
    lines.push("⏰ Overdue");
    overdue.forEach((t) => lines.push(fmt(t)));
  }
  if (dueToday.length) {
    if (lines.length) lines.push("");
    lines.push("📅 Due today");
    dueToday.forEach((t) => lines.push(fmt(t)));
  }
  if (highPriority.length) {
    if (lines.length) lines.push("");
    lines.push("🔥 High priority");
    highPriority.forEach((t) => lines.push(fmt(t)));
  }
  return lines.join("\n");
}

export default function StandupView() {
  const { tasks } = useTaskStore();
  const [copied, setCopied] = useState(false);

  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const overdue = tasks.filter(
    (t) => !t.done && t.dueAt !== undefined && t.dueAt < now
  );
  const dueToday = tasks.filter(
    (t) => !t.done && t.dueAt !== undefined &&
      t.dueAt >= todayStart.getTime() && t.dueAt <= todayEnd.getTime()
  );
  const highPriority = tasks.filter(
    (t) => !t.done && (t.priority === "P0" || t.priority === "P1") &&
      !(t.dueAt && t.dueAt < now) &&
      !(t.dueAt && t.dueAt >= todayStart.getTime() && t.dueAt <= todayEnd.getTime())
  );
  const doneYesterday = tasks.filter(
    (t) => t.done && t.doneAt !== undefined &&
      t.doneAt >= yesterdayStart.getTime() && t.doneAt < todayStart.getTime()
  );

  const totalCount = overdue.length + dueToday.length + highPriority.length;
  const empty = totalCount === 0 && doneYesterday.length === 0;

  const handleCopy = () => {
    const text = buildClipboardText(overdue, dueToday, highPriority, doneYesterday);
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-vscode-border flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-xs text-vscode-text">
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </div>
          {!empty && (
            <div className="text-[10px] text-vscode-muted mt-0.5 flex gap-2">
              {overdue.length > 0 && <span className="text-vscode-red">{overdue.length} overdue</span>}
              {dueToday.length > 0 && <span className="text-vscode-yellow">{dueToday.length} due today</span>}
              {highPriority.length > 0 && <span className="text-vscode-orange">{highPriority.length} high priority</span>}
              {doneYesterday.length > 0 && <span className="text-vscode-green">{doneYesterday.length} done yesterday</span>}
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={empty}
          className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors ${
            empty
              ? "border-vscode-border text-vscode-muted opacity-40 cursor-not-allowed"
              : copied
              ? "border-vscode-green text-vscode-green"
              : "border-vscode-border text-vscode-muted hover:border-vscode-accent hover:text-vscode-accent"
          }`}
          title="Copy standup to clipboard"
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="3" y="1" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <path d="M1 3.5V9a1 1 0 001 1h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              copy
            </>
          )}
        </button>
      </div>

      {/* Body */}
      {empty ? (
        <div className="flex items-center justify-center flex-1 text-vscode-muted text-xs">
          nothing to report today
        </div>
      ) : (
        <div className="flex-1">
          <Section title="overdue"        items={overdue}       accent="text-vscode-red" />
          <Section title="due today"      items={dueToday}      accent="text-vscode-yellow" />
          <Section title="high priority"  items={highPriority}  accent="text-vscode-orange" />
          <Section title="done yesterday" items={doneYesterday} accent="text-vscode-green" />
        </div>
      )}
    </div>
  );
}
