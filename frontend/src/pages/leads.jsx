import { useEffect, useState } from "react";
import axios from "axios";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:8000/leads");
        setLeads(res.data);
      } catch (err) {
        setError(err?.message || "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading leads...</div>;
  if (error) return <div style={{ padding: 16, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Leads</h1>

      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.id}</td>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone ?? "-"}</td>
                <td>{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
