import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const App = () => {
  // 3. ユーザー操作: スライダーの状態管理
  const [cx, setCx] = useState(-1.0);
  const [cy, setCy] = useState(-1.0);
  const [epsilon, setEpsilon] = useState(0.0); // 0のときは線形
  const [solution, setSolution] = useState({ x: 0, y: 0 });

  // 最適化APIを叩く
  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const response = await axios.post('http://localhost:8000/optimize', {
          cx: parseFloat(cx),
          cy: parseFloat(cy),
          epsilon: parseFloat(epsilon),
        });
        setSolution(response.data);
      } catch (error) {
        console.error("Optimization error", error);
      }
    };
    fetchSolution();
  }, [cx, cy, epsilon]);

  // 4. 表示内容: 等高線データの生成
  const contourData = useMemo(() => {
    const size = 100;
    const x = [];
    const y = [];
    const z = [];

    // -0.2 ~ 1.2 の範囲でグリッドを作成（可視化用）
    for (let i = 0; i < size; i++) {
      const val = -0.2 + (1.4 * i) / size;
      x.push(val);
      y.push(val);
    }

    for (let j = 0; j < size; j++) {
      const row = [];
      for (let i = 0; i < size; i++) {
        const xi = x[i];
        const yi = y[j];
        // 目的関数の値を計算 Z = cx*x + cy*y + (eps/2)(x^2+y^2)
        const val = cx * xi + cy * yi + (epsilon / 2.0) * (xi * xi + yi * yi);
        row.push(val);
      }
      z.push(row);
    }
    return { x, y, z };
  }, [cx, cy, epsilon]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>最適化シミュレーター: 線形 vs 二乗項</h1>
      
      {/* 5. 説明文エリア */}
      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>💡 直感ガイド</h3>
        <p>
          <strong>線形 (ε=0):</strong> 「平らな坂道」。ボールは壁や角（端っこ）まで転がります。<br />
          <strong>二乗項あり (ε>0):</strong> 「お椀」。中心に戻ろうとする力が働き、極端な値を避けやすくなります。<br />
          スライダーを動かして、赤い点（最適解）がどう動くか観察してください。
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* コントロールパネル */}
        <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>パラメータ操作</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Cx (X方向の傾き):</strong> {cx}</label>
            <input 
              type="range" min="-2" max="2" step="0.1" value={cx} 
              onChange={e => setCx(e.target.value)} style={{ width: '100%' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label><strong>Cy (Y方向の傾き):</strong> {cy}</label>
            <input 
              type="range" min="-2" max="2" step="0.1" value={cy} 
              onChange={e => setCy(e.target.value)} style={{ width: '100%' }} 
            />
          </div>

          <div style={{ marginBottom: '20px', borderTop: '2px solid #eee', paddingTop: '10px' }}>
            <label><strong>ε (イプシロン / お椀の深さ):</strong> {epsilon}</label>
            <br/>
            <span style={{fontSize: '0.8em', color: '#666'}}>
              {epsilon == 0 ? "現在は「線形計画」モードです" : "現在は「二乗項（正則化）」モードです"}
            </span>
            <input 
              type="range" min="0" max="5" step="0.1" value={epsilon} 
              onChange={e => setEpsilon(e.target.value)} style={{ width: '100%' }} 
            />
          </div>

          <div style={{ marginTop: '30px', backgroundColor: '#eef', padding: '10px', borderRadius: '5px' }}>
            <h4>📍 現在の最適解</h4>
            <p>x = {solution.x.toFixed(4)}</p>
            <p>y = {solution.y.toFixed(4)}</p>
          </div>
        </div>

        {/* グラフエリア */}
        <div style={{ flex: 2, minWidth: '400px' }}>
          <Plot
            data={[
              // 1. 等高線 (Contour)
              {
                z: contourData.z,
                x: contourData.x,
                y: contourData.y,
                type: 'contour',
                colorscale: 'Viridis',
                contours: {
                  showlabels: true,
                },
                line: { width: 0.5 },
                opacity: 0.3,
                name: '目的関数'
              },
              // 2. 制約領域 (三角形)
              {
                x: [0, 1, 0, 0],
                y: [0, 0, 1, 0],
                fill: 'toself',
                type: 'scatter',
                mode: 'lines',
                name: '可行領域',
                fillcolor: 'rgba(255, 0, 0, 0.1)',
                line: { color: 'red', width: 2 }
              },
              // 3. 最適解 (点)
              {
                x: [solution.x],
                y: [solution.y],
                type: 'scatter',
                mode: 'markers',
                marker: { color: 'red', size: 12, symbol: 'x' },
                name: '最適解'
              }
            ]}
            layout={{
              width: 500,
              height: 500,
              title: epsilon == 0 ? '線形目的関数 (等高線は直線)' : '二乗項付き目的関数 (等高線は楕円)',
              xaxis: { range: [-0.2, 1.2], title: 'x' },
              yaxis: { range: [-0.2, 1.2], title: 'y', scaleanchor: "x" },
              shapes: [
                // 参考: x+y=1の補助線などを引く場合はここ
              ]
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;