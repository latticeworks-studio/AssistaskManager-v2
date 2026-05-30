import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useTaskStore, Priority, Task } from "./store";
import { useNotifications } from "./useNotifications";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-vscode-muted",
  normal: "text-vscode-blue",
  high: "text-vscode-red",
};

const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-vscode-muted",
  normal: "bg-vscode-blue",
  high: "bg-vscode-red",
};

function formatDue(dueAt: number): string {
  const d = new Date(dueAt);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return time;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

function TaskRow({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useTaskStore();
  const overdue =
    !task.done && task.dueAt !== undefined && task.dueAt < Date.now();

  return (
    <div
      className={`group flex items-start gap-2 px-3 py-2 border-b border-vscode-border hover:bg-vscode-panel transition-colors ${
        task.done ? "opacity-40" : ""
      }`}
    >
      {/* Priority dot */}
      <div className="mt-[5px] flex-shrink-0">
        <div
          className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
        />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className="mt-[2px] flex-shrink-0 w-4 h-4 border border-vscode-muted rounded-sm flex items-center justify-center hover:border-vscode-blue transition-colors"
        aria-label="Toggle task"
      >
        {task.done && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="text-vscode-green"
          >
            <path
              d="M1.5 5L4 7.5L8.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 leading-relaxed break-words ${
          task.done ? "line-through text-vscode-muted" : "text-vscode-text"
        }`}
      >
        {task.text}
      </span>

      {/* Due */}
      {task.dueAt && (
        <span
          className={`flex-shrink-0 text-xs mt-[2px] ${
            overdue ? "text-vscode-red" : "text-vscode-muted"
          }`}
        >
          {overdue ? "⏰ " : ""}
          {formatDue(task.dueAt)}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => deleteTask(task.id)}
        className="flex-shrink-0 mt-[2px] opacity-0 group-hover:opacity-100 text-vscode-muted hover:text-vscode-red transition-all"
        aria-label="Delete task"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  useNotifications();

  const { tasks, addTask, clearDone } = useTaskStore();
  const [input, setInput] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [showDue, setShowDue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;

    let dueAt: number | undefined;
    if (dueTime) {
      const d = new Date(dueTime);
      if (!isNaN(d.getTime())) dueAt = d.getTime();
    }

    addTask(text, dueAt, priority);
    setInput("");
    setDueTime("");
    setPriority("normal");
    setShowDue(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setInput("");
      setDueTime("");
      setShowDue(false);
    }
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const overdueCount = pending.filter(
    (t) => t.dueAt && t.dueAt < Date.now()
  ).length;

  return (
    <div className="flex flex-col h-full bg-vscode-bg">
      {/* Title bar */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-3 py-2 bg-vscode-sidebar border-b border-vscode-border select-none"
      >
        <span className="text-xs text-vscode-muted tracking-widest uppercase">
          assistask
        </span>
        <div className="flex items-center gap-2 text-xs text-vscode-muted">
          {overdueCount > 0 && (
            <span className="text-vscode-red">{overdueCount} overdue</span>
          )}
          <span>{pending.length} pending</span>
          {done.length > 0 && (
            <button
              onClick={clearDone}
              className="hover:text-vscode-text transition-colors"
            >
              clear done
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-full text-vscode-muted text-xs">
            no tasks — type below and press enter
          </div>
        )}
        {pending.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
        {done.length > 0 && pending.length > 0 && (
          <div className="px-3 py-1 text-xs text-vscode-muted border-b border-vscode-border">
            completed
          </div>
        )}
        {done.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-vscode-border bg-vscode-sidebar">
        {showDue && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-vscode-border">
            <span className="text-xs text-vscode-muted w-8">due</span>
            <input
              type="datetime-local"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="flex-1 bg-vscode-panel text-vscode-text text-xs px-2 py-1 rounded border border-vscode-border focus:border-vscode-accent"
              style={{ colorScheme: "dark" }}
            />
            <div className="flex gap-1">
              {(["low", "normal", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    priority === p
                      ? `border-current ${PRIORITY_COLORS[p]}`
                      : "border-vscode-border text-vscode-muted hover:border-vscode-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2">
          {/* Toggle due options */}
          <button
            onClick={() => setShowDue((v) => !v)}
            className={`flex-shrink-0 text-xs transition-colors ${
              showDue ? "text-vscode-blue" : "text-vscode-muted hover:text-vscode-text"
            }`}
            title="Set due time / priority"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M7 4.5V7L8.5 8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="add task…"
            className="flex-1 bg-transparent text-vscode-text placeholder-vscode-muted caret-vscode-blue"
          />

          <span className="text-xs text-vscode-muted">↵</span>
        </div>
      </div>
    </div>
  );
}
