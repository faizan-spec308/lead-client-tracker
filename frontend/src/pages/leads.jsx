import { useEffect, useMemo, useState } from "react";
import api from "../api";

const initialForm = { name: "", email: "", phone: "", status: "Lead" };

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
    errors.email = "Email format looks invalid";

  // phone optional (keep simple)
  // status optional but we keep one
  return errors;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState(""); // success
  const [errorMsg, setErrorMsg] = useState(""); // error

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const isEdit = mode === "edit";

  const resetMessages = () => {
    setMessage("");
    setErrorMsg("");
  };

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      resetMessages();
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);


const filteredLeads = leads.filter((l) => {
  const term = search.trim().toLowerCase();

  const matchesText =
    !term ||
    (l.name ?? "").toLowerCase().includes(term) ||
    (l.email ?? "").toLowerCase().includes(term);

  const matchesStatus =
    statusFilter === "ALL" ||
    (l.status ?? "").toLowerCase() === statusFilter.toLowerCase();

  return matchesText && matchesStatus;
});

const onChange = (key) => (e) => {
  resetMessages();
  setForm((prev) => ({ ...prev, [key]: e.target.value }));
};


  const startEdit = (lead) => {
    resetMessages();
    setMode("edit");
    setEditingId(lead.id);
    setForm({
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      status: lead.status ?? "Lead",
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConvert = async (id) => {
  resetMessages();
  try {
    setSubmitting(true);
    await api.post(`/leads/${id}/convert`);
    setMessage("Lead converted to client");

    // easiest + safest: refetch leads so status updates
    await fetchLeads();
  } catch (err) {
    setErrorMsg(err?.response?.data?.detail || "Convert failed");
  } finally {
    setSubmitting(false);
  }
};


  const cancelEdit = () => {
    resetMessages();
    setMode("create");
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
  };

  // Only send changed fields on edit (higher quality)
  const editPayload = useMemo(() => {
    if (!isEdit) return null;
    const original = leads.find((x) => x.id === editingId);
    if (!original) return null;

    const patch = {};
    if ((form.name ?? "") !== (original.name ?? "")) patch.name = form.name;
    if ((form.email ?? "") !== (original.email ?? "")) patch.email = form.email;
    if ((form.phone ?? "") !== (original.phone ?? "")) patch.phone = form.phone;
    if ((form.status ?? "Lead") !== (original.status ?? "Lead")) patch.status = form.status;

    return patch;
  }, [isEdit, editingId, form, leads]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setSubmitting(true);

      if (!isEdit) {
        // CREATE
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
        };
        await api.post("/leads", payload);
        setMessage("Lead created");
        setForm(initialForm);
        await fetchLeads(); // consistent state
        return;
      }

      // EDIT
      if (!editingId) {
        setErrorMsg("No lead selected to edit");
        return;
      }

      // If nothing changed, don’t spam the API
      if (!editPayload || Object.keys(editPayload).length === 0) {
        setMessage("No changes to save");
        return;
      }

      const res = await api.put(`/leads/${editingId}`, editPayload);

      // Update list locally (fast + correct)
      setLeads((prev) => prev.map((x) => (x.id === editingId ? res.data : x)));

      setMessage("Lead updated");
      cancelEdit();
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    resetMessages();
    try {
      setDeletingId(id);
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((x) => x.id !== id));
      setMessage("Lead deleted");
      if (editingId === id) cancelEdit();
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>Leads</h1>

      {/* Alerts */}
      {message && (
        <div style={{ padding: 10, marginBottom: 12, border: "1px solid #ccc" }}>
          {message}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: 10, marginBottom: 12, border: "1px solid #f99", color: "crimson" }}>
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <div style={{ padding: 12, border: "1px solid #ddd", marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>{isEdit ? `Edit Lead #${editingId}` : "Add Lead"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Name</label>
              <input
                style={{ width: "100%", padding: 8 }}
                value={form.name}
                onChange={onChange("name")}
              />
              {errors.name && <div style={{ color: "crimson" }}>{errors.name}</div>}
            </div>

            <div>
              <label>Email</label>
              <input
                style={{ width: "100%", padding: 8 }}
                value={form.email}
                onChange={onChange("email")}
              />
              {errors.email && <div style={{ color: "crimson" }}>{errors.email}</div>}
            </div>

            <div>
              <label>Phone (optional)</label>
              <input
                style={{ width: "100%", padding: 8 }}
                value={form.phone}
                onChange={onChange("phone")}
              />
            </div>

            <div>
              <label>Status</label>
              <select style={{ width: "100%", padding: 8 }} value={form.status} onChange={onChange("status")}>
                <option value="Lead">Lead</option>
                <option value="Converted">Converted</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Customer">Customer</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button disabled={submitting} style={{ padding: "8px 12px" }}>
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Create lead"}
            </button>

            {isEdit && (
              <button type="button" onClick={cancelEdit} disabled={submitting} style={{ padding: "8px 12px" }}>
                Cancel
              </button>
            )}
          </div>

          {isEdit && editPayload && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              {Object.keys(editPayload).length === 0
                ? "No changes detected."
                : `Changes to save: ${Object.keys(editPayload).join(", ")}`}
            </div>
          )}
        </form>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by name or email..."
    style={{ padding: 8, flex: 1 }}
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={{ padding: 8 }}
  >
    <option value="ALL">All</option>
    <option value="Lead">Lead</option>
    <option value="Converted">Converted</option>
    <option value="Contacted">Contacted</option>
    <option value="Qualified">Qualified</option>
    <option value="Customer">Customer</option>
    <option value="Lost">Lost</option>

  </select>

  <button
    type="button"
    onClick={() => {
      setSearch("");
      setStatusFilter("ALL");
    }}
    style={{ padding: 8 }}
  >
    Clear
  </button>
</div>



      {/* List */}
      <div style={{ padding: 12, border: "1px solid #ddd" }}>
        <h2 style={{ marginTop: 0 }}>All Leads</h2>

        {loadingLeads ? (
          <div>Loading leads...</div>
        ) : leads.length === 0 ? (
          <div>No leads found.</div>
        ) : (
          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">ID</th>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Phone</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{lead.id}</td>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone || "-"}</td>
                  <td>{lead.status}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(lead)} disabled={submitting || deletingId === lead.id}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={deletingId === lead.id || submitting}
                    >
                      {deletingId === lead.id ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() => handleConvert(lead.id)}
                      disabled={deletingId === lead.id || submitting}
                    >
                      Convert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 10 }}>
          <button onClick={fetchLeads} disabled={loadingLeads}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
