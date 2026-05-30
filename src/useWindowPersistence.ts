import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";

const KEY = "assistask-window-bounds";

interface Bounds { x: number; y: number; w: number; h: number; }

export function useWindowPersistence() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let unlistenMove: (() => void) | undefined;
    let unlistenResize: (() => void) | undefined;

    async function init() {
      const win = getCurrentWindow();

      // Restore saved bounds
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const { x, y, w, h } = JSON.parse(raw) as Bounds;
          await win.setPosition(new LogicalPosition(x, y));
          await win.setSize(new LogicalSize(w, h));
        }
      } catch {}

      const save = async () => {
        try {
          const [pos, size, factor] = await Promise.all([
            win.innerPosition(),
            win.innerSize(),
            win.scaleFactor(),
          ]);
          const bounds: Bounds = {
            x: Math.round(pos.x / factor),
            y: Math.round(pos.y / factor),
            w: Math.round(size.width / factor),
            h: Math.round(size.height / factor),
          };
          localStorage.setItem(KEY, JSON.stringify(bounds));
        } catch {}
      };

      const debounced = () => {
        clearTimeout(timer);
        timer = setTimeout(save, 400);
      };

      unlistenMove   = await win.onMoved(debounced);
      unlistenResize = await win.onResized(debounced);
    }

    init();

    return () => {
      clearTimeout(timer);
      unlistenMove?.();
      unlistenResize?.();
    };
  }, []);
}
