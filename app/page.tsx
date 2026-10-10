"use client";

import { useEffect, useState } from "react";

export default function Page() {
const [symbol, setSymbol] = useState("1HZ10V");
const [digits, setDigits] = useState<number[]>([]);
const [status, setStatus] = useState("Connecting to Deriv...");
const [ticks, setTicks] = useState(0);

useEffect(() => {
const ws = new WebSocket(
"wss://ws.derivws.com/websockets/v3?app_id=1089"
);

ws.onopen = () => {
  setStatus("Connected");
  ws.send(JSON.stringify({
    ticks_history: symbol,
    count: 1,
    end: "latest",
    style: "ticks"
  }));
  ws.send(JSON.stringify({
    ticks: symbol,
    subscribe: 1
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.tick) {
    const digit = Number(
      String(data.tick.quote).slice(-1)
    );
    setDigits((old) => [...old, digit].slice(-100));
    setTicks((old) => old + 1);
  }
  if (data.error) setStatus(data.error.message);
};

ws.onerror = () => setStatus("Connection error");
ws.onclose = () => setStatus("Disconnected");

return () => ws.close();

}, [symbol]);

const counts = Array.from({ length: 10 }, (_, i) =>
digits.filter((d) => d === i).length
);

return (
<main style={{
minHeight: "100vh",
background: "#100b18",
color: "#fff",
padding: 20,
fontFamily: "Arial"
}}>
<h1 style={{ color: "#ff3d9a" }}>
Pulse Deriv Analyzer
</h1>
<p>Market status: {status}</p>

  <label>Choose market: </label>
  <select value={symbol}
    onChange={(e) => {
      setSymbol(e.target.value);
      setDigits([]);
      setTicks(0);
    }}
    style={{ padding: 10, margin: 10 }}>
    <option value="1HZ10V">Volatility 10 (1s)</option>
    <option value="1HZ25V">Volatility 25 (1s)</option>
    <option value="1HZ50V">Volatility 50 (1s)</option>
    <option value="1HZ75V">Volatility 75 (1s)</option>
    <option value="1HZ100V">Volatility 100 (1s)</option>
    <option value="R_10">Volatility 10</option>
    <option value="R_25">Volatility 25</option>
    <option value="R_50">Volatility 50</option>
    <option value="R_75">Volatility 75</option>
    <option value="R_100">Volatility 100</option>
  </select>

  <h2 style={{ color: "#8cffb0" }}>
    Digit Analysis — {ticks} ticks
  </h2>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 8
  }}>
    {counts.map((count, digit) => (
      <div key={digit} style={{
        background: "#25172f",
        border: "1px solid #ff3d9a",
        borderRadius: 10,
        padding: 12,
        textAlign: "center"
      }}>
        <strong style={{ fontSize: 24, color: "#8cffb0" }}>
          {digit}
        </strong>
        <p>{count} hits</p>
        <small>
          {digits.length
            ? ((count / digits.length) * 100).toFixed(1)
            : "0.0"}%
        </small>
      </div>
    ))}
  </div>

  <h2>Recent digits</h2>
  <p style={{ overflowWrap: "anywhere", color: "#8cffb0" }}>
    {digits.slice(-30).join(" · ") || "Waiting for ticks..."}
  </p>

  <p style={{ color: "#aaa" }}>
    Statistical analysis only. Digits are not guaranteed
    predictions. No trades are placed by this analyzer.
  </p>
</main>

);
                }
