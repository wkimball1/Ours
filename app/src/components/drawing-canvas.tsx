"use client";

import { useRef, useState, useEffect, useCallback, useTransition } from "react";
import { saveDrawingAction } from "@/app/actions";

interface Props {
  promptId: string;
  existingDrawing: string | null;
}

export function DrawingCanvas({ promptId, existingDrawing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#1c1917");
  const [brushSize, setBrushSize] = useState(4);
  const [hasDrawn, setHasDrawn] = useState(!!existingDrawing);
  const [pending, startTransition] = useTransition();
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [drawingLocked, setDrawingLocked] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    if (existingDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
      };
      img.src = existingDrawing;
    }
  }, [existingDrawing]);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const next = [...prev, snapshot];
      if (next.length > 30) next.shift();
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || history.length === 0) return;

    const prev = [...history];
    const snapshot = prev.pop()!;
    setHistory(prev);
    ctx.putImageData(snapshot, 0, 0);

    if (prev.length === 0 && !existingDrawing) {
      setHasDrawn(false);
    }
  }, [history, existingDrawing]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (drawingLocked) return;
    if ("touches" in e) {
      if (e.touches.length > 1) return;
    }
    saveSnapshot();
    setIsDrawing(true);
    lastPoint.current = getPos(e);
  }, [getPos, saveSnapshot, drawingLocked]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !lastPoint.current) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPoint.current = pos;
    setHasDrawn(true);
  }, [isDrawing, color, brushSize, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    saveSnapshot();
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    setHasDrawn(false);
  }

  function submit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawingData = canvas.toDataURL("image/png", 0.8);
    const fd = new FormData();
    fd.set("prompt_id", promptId);
    fd.set("drawing_data", drawingData);
    startTransition(() => saveDrawingAction(fd));
  }

  const colors = ["#1c1917", "#dc2626", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#ec4899", "#fafaf9"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={drawingLocked}
              onChange={(e) => setDrawingLocked(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300"
            />
            Lock canvas to scroll
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm dark:border-stone-700">
        <canvas
          ref={canvasRef}
          className={`h-[300px] w-full sm:h-[400px] ${drawingLocked ? "touch-auto" : "touch-none cursor-crosshair"}`}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition ${color === c ? "border-stone-900 scale-110 dark:border-stone-100" : "border-stone-300 dark:border-stone-600"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <select
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
        >
          <option value={2}>Fine</option>
          <option value={4}>Medium</option>
          <option value={8}>Thick</option>
          <option value={16}>Bold</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
        >
          Undo
        </button>
        <button
          onClick={clearCanvas}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
        >
          Clear
        </button>
        <button
          onClick={submit}
          disabled={!hasDrawn || pending}
          className="btn-accent ml-auto rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
        >
          {pending ? "Saving..." : "Submit drawing"}
        </button>
      </div>
    </div>
  );
}
