import { useEffect } from "react";
import { useTaskStore } from "./store";

// Tauri notification plugin — falls back gracefully in browser dev mode
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
    // Dev/browser fallback
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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      tasks.forEach((task) => {
        if (
          !task.done &&
          !task.notified &&
          task.dueAt &&
          task.dueAt <= now
        ) {
          sendNotification("⏰ Task overdue", task.text);
          markNotified(task.id);
        }
      });
    }, 30_000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, markNotified]);
}
