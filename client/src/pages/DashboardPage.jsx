import { useState, useEffect } from "react";
import api from "../api/client";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [sumRes, catRes, trendRes, recentRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/categories"),
        api.get("/dashboard/trends?months=6"),
        api.get("/dashboard/recent?limit=5"),
      ]);
      setSummary(sumRes.data);
      setCategories(catRes.data);
      setTrends(trendRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const maxTrendAmount = Math.max(
    ...trends.map((t) => Math.max(t.income, t.expense)),
    1
  );

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Total Income</div>
            <div className="value income">Rs. {summary.totalIncome.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Expenses</div>
            <div className="value expense">Rs. {summary.totalExpense.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="label">Net Balance</div>
            <div className="value balance">Rs. {summary.netBalance.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Records</div>
            <div className="value">{summary.totalRecords}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <h3>Monthly Trends</h3>
          {trends.map((t) => (
            <div key={t.month} style={{ marginBottom: "0.8rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.2rem" }}>
                {t.month}
              </div>
              <div className="trend-bar">
                <span style={{ fontSize: "0.7rem", width: "15px" }}>I</span>
                <div className="bar">
                  <div
                    className="bar-fill income"
                    style={{ width: `${(t.income / maxTrendAmount) * 100}%` }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", width: "80px", textAlign: "right" }}>
                  Rs. {t.income.toLocaleString()}
                </span>
              </div>
              <div className="trend-bar">
                <span style={{ fontSize: "0.7rem", width: "15px" }}>E</span>
                <div className="bar">
                  <div
                    className="bar-fill expense"
                    style={{ width: `${(t.expense / maxTrendAmount) * 100}%` }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", width: "80px", textAlign: "right" }}>
                  Rs. {t.expense.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card">
            <h3>Category Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {categories.slice(0, 10).map((c, i) => (
                  <tr key={i}>
                    <td style={{ textTransform: "capitalize" }}>{c.category}</td>
                    <td>
                      <span className={`badge badge-${c.type}`}>{c.type}</span>
                    </td>
                    <td>Rs. {c.total.toLocaleString()}</td>
                    <td>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Recent Activity</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.description || tx.merchant || tx.category}</td>
                    <td>Rs. {tx.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
