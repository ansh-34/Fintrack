import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "salary", "freelance", "investments", "rent", "utilities",
  "groceries", "entertainment", "transport", "healthcare",
  "education", "food", "shopping", "travel", "other",
];

const PAYMENT_METHODS = [
  "cash", "credit_card", "debit_card", "bank_transfer", "upi", "other",
];

const EMPTY_FORM = {
  amount: "",
  type: "expense",
  category: "other",
  date: new Date().toISOString().split("T")[0],
  description: "",
  merchant: "",
  paymentMethod: "cash",
  tags: "",
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "analyst";

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, type: "", category: "", search: "" });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 15 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (tx) => {
    setForm({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date?.split("T")[0] || "",
      description: tx.description || "",
      merchant: tx.merchant || "",
      paymentMethod: tx.paymentMethod || "cash",
      tags: (tx.tags || []).join(", "),
    });
    setEditingId(tx._id);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (editingId) {
        await api.patch(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="page-title" style={{ margin: 0 }}>Transactions</h2>
        {canWrite && (
          <button className="btn btn-success" onClick={openCreate}>
            + New Transaction
          </button>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Tags</th>
                  {canWrite && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite ? 9 : 8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td>{tx.description || "-"}</td>
                      <td>{tx.merchant || "-"}</td>
                      <td style={{ textTransform: "capitalize" }}>{tx.category}</td>
                      <td>
                        <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>
                        {(tx.paymentMethod || "").replace("_", " ")}
                      </td>
                      <td style={{ fontWeight: 600 }}>Rs. {tx.amount.toLocaleString()}</td>
                      <td>
                        {(tx.tags || []).map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </td>
                      {canWrite && (
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(tx)} style={{ marginRight: "0.3rem" }}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tx._id)}>
                            Del
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {meta.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Prev
                </button>
                <span style={{ padding: "0.4rem", fontSize: "0.85rem" }}>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={filters.page >= meta.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Transaction" : "New Transaction"}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Merchant</label>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid #ddd", borderRadius: "6px", resize: "vertical" }}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. essential, recurring"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
