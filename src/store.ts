import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Priority = "low" | "normal" | "high";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  dueAt?: number; // unix ms, optional
  priority: Priority;
  notified: boolean;
}

interface TaskStore {
  tasks: Task[];
  addTask: (text: string, dueAt?: number, priority?: Priority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  markNotified: (id: string) => void;
  clearDone: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (text, dueAt, priority = "normal") =>
        set((s) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              text,
              done: false,
              createdAt: Date.now(),
              dueAt,
              priority,
              notified: false,
            },
            ...s.tasks,
          ],
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      markNotified: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, notified: true } : t
          ),
        })),

      clearDone: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),
    }),
    {
      name: "assistask-tasks",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
