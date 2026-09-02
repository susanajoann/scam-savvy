// src/PanZoomChart.jsx
//
// Wraps any chart (or other content) in a pan/zoom viewport: scroll or
// pinch to zoom, drag to pan, like a map. Works by applying a CSS
// transform (translate + scale) to a layer containing the chart, rather
// than touching the chart's own rendering — so it drops in around an
// existing Recharts <ResponsiveContainer> with no changes to the chart
// itself.
//
// Why this approach instead of rescaling the chart's axis domains: it's
// far more robust to implement without deep coupling to Recharts'
// internal coordinate system (which varies across versions and isn't
// designed for arbitrary 2D drag-to-zoom on scatter charts). The
// trade-off is that at high zoom the Tooltip's text scales up visually
// along with everything else, since it's part of the same transformed
// layer — kept in mind by capping max zoom at a modest level.

import { useRef, useState, useEffect } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const WHEEL_ZOOM_FACTOR = 1.15;

function clampScale(scale) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export default function PanZoomChart({ children, height = 380 }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  const isDefaultView =
    transform.scale === 1 && transform.x === 0 && transform.y === 0;

  function zoomAt(clientX, clientY, factor) {
    const rect = containerRef.current.getBoundingClientRect();
    const originX = clientX - rect.left;
    const originY = clientY - rect.top;

    setTransform((prev) => {
      const newScale = clampScale(prev.scale * factor);
      const ratio = newScale / prev.scale;
      // Keep the point under the cursor/pinch-center visually fixed while
      // the scale changes, rather than always zooming toward the corner.
      const newX = originX - (originX - prev.x) * ratio;
      const newY = originY - (originY - prev.y) * ratio;
      return { x: newX, y: newY, scale: newScale };
    });
  }

  function handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
    zoomAt(e.clientX, e.clientY, factor);
  }

  // Attaching wheel handling here (native addEventListener with
  // passive: false) instead of React's onWheel prop is deliberate: React's
  // synthetic event system doesn't reliably let preventDefault() stop the
  // browser's own zoom/scroll — most noticeably for trackpad pinch
  // gestures, which fire as wheel events with ctrlKey set and which
  // browsers otherwise treat as "zoom the whole page." A native, non-
  // passive listener is what actually gives us the ability to override
  // that and keep the gesture scoped to just this chart.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseDown(e) {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: transform.x,
      origY: transform.y,
    };
    setIsDragging(true);
  }

  function handleMouseMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((prev) => ({
      ...prev,
      x: dragRef.current.origX + dx,
      y: dragRef.current.origY + dy,
    }));
  }

  function endDrag() {
    dragRef.current = null;
    setIsDragging(false);
  }

  function touchDistance(touches) {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function touchMidpoint(touches) {
    const [a, b] = touches;
    return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        origX: transform.x,
        origY: transform.y,
      };
    } else if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: touchDistance(e.touches),
        startScale: transform.scale,
      };
      dragRef.current = null;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      setTransform((prev) => ({
        ...prev,
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      }));
    } else if (e.touches.length === 2 && pinchRef.current) {
      const newDist = touchDistance(e.touches);
      const mid = touchMidpoint(e.touches);
      const targetScale = clampScale(
        pinchRef.current.startScale * (newDist / pinchRef.current.startDist),
      );
      const rect = containerRef.current.getBoundingClientRect();
      const originX = mid.x - rect.left;
      const originY = mid.y - rect.top;
      setTransform((prev) => {
        const ratio = targetScale / prev.scale;
        return {
          x: originX - (originX - prev.x) * ratio,
          y: originY - (originY - prev.y) * ratio,
          scale: targetScale,
        };
      });
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      dragRef.current = null;
      pinchRef.current = null;
      setIsDragging(false);
    }
  }

  function resetView() {
    setTransform({ x: 0, y: 0, scale: 1 });
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height,
          overflow: "hidden",
          overscrollBehavior: "contain",
          border: "1.5px solid #E8E0F5",
          borderRadius: 12,
          background: "#fff",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {children}
        </div>
      </div>

      {!isDefaultView && (
        <button
          onClick={resetView}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "6px 12px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "sans-serif",
            background: "#fff",
            color: "#3D1580",
            border: "1.5px solid #C9B8E8",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          Reset view
        </button>
      )}

      <p
        style={{
          fontSize: 12,
          color: "#999",
          margin: "6px 0 0",
          fontFamily: "sans-serif",
        }}
      >
        Scroll or pinch to zoom, drag to pan.
      </p>
    </div>
  );
}
