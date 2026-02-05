import { useEffect, useState } from "react";
import api from "../api";


const API_BASE = "http://localhost:8000";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state (controlled inputs)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLeads = async () => {
    try {
      setError("");
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (err) {
      setError(err?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createLead = async (e) => {
    e.preventDefault();

    // minimal validation (frontend)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill name, email, and phone.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/leads", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      // clear form
      setForm({ name: "", email: "", phone: "" });

      // refresh list
      await fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLead = async (id) => {
    try {
      setDeletingId(id);
      setError("");

      await await api.delete(`/leads/${id}`);

      // refresh list
      await fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Leads</h1>

      {/* Error */}
      {error && <div style={{ marginBottom: 12, color: "red" }}>{error}</div>}

      {/* Add Lead Form */}
      <form onSubmit={createLead} style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Add Lead</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            style={{ padding: 8, minWidth: 220 }}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            style={{ padding: 8, minWidth: 220 }}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={onChange}
            style={{ padding: 8, minWidth: 180 }}
          />

          <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
            {submitting ? "Adding..." : "Add Lead"}
          </button>
        </div>
      </form>

      {/* Loading / Table */}
      {loading ? (
        <div>Loading leads...</div>
      ) : leads.length === 0 ? (
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
              <th>Actions</th>
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
                <td>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={deletingId === lead.id}
                    style={{ padding: "6px 10px" }}
                  >
                    {deletingId === lead.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
