export default function AboutView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div>
        <div className="text-vscode-accent text-base tracking-widest uppercase mb-1">Assistask</div>
        <div className="text-xs text-vscode-muted">v2.0.1</div>
      </div>
      <p className="text-xs text-vscode-muted leading-relaxed max-w-xs">
        A lightweight floating task manager built with Tauri + React. Parses natural language for
        priorities and due dates so you can capture tasks without breaking your flow.
      </p>
      <div className="text-xs text-vscode-muted">
        <div>LatticeWorks</div>
      </div>
    </div>
  );
}
