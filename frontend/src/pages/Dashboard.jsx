import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading dashboard...</div>;
  if (errorMsg) return <div style={{ padding: 16, color: "crimson" }}>{errorMsg}</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Card title="Total Leads" value={stats.total_leads} />
        <Card title="Converted Leads" value={stats.converted_leads} />
        <Card title="Clients" value={stats.clients} />
      </div>

      <button onClick={loadStats} style={{ marginTop: 16, padding: 8 }}>
        Refresh
      </button>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
