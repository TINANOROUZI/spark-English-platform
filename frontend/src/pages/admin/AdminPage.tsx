import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminStats } from "../../api/hooks";
import { useAuth } from "../../context/AuthContext";
import CoursesPanel from "./CoursesPanel";
import MessagesPanel from "./MessagesPanel";
import TrialsPanel from "./TrialsPanel";

type Tab = "trials" | "messages" | "courses";

function Stat({ label, value, hint }: { label: string; value?: number; hint?: string }) {
  return <div className="stat"><div className="stat-value">{value ?? "–"}</div><div className="stat-label">{label}</div>{hint && <div className="stat-hint">{hint}</div>}</div>;
}

export default function AdminPage() {
  const { auth, isAdmin, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("trials");

  if (!isAdmin || !auth) {
    return (
      <div className="admin-gate"><div>
        <h1>Admin access required</h1>
        <p>Log in with an admin account on the <Link to="/">main site</Link> first.</p>
      </div></div>
    );
  }
  return <Dashboard token={auth.token} name={auth.name} email={auth.email} tab={tab} setTab={setTab} logout={logout} />;
}

function Dashboard({ token, name, email, tab, setTab, logout }: { token: string; name: string; email: string; tab: Tab; setTab: (t: Tab) => void; logout: () => void }) {
  const stats = useAdminStats(token).data;
  const tabs: [Tab, string, number | undefined][] = [
    ["trials", "Trial requests", stats?.pendingTrialRequests],
    ["messages", "Messages", stats?.unreadMessages],
    ["courses", "Courses", undefined],
  ];
  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div><h1>Admin dashboard</h1><p className="muted">Signed in as {name} ({email})</p></div>
        <div className="actions"><Link className="chip" to="/">← Back to site</Link><button className="chip" onClick={logout}>Logout</button></div>
      </div>

      <div className="stats">
        <Stat label="Trial requests" value={stats?.trialRequests} hint={stats ? `${stats.pendingTrialRequests} pending` : undefined} />
        <Stat label="Messages" value={stats?.messages} hint={stats ? `${stats.unreadMessages} unread` : undefined} />
        <Stat label="Courses" value={stats?.courses} />
      </div>

      <div className="tabs" role="tablist">
        {tabs.map(([id, label, badge]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}{!!badge && <span className="badge-count">{badge}</span>}
          </button>
        ))}
      </div>

      {tab === "trials" && <TrialsPanel token={token} />}
      {tab === "messages" && <MessagesPanel token={token} />}
      {tab === "courses" && <CoursesPanel token={token} />}
    </div>
  );
}
