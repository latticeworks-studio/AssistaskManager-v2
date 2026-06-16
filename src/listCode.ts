import LZString from "lz-string";
import { Task, Priority } from "./store";

interface EncodedTask {
  i: string;    // id
  t: string;    // text
  p: string;    // priority
  c: number;    // createdAt
  d?: number;   // dueAt
}

export function encodeListCode(tasks: Task[]): string {
  const minimal: EncodedTask[] = tasks.map((task) => ({
    i: task.id,
    t: task.text,
    p: task.priority,
    c: task.createdAt,
    ...(task.dueAt !== undefined ? { d: task.dueAt } : {}),
  }));
  return LZString.compressToBase64(JSON.stringify(minimal));
}

export function decodeListCode(code: string): Task[] {
  // Try new compressed format first, fall back to legacy plain base64
  let json: string | null = LZString.decompressFromBase64(code.trim());

  if (!json) {
    // Legacy: base64(TextEncoder bytes) with full Task objects
    try {
      const bin = atob(code.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } catch {
      throw new Error("Invalid list code");
    }
  }

  const data = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error("not an array");

  return data
    .filter((t) => t && (t.i || t.id) && (t.t || t.text))
    .map((t): Task => {
      // New compact format
      if (t.i !== undefined) {
        return {
          id: t.i,
          text: t.t,
          priority: t.p as Priority,
          createdAt: t.c,
          done: false,
          ...(t.d !== undefined ? { dueAt: t.d } : {}),
        };
      }
      // Legacy full format
      return t as Task;
    });
}
