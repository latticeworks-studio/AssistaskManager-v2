import { invoke } from "@tauri-apps/api/core";
import { View } from "./App";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (view: View) => void;
  currentView: View;
}

const ITEMS: { view: View; label: string; icon: JSX.Element }[] = [
  {
    view: "standup",
    label: "Morning Standup",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: "tasks",
    label: "All Active Tasks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="3" width="11" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="2" y="7" width="8" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="2" y="11" width="9" height="1.2" rx="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    view: "completed",
    label: "All Completed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2.5 7.5L6 11L12.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    view: "lists",
    label: "My Lists",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="2" width="11" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="7" width="11" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="12" width="6" height="1" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    view: "settings",
    label: "Settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.5 1.5v1.2M7.5 12.3v1.2M1.5 7.5h1.2M12.3 7.5h1.2M3.4 3.4l.85.85M10.75 10.75l.85.85M3.4 11.6l.85-.85M10.75 4.25l.85-.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: "about",
    label: "About",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.5 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7.5" cy="4.5" r="0.7" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SlideMenu({ open, onClose, onSelect, currentView }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-10 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.45)" }}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 left-0 h-full z-20 w-52 bg-vscode-sidebar border-r border-vscode-border flex flex-col transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-vscode-border">
          <span className="text-xs text-vscode-muted tracking-widest uppercase">menu</span>
          <button
            onClick={onClose}
            className="text-vscode-muted hover:text-vscode-text transition-colors"
            aria-label="Close menu"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 py-2">
          {ITEMS.map(({ view, label, icon }) => (
            <button
              key={view}
              onClick={() => { onSelect(view); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                currentView === view
                  ? "text-vscode-accent bg-vscode-panel"
                  : "text-vscode-text hover:bg-vscode-panel hover:text-vscode-accent"
              }`}
            >
              <span className="flex-shrink-0">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Quit */}
        <div className="border-t border-vscode-border py-2">
          <button
            onClick={() => invoke("quit_app")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-vscode-muted hover:bg-vscode-panel hover:text-vscode-red transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quit
          </button>
        </div>
      </div>
    </>
  );
}
