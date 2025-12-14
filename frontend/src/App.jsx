import React, { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const App = () => {
  const [cx, setCx] = useState(-1.0);
  const [cy, setCy] = useState(-1.0);
  const [epsilon, setEpsilon] = useState(0.0);
  const [solution, setSolution] = useState({
    x: 0,
    y: 0,
    objective_value: 0,
    success: false,
  });

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const response = await axios.post("http://localhost:8000/optimize", {
          cx: Number(cx) || 0,
          cy: Number(cy) || 0,
          epsilon: Number(epsilon) || 0,
        });
        setSolution(response.data);
      } catch (error) {
        console.error("Optimization error", error);
        setSolution({ x: 0, y: 0, objective_value: 0, success: false });
      }
    };
    fetchSolution();
  }, [cx, cy, epsilon]);

  const contourData = useMemo(() => {
    const size = 110;
    const x = [];
    const y = [];
    const z = [];

    for (let i = 0; i < size; i++) {
      const val = -0.2 + (1.4 * i) / (size - 1);
      x.push(val);
      y.push(val);
    }

    const eps = Number(epsilon) || 0;
    const ccx = Number(cx) || 0;
    const ccy = Number(cy) || 0;

    for (let j = 0; j < size; j++) {
      const row = [];
      for (let i = 0; i < size; i++) {
        const xi = x[i];
        const yi = y[j];
        const val = ccx * xi + ccy * yi + (eps / 2.0) * (xi * xi + yi * yi);
        row.push(val);
      }
      z.push(row);
    }
    return { x, y, z };
  }, [cx, cy, epsilon]);

  const eps = Number(epsilon) || 0;
  const isLinear = eps === 0;

  const xSol = Number.isFinite(solution?.x) ? solution.x : 0;
  const ySol = Number.isFinite(solution?.y) ? solution.y : 0;

  const linearPart = (Number(cx) * xSol + Number(cy) * ySol) || 0;
  const quadPart = eps > 0 ? (eps / 2.0) * (xSol * xSol + ySol * ySol) : 0;

  const formulaText = `min: ${Number(cx).toFixed(1)}·x ${
    Number(cy) >= 0 ? "+" : "-"
  } ${Math.abs(Number(cy)).toFixed(1)}·y${
    eps > 0 ? ` + (${eps.toFixed(1)}/2)·(x² + y²)` : ""
  }`;

  const styles = {
    page: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      background: "#0b0f17",
      color: "#e8eefc",
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: 0,
    },
    container: {
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
      padding: "20px 16px 28px",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    titleWrap: { display: "flex", flexDirection: "column", gap: 6 },
    h1: { margin: 0, fontSize: 20, letterSpacing: 0.2 },
    sub: { margin: 0, fontSize: 13, color: "rgba(232,238,252,0.75)" },
    chip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontSize: 12,
      color: "rgba(232,238,252,0.90)",
      whiteSpace: "nowrap",
    },
    dot: (ok) => ({
      width: 8,
      height: 8,
      borderRadius: 99,
      background: ok ? "#29d391" : "#f3b94a",
      boxShadow: `0 0 0 4px rgba(255,255,255,0.06)`,
    }),

    grid: {
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 14,
      alignItems: "start",
      width: "100%",
    },

    card: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
    cardPad: { padding: 14 },

    sidebar: {
      position: "sticky",
      top: 14,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },

    sectionTitle: {
      margin: "0 0 10px",
      fontSize: 13,
      color: "rgba(232,238,252,0.85)",
      letterSpacing: 0.2,
    },

    sliderRow: { display: "grid", gap: 8, marginBottom: 14 },
    sliderHead: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10,
    },
    label: { fontSize: 13, color: "rgba(232,238,252,0.90)" },
    value: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
    range: { width: "100%" },

    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },
    kpi: {
      padding: 12,
      borderRadius: 14,
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.10)",
    },
    kpiLabel: { fontSize: 11, color: "rgba(232,238,252,0.65)", margin: 0 },
    kpiValue: { fontSize: 18, margin: "4px 0 0", letterSpacing: 0.2 },

    plotWrap: {
      minHeight: 520,
      padding: 12,
    },
    plotInner: {
      height: 520,
      borderRadius: 14,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.18)",
    },

    details: {
      marginTop: 12,
      padding: 12,
      borderRadius: 14,
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.10)",
    },
    summary: {
      cursor: "pointer",
      fontSize: 13,
      color: "rgba(232,238,252,0.90)",
      listStyle: "none",
      outline: "none",
    },
    code: {
      display: "block",
      marginTop: 8,
      padding: 10,
      borderRadius: 12,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "rgba(232,238,252,0.90)",
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 12,
      overflowX: "auto",
    },

    ok: { color: "#29d391" },
    ng: { color: "#ff6b6b" },

    // レスポンシブ対応
    responsive: `
      @media (max-width: 920px) {
        .grid { grid-template-columns: 1fr; }
        .plotInner { height: 460px; }
        .sidebar { position: static; }
      }
      @media (min-width: 1400px) {
        .grid { grid-template-columns: 380px 1fr; }
      }
    `,
  };

  return (
    <div style={styles.page}>
      <style>{styles.responsive}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h1 style={styles.h1}>最適化シミュレーター</h1>
            <p style={styles.sub}>
              線形(ε=0) と二乗項(ε&gt;0) の最適解の動きを同じ画面で確認
            </p>
          </div>

          <div style={styles.chip}>
            <span style={styles.dot(isLinear)} />
            {isLinear ? "Linear mode" : "Quadratic mode"}
          </div>
        </div>

        <div className="grid" style={styles.grid}>
          {/* 左：操作＆結果 */}
          <div style={styles.sidebar} className="sidebar">
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h3 style={styles.sectionTitle}>パラメータ</h3>

              <div style={styles.sliderRow}>
                <div style={styles.sliderHead}>
                  <div style={styles.label}>Cx（X方向の傾き）</div>
                  <div style={styles.value}>{Number(cx).toFixed(1)}</div>
                </div>
                <input
                  style={styles.range}
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={cx}
                  onChange={(e) => setCx(parseFloat(e.target.value))}
                />
              </div>

              <div style={styles.sliderRow}>
                <div style={styles.sliderHead}>
                  <div style={styles.label}>Cy（Y方向の傾き）</div>
                  <div style={styles.value}>{Number(cy).toFixed(1)}</div>
                </div>
                <input
                  style={styles.range}
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={cy}
                  onChange={(e) => setCy(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ ...styles.sliderRow, marginBottom: 0 }}>
                <div style={styles.sliderHead}>
                  <div style={styles.label}>ε（お椀の深さ）</div>
                  <div style={styles.value}>{Number(epsilon).toFixed(1)}</div>
                </div>
                <input
                  style={styles.range}
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h3 style={styles.sectionTitle}>現在の最適解</h3>

              <div style={styles.kpiGrid}>
                <div style={styles.kpi}>
                  <p style={styles.kpiLabel}>x</p>
                  <p style={styles.kpiValue}>{xSol.toFixed(4)}</p>
                </div>
                <div style={styles.kpi}>
                  <p style={styles.kpiLabel}>y</p>
                  <p style={styles.kpiValue}>{ySol.toFixed(4)}</p>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 12 }}>
                <span style={solution?.success ? styles.ok : styles.ng}>
                  {solution?.success ? "✓ 最適化成功" : "✗ 最適化失敗"}
                </span>
              </div>
            </div>
          </div>

          {/* 右：グラフ＆検証 */}
          <div style={{ ...styles.card, ...styles.plotWrap }}>
            <div style={styles.plotInner}>
              <Plot
                data={[
                  {
                    z: contourData.z,
                    x: contourData.x,
                    y: contourData.y,
                    type: "contour",
                    colorscale: "Viridis",
                    contours: { showlabels: true },
                    line: { width: 0.5 },
                    opacity: 0.30,
                    name: "目的関数",
                  },
                  {
                    x: [0, 1, 0, 0],
                    y: [0, 0, 1, 0],
                    fill: "toself",
                    type: "scatter",
                    mode: "lines",
                    showlegend: false,
                    fillcolor: "rgba(255, 80, 80, 0.12)",
                    line: { color: "rgba(255, 80, 80, 0.95)", width: 2 },
                  },
                  {
                    x: [xSol],
                    y: [ySol],
                    type: "scatter",
                    mode: "markers",
                    showlegend: false,
                    marker: { color: "rgba(255, 80, 80, 0.95)", size: 12, symbol: "x" },
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 48, r: 18, t: 44, b: 44 },
                  title: {
                    text: isLinear
                      ? "線形目的関数（等高線は直線）"
                      : "二乗項付き（等高線は楕円）",
                    font: { size: 14, color: "rgba(232,238,252,0.92)" },
                  },
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(0,0,0,0)",
                  xaxis: {
                    range: [-0.2, 1.2],
                    title: { text: "x", font: { color: "rgba(232,238,252,0.70)" } },
                    gridcolor: "rgba(255,255,255,0.08)",
                    zerolinecolor: "rgba(255,255,255,0.12)",
                    tickfont: { color: "rgba(232,238,252,0.70)" },
                  },
                  yaxis: {
                    range: [-0.2, 1.2],
                    title: { text: "y", font: { color: "rgba(232,238,252,0.70)" } },
                    scaleanchor: "x",
                    gridcolor: "rgba(255,255,255,0.08)",
                    zerolinecolor: "rgba(255,255,255,0.12)",
                    tickfont: { color: "rgba(232,238,252,0.70)" },
                  },
                  annotations: [
                    {
                      x: 0.05,
                      y: 1.1,
                      xref: "x",
                      yref: "y",
                      text: "制約領域",
                      showarrow: false,
                      font: { color: "rgba(255, 80, 80, 0.95)", size: 12 },
                      bgcolor: "rgba(0,0,0,0.35)",
                      bordercolor: "rgba(255, 80, 80, 0.7)",
                      borderwidth: 1,
                      borderpad: 4,
                    },
                    {
                      x: xSol,
                      y: ySol,
                      xref: "x",
                      yref: "y",
                      text: "最適解",
                      showarrow: true,
                      arrowhead: 2,
                      arrowcolor: "rgba(255, 80, 80, 0.95)",
                      arrowwidth: 2,
                      ax: 0,
                      ay: -30,
                      font: { color: "rgba(255, 80, 80, 0.95)", size: 12 },
                      bgcolor: "rgba(0,0,0,0.35)",
                      bordercolor: "rgba(255, 80, 80, 0.7)",
                      borderwidth: 1,
                      borderpad: 4,
                    },
                  ],
                }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <details style={styles.details}>
              <summary style={styles.summary}>📐 定式化の検証（クリックで展開）</summary>

              <code style={styles.code}>{formulaText}</code>

              <div style={{ marginTop: 10, fontSize: 12, color: "rgba(232,238,252,0.80)" }}>
                <div>
                  <strong>目的関数値:</strong>{" "}
                  {Number.isFinite(solution?.objective_value)
                    ? solution.objective_value.toFixed(6)
                    : "計算中..."}
                </div>
                <div style={{ marginTop: 6, color: "rgba(232,238,252,0.65)" }}>
                  内訳: 線形項 = {linearPart.toFixed(4)}
                  {eps > 0 ? ` / 二次項 = ${quadPart.toFixed(4)}` : ""}
                </div>

                <div style={{ marginTop: 10 }}>
                  <strong>制約:</strong>
                  <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                    <span style={xSol >= 0 && xSol <= 1 ? styles.ok : styles.ng}>
                      0 ≤ x ≤ 1 : {xSol.toFixed(4)}
                    </span>
                    <span style={ySol >= 0 && ySol <= 1 ? styles.ok : styles.ng}>
                      0 ≤ y ≤ 1 : {ySol.toFixed(4)}
                    </span>
                    <span style={xSol + ySol <= 1 ? styles.ok : styles.ng}>
                      x + y ≤ 1 : {(xSol + ySol).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;