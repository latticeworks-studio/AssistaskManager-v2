import { useEffect, useRef } from "react";

type Glyph = number[][];

const FONT: Record<string, Glyph> = {
  A: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  S: [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  I: [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
  ],
  T: [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  K: [
    [1,0,0,0,1],
    [1,0,0,1,0],
    [1,1,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
};

const CHAR_W = 5;
const PIXEL_GAP = 1;
// global column index for a pixel: ci*(CHAR_W + PIXEL_GAP) + colInChar
// total span for "ASSISTASK" (9 chars): 9*5 + 8*1 = 53 columns

interface Props {
  text: string;
  pixelSize?: number;
  color?: string;
  dimColor?: string;
  animated?: boolean;
}

export default function PixelText({
  text,
  pixelSize = 3,
  color = "#52D7C6",
  dimColor = "transparent",
  animated = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const chars = text.toUpperCase().split("").filter((c) => FONT[c]);
  const gap = PIXEL_GAP;
  const charGap = pixelSize + 1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!animated) {
      // Restore flat color
      container.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => {
        el.style.backgroundColor = el.dataset.on === "1" ? color : dimColor;
      });
      return;
    }

    const tick = (time: number) => {
      container.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => {
        if (el.dataset.on !== "1") return;
        const col = parseInt(el.dataset.col!);
        const hue = (time * 0.06 + col * 20) % 360;
        el.style.backgroundColor = `hsl(${hue}, 90%, 65%)`;
      });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animated, color, dimColor]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} style={{ display: "flex", gap: `${charGap}px` }}>
          {chars.map((char, ci) => (
            <div key={ci} style={{ display: "flex", gap: `${gap}px` }}>
              {FONT[char][row].map((on, colInChar) => (
                <div
                  key={colInChar}
                  data-col={ci * (CHAR_W + gap) + colInChar}
                  data-on={on ? "1" : "0"}
                  style={{
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: on ? color : dimColor,
                    borderRadius: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
