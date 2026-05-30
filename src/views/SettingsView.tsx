import { useState, useEffect } from "react";
import { useTaskStore } from "../store";
import { useSettingsStore, ALL_TIMEZONES } from "../settingsStore";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-vscode-muted w-24 flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}

const inputCls = "bg-vscode-bg border border-vscode-border rounded px-2 py-1 text-xs text-vscode-text focus:border-vscode-accent focus:outline-none";
const selectCls = "flex-1 bg-vscode-bg border border-vscode-border rounded px-2 py-1 text-xs text-vscode-text focus:border-vscode-accent focus:outline-none";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function SettingsView() {
  const { tasks: allTasks, clearDone } = useTaskStore();
  const { showTimezones, localName, tz1Name, tz1Zone, tz2Name, tz2Zone, titleColor, keepKeywords, notificationsEnabled, repeatNotifHours, update } = useSettingsStore();

  const [hexInput, setHexInput] = useState(titleColor);
  useEffect(() => { setHexInput(titleColor); }, [titleColor]);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (HEX_RE.test(val)) update({ titleColor: val });
  };

  const clearAll = () => {
    const store = useTaskStore.getState();
    store.tasks.forEach((t) => store.deleteTask(t.id));
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
        <button onClick={clearDone} className="text-left text-sm text-vscode-text hover:text-vscode-blue transition-colors py-0.5">
          Clear completed tasks
        </button>
        <button onClick={clearAll} className="text-left text-sm text-vscode-text hover:text-vscode-red transition-colors py-0.5">
          Clear all tasks
        </button>
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
