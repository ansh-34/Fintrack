import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>FinTrack</h2>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => (isActive ? "active" : "")}>
            Transactions
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
              Users
            </NavLink>
          )}
        </nav>
        <div className="user-info">
          <div>{user?.name}</div>
          <div className="role">{user?.role}</div>
        </div>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
