import { useTaskStore } from "../store";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CompletedView() {
  const { tasks, deleteTask, clearDone } = useTaskStore();
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {done.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-vscode-muted text-xs">
          no completed tasks
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-vscode-border">
            <span className="text-xs text-vscode-muted">{done.length} completed</span>
            <button
              onClick={clearDone}
              className="text-xs text-vscode-muted hover:text-vscode-red transition-colors"
            >
              clear all
            </button>
          </div>
          {done.map((t) => (
            <div
              key={t.id}
              className="group flex items-start gap-2 px-3 py-2 border-b border-vscode-border opacity-50 hover:opacity-70 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="mt-[4px] flex-shrink-0 text-vscode-green">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-vscode-text line-through break-words">{t.text}</span>
                <div className="text-xs text-vscode-muted mt-0.5">{formatDate(t.createdAt)}</div>
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                className="flex-shrink-0 mt-[2px] opacity-0 group-hover:opacity-100 text-vscode-muted hover:text-vscode-red transition-all"
                aria-label="Delete task"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
