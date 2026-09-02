// src/PanZoomChart.jsx
//
// Wraps any chart (or other content) in a pan/zoom viewport: scroll or
// pinch to zoom, drag to pan, like a map. Drops in around an existing
// Recharts <ResponsiveContainer> with no changes needed to the chart
// itself — the library transforms a content layer via CSS, so Recharts
// still measures and renders its parent at normal (untransformed) size.
//
// Built on react-zoom-pan-pinch instead of a hand-rolled implementation:
// cross-browser wheel/trackpad-pinch/touch-pinch handling is genuinely
// fiddly to get exactly right (see the previous version's issues), and
// it's exactly the kind of thing a mature, widely-used library has
// already solved rather than us re-solving it ourselves.

import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function Controls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const btnStyle = {
    width: 30,
    height: 30,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "sans-serif",
    background: "#fff",
    color: "#3D1580",
    border: "1.5px solid #C9B8E8",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 2,
        display: "flex",
        gap: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        borderRadius: 6,
      }}
    >
      <button
        type='button'
        onClick={() => zoomOut()}
        title='Zoom out'
        style={{ ...btnStyle, borderRadius: "6px 0 0 6px" }}
      >
        −
      </button>
      <button
        type='button'
        onClick={() => resetTransform()}
        title='Reset view'
        style={{ ...btnStyle, borderRadius: 0, fontSize: 12 }}
      >
        Reset
      </button>
      <button
        type='button'
        onClick={() => zoomIn()}
        title='Zoom in'
        style={{ ...btnStyle, borderRadius: "0 6px 6px 0" }}
      >
        +
      </button>
    </div>
  );
}

export default function PanZoomChart({ children, height = 380 }) {
  return (
    <div style={{ position: "relative" }}>
      <TransformWrapper
        initialScale={1}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        limitToBounds={true}
      >
        <Controls />
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height,
            border: "1.5px solid #E8E0F5",
            borderRadius: 12,
            background: "#fff",
          }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          {children}
        </TransformComponent>
      </TransformWrapper>

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
