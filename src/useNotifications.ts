import { useEffect } from "react";
import { useTaskStore } from "./store";
import { useSettingsStore } from "./settingsStore";

async function sendNotification(title: string, body: string) {
  try {
    const { isPermissionGranted, requestPermission, sendNotification } =
      await import("@tauri-apps/plugin-notification");
    let granted = await isPermissionGranted();
    if (!granted) {
      const perm = await requestPermission();
      granted = perm === "granted";
    }
    if (granted) sendNotification({ title, body });
  } catch {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((p) => {
          if (p === "granted") new Notification(title, { body });
        });
      }
    }
  }
}

export function useNotifications() {
  const { tasks, markNotified } = useTaskStore();
  const { notificationsEnabled, repeatNotifHours } = useSettingsStore();

  useEffect(() => {
    if (!notificationsEnabled) return;

    const check = () => {
      const now = Date.now();
      const repeatMs = repeatNotifHours * 60 * 60 * 1000;

      tasks.forEach((task) => {
        if (task.done || !task.dueAt || task.dueAt > now) return;

        const neverNotified = !task.lastNotifiedAt;
        const repeatDue = task.lastNotifiedAt && (now - task.lastNotifiedAt) >= repeatMs;

        if (neverNotified || repeatDue) {
          const label = neverNotified ? "⏰ Task due" : "⏰ Still overdue";
          sendNotification(label, task.text);
          markNotified(task.id, now);
        }
      });
    };

    check(); // run immediately on mount / settings change
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [tasks, markNotified, notificationsEnabled, repeatNotifHours]);
}
