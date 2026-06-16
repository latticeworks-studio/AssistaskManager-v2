import { useState, useEffect } from "react";
import { useTaskStore, Task } from "../store";
import { useSettingsStore, ALL_TIMEZONES } from "../settingsStore";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useSnapshots } from "../useSnapshots";
import { encodeListCode, decodeListCode } from "../listCode";
import { View } from "../App";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-vscode-muted w-24 flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}

const inputCls = "bg-vscode-bg border border-neutral-600 rounded px-2 py-1 text-xs text-vscode-text focus:border-vscode-accent focus:outline-none";
const selectCls = "flex-1 bg-vscode-bg border border-neutral-600 rounded px-2 py-1 text-xs text-vscode-text focus:border-vscode-accent focus:outline-none";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;


export default function SettingsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { tasks: allTasks, clearDone, importTasks } = useTaskStore();
  const { save: saveSnapshot } = useSnapshots();
  const { showTimezones, localName, tz1Name, tz1Zone, tz2Name, tz2Zone, titleColor, keepKeywords, notificationsEnabled, repeatNotifHours, update } = useSettingsStore();

  const [hexInput, setHexInput] = useState(titleColor);
  useEffect(() => { setHexInput(titleColor); }, [titleColor]);

  const [autostart, setAutostart] = useState(false);
  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => {});
  }, []);
  const toggleAutostart = async (val: boolean) => {
    try {
      val ? await enable() : await disable();
      setAutostart(val);
    } catch {}
  };

  const handleExport = () => {
    const data = JSON.stringify(useTaskStore.getState().tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assistask-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (HEX_RE.test(val)) update({ titleColor: val });
  };

  const clearAll = () => {
    const store = useTaskStore.getState();
    store.tasks.forEach((t) => store.deleteTask(t.id));
  };

  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const handleSaveCode = async () => {
    if (!saveName.trim()) return;
    const code = encodeListCode(useTaskStore.getState().tasks.filter((t) => !t.done));
    await saveSnapshot(saveName.trim(), code);
    setSaveName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [copied, setCopied] = useState(false);
  const handleCopyCode = async () => {
    const code = encodeListCode(useTaskStore.getState().tasks.filter((t) => !t.done));
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [importCode, setImportCode] = useState("");
  const [importStage, setImportStage] = useState<"idle" | "confirm" | "error">("idle");
  const [importError, setImportError] = useState("");
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  const handleImport = () => {
    try {
      const tasks = decodeListCode(importCode);
      if (tasks.length === 0) throw new Error("No valid tasks found");
      setPendingTasks(tasks);
      setImportStage("confirm");
    } catch {
      setImportError("Invalid list code — couldn't read tasks.");
      setImportStage("error");
    }
  };

  const applyImport = (mode: "replace" | "append") => {
    importTasks(pendingTasks, mode);
    setImportCode("");
    setPendingTasks([]);
    setImportStage("idle");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

      {/* Timezone settings */}
      <div className="flex flex-col gap-3">
        <div className="text-xs text-vscode-muted uppercase tracking-wide">display</div>

        <Field label="Title color:">
          <input
            type="color"
            value={titleColor}
            onChange={(e) => update({ titleColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border border-vscode-border bg-transparent"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={7}
            className={`${inputCls} w-20 font-mono`}
            placeholder="#52D7C6"
          />
          <button
            onClick={() => { update({ titleColor: "#52D7C6" }); setHexInput("#52D7C6"); }}
            className="text-xs text-vscode-muted hover:text-vscode-text transition-colors"
          >
            reset
          </button>
        </Field>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autostart}
            onChange={(e) => toggleAutostart(e.target.checked)}
            className="accent-vscode-accent w-3.5 h-3.5"
          />
          <span className="text-sm text-vscode-text">Launch at startup</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={keepKeywords}
            onChange={(e) => update({ keepKeywords: e.target.checked })}
            className="accent-vscode-accent w-3.5 h-3.5"
          />
          <span className="text-sm text-vscode-text">Keep keywords in task text?</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showTimezones}
            onChange={(e) => update({ showTimezones: e.target.checked })}
            className="accent-vscode-accent w-3.5 h-3.5"
          />
          <span className="text-sm text-vscode-text">Show Timezones?</span>
        </label>

        {showTimezones && (
          <div className="flex flex-col gap-2 pl-1 border-l border-vscode-border ml-1">
            <Field label="Local name:">
              <input
                value={localName}
                onChange={(e) => update({ localName: e.target.value.slice(0, 5).toUpperCase() })}
                maxLength={5}
                className={`${inputCls} w-16`}
                placeholder="LOCAL"
              />
            </Field>

            <Field label="Timezone 1:">
              <input
                value={tz1Name}
                onChange={(e) => update({ tz1Name: e.target.value.slice(0, 5).toUpperCase() })}
                maxLength={5}
                className={`${inputCls} w-16`}
                placeholder="TZ1"
              />
              <select
                value={tz1Zone}
                onChange={(e) => update({ tz1Zone: e.target.value })}
                className={selectCls}
              >
                {ALL_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </Field>

            <Field label="Timezone 2:">
              <input
                value={tz2Name}
                onChange={(e) => update({ tz2Name: e.target.value.slice(0, 5).toUpperCase() })}
                maxLength={5}
                className={`${inputCls} w-16`}
                placeholder="TZ2"
              />
              <select
                value={tz2Zone}
                onChange={(e) => update({ tz2Zone: e.target.value })}
                className={selectCls}
              >
                {ALL_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-2">
        <div className="text-xs text-vscode-muted uppercase tracking-wide">notifications</div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => update({ notificationsEnabled: e.target.checked })}
            className="accent-vscode-accent w-3.5 h-3.5"
          />
          <span className="text-sm text-vscode-text">Enable notifications</span>
        </label>

        {notificationsEnabled && (
          <div className="pl-1 border-l border-vscode-border ml-1">
            <Field label="Repeat past due every:">
              <input
                type="number"
                min={1}
                max={24}
                value={repeatNotifHours}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(24, parseInt(e.target.value) || 1));
                  update({ repeatNotifHours: v });
                }}
                className={`${inputCls} w-14 text-center`}
              />
              <span className="text-xs text-vscode-muted">hour{repeatNotifHours !== 1 ? "s" : ""}</span>
            </Field>
          </div>
        )}
      </div>

      {/* Data */}
      <div className="flex flex-col gap-2">
        <div className="text-xs text-vscode-muted uppercase tracking-wide">data</div>
        <button onClick={clearDone} className="text-left text-sm text-vscode-text hover:text-vscode-accent transition-colors py-0.5">
          Clear completed tasks
        </button>
        <button onClick={clearAll} className="text-left text-sm text-vscode-text hover:text-vscode-red transition-colors py-0.5">
          Clear all tasks
        </button>
        <button onClick={handleExport} className="text-left text-sm text-vscode-text hover:text-vscode-accent transition-colors py-0.5">
          Export tasks as JSON
        </button>

        <div className="border-t border-vscode-border pt-2 mt-1 flex flex-col gap-2">
          <div className="text-xs text-vscode-muted">List code</div>
          <button
            onClick={handleCopyCode}
            className="text-left text-sm text-vscode-text hover:text-vscode-accent transition-colors py-0.5"
          >
            {copied ? "Copied!" : "Copy list code"}
          </button>

          <div className="text-xs text-vscode-muted mt-1">Save code</div>
          <div className="flex gap-2">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveCode(); }}
              placeholder="Name this list…"
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={handleSaveCode}
              disabled={!saveName.trim()}
              className="text-xs px-3 py-1 rounded border border-vscode-accent text-vscode-accent hover:bg-vscode-accent hover:text-vscode-bg transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {saved ? "Saved!" : "Save"}
            </button>
          </div>

          <button
            onClick={() => onNavigate("lists")}
            className="text-left text-sm text-vscode-accent hover:underline transition-colors py-0.5"
          >
            Browse saved lists →
          </button>

          <div className="text-xs text-vscode-muted mt-1">Import list code</div>
          <textarea
            value={importCode}
            onChange={(e) => { setImportCode(e.target.value); setImportStage("idle"); }}
            placeholder="Paste list code here…"
            rows={3}
            className="w-full bg-vscode-bg border border-neutral-600 rounded px-2 py-1 text-xs text-vscode-text focus:border-vscode-accent focus:outline-none resize-none font-mono"
          />

          {importStage === "idle" && (
            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className="text-left text-sm text-vscode-text hover:text-vscode-accent transition-colors py-0.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              Import
            </button>
          )}

          {importStage === "error" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-vscode-red">{importError}</span>
              <button onClick={() => setImportStage("idle")} className="text-xs text-vscode-muted hover:text-vscode-text">retry</button>
            </div>
          )}

          {importStage === "confirm" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-vscode-muted">
                {pendingTasks.length} task{pendingTasks.length !== 1 ? "s" : ""} found — replace existing or append?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => applyImport("replace")}
                  className="text-xs px-3 py-1 rounded border border-vscode-red text-vscode-red hover:bg-vscode-red hover:text-white transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={() => applyImport("append")}
                  className="text-xs px-3 py-1 rounded border border-vscode-accent text-vscode-accent hover:bg-vscode-accent hover:text-vscode-bg transition-colors"
                >
                  Append
                </button>
                <button
                  onClick={() => setImportStage("idle")}
                  className="text-xs text-vscode-muted hover:text-vscode-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-vscode-muted uppercase tracking-wide mb-1">stats</div>
        <span className="text-xs text-vscode-muted">{allTasks.filter((t) => !t.done).length} active</span>
        <span className="text-xs text-vscode-muted">{allTasks.filter((t) => t.done).length} completed</span>
        <span className="text-xs text-vscode-muted">{allTasks.length} total</span>
      </div>

    </div>
  );
}
