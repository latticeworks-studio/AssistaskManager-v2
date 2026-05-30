import { useTaskStore } from "../store";

function formatDue(dueAt: number): string {
  const d = new Date(dueAt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StandupView() {
  const { tasks } = useTaskStore();
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const overdue = tasks.filter(
    (t) => !t.done && t.dueAt !== undefined && t.dueAt < now
  );
  const dueToday = tasks.filter(
    (t) =>
      !t.done &&
      t.dueAt !== undefined &&
      t.dueAt >= todayStart.getTime() &&
      t.dueAt <= todayEnd.getTime()
  );
  const highPriority = tasks.filter(
    (t) => !t.done && (t.priority === "P0" || t.priority === "P1") &&
      !(t.dueAt && t.dueAt < now) &&
      !(t.dueAt && t.dueAt >= todayStart.getTime() && t.dueAt <= todayEnd.getTime())
  );

  const Section = ({ title, items, accent }: { title: string; items: typeof tasks; accent: string }) =>
    items.length > 0 ? (
      <div className="mb-4">
        <div className={`px-3 py-1 text-xs font-medium tracking-wide ${accent} border-b border-vscode-border`}>
          {title}
        </div>
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-2 px-3 py-2 border-b border-vscode-border">
            <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              t.priority === "P0" ? "bg-vscode-red" :
              t.priority === "P1" ? "bg-vscode-orange" :
              t.priority === "P2" ? "bg-vscode-yellow" :
              t.priority === "P3" ? "bg-vscode-blue" :
              t.priority === "P4" ? "bg-vscode-green" : "bg-vscode-muted"
            }`} />
            <span className="flex-1 text-sm text-vscode-text leading-relaxed">{t.text}</span>
            {t.dueAt && (
              <span className="text-xs text-vscode-muted flex-shrink-0 mt-[2px]">
                {formatDue(t.dueAt)}
              </span>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const empty = overdue.length === 0 && dueToday.length === 0 && highPriority.length === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-vscode-muted border-b border-vscode-border">
        {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
      {empty ? (
        <div className="flex items-center justify-center h-32 text-vscode-muted text-xs">
          nothing urgent today
        </div>
      ) : (
        <>
          <Section title="overdue" items={overdue} accent="text-vscode-red" />
          <Section title="due today" items={dueToday} accent="text-vscode-yellow" />
          <Section title="high priority" items={highPriority} accent="text-vscode-orange" />
        </>
      )}
    </div>
  );
}
