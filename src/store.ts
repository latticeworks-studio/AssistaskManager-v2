import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Priority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  hidden?: boolean;
  createdAt: number;
  dueAt?: number;
  priority: Priority;
  doneAt?: number;
  lastNotifiedAt?: number;
}

interface TaskStore {
  tasks: Task[];
  addTask: (text: string, dueAt?: number, priority?: Priority) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, "text" | "priority" | "dueAt">>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  markNotified: (id: string, at: number) => void;
  hideDone: () => void;
  clearDone: () => void;
  markAllDone: () => void;
  hideAll: () => void;
  hideCritical: () => void;
  deleteAll: () => void;
  reorderTask: (draggedId: string, beforeId: string | null) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (text, dueAt, priority = "P3") =>
        set((s) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              text,
              done: false,
              createdAt: Date.now(),
              dueAt,
              priority,
            },
            ...s.tasks,
          ],
        })),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : undefined }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      markNotified: (id, at) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, lastNotifiedAt: at } : t
          ),
        })),

      hideDone: () =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.done ? { ...t, hidden: true } : t)),
        })),

      clearDone: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),

      markAllDone: () =>
        set((s) => ({
          tasks: s.tasks.map((t) => (!t.done ? { ...t, done: true, doneAt: Date.now() } : t)),
        })),

      hideAll: () =>
        set((s) => ({
          tasks: s.tasks.map((t) => ({ ...t, done: true, hidden: true, doneAt: t.doneAt ?? Date.now() })),
        })),

      hideCritical: () =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            !t.done && (t.priority === "P0" || t.priority === "P1")
              ? { ...t, done: true, hidden: true, doneAt: Date.now() }
              : t
          ),
        })),

      deleteAll: () => set({ tasks: [] }),

      reorderTask: (draggedId, beforeId) =>
        set((s) => {
          const tasks = [...s.tasks];
          const from = tasks.findIndex((t) => t.id === draggedId);
          if (from === -1) return s;
          const [item] = tasks.splice(from, 1);
          if (beforeId === null) {
            tasks.push(item);
          } else {
            const to = tasks.findIndex((t) => t.id === beforeId);
            tasks.splice(to === -1 ? tasks.length : to, 0, item);
          }
          return { tasks };
        }),
    }),
    {
      name: "assistask-tasks",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
