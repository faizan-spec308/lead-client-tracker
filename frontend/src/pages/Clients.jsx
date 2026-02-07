import { useEffect, useState } from "react";
import api from "../api";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>Clients</h1>

      {errorMsg && <div style={{ color: "crimson" }}>{errorMsg}</div>}
      {loading ? (
        <div>Loading clients...</div>
      ) : clients.length === 0 ? (
        <div>No clients yet.</div>
      ) : (
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Name</th>
              <th align="left">Email</th>
              <th align="left">Phone</th>
              <th align="left">Lead ID</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "-"}</td>
                <td>{c.source_lead_id || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={fetchClients} disabled={loading}>
          Refresh
        </button>
      </div>
    </div>
  );
}
