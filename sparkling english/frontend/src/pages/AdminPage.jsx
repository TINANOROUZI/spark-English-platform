import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { trialRequestApi, contactMessageApi } from "../api/client.js";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const { auth, isAdmin, logout } = useAuth();
  const [trialRequests, setTrialRequests] = useState(null);
  const [messages, setMessages] = useState(null);
  const [trialError, setTrialError] = useState("");
  const [messagesError, setMessagesError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    trialRequestApi.listAll(auth.token).then(setTrialRequests).catch((err) => setTrialError(err.message));
    contactMessageApi.listAll(auth.token).then(setMessages).catch((err) => setMessagesError(err.message));
  }, [isAdmin, auth?.token]);

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <div>
          <h1>Admin access required</h1>
          <p>Log in with an admin account on the <Link to="/">main site</Link> first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Admin dashboard</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>Signed in as {auth.name} ({auth.email})</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="chip" to="/">← Back to site</Link>
          <button className="chip" onClick={logout}>Logout</button>
        </div>
      </div>

      <h2>Trial requests {trialRequests && <span className="badge-count">{trialRequests.length}</span>}</h2>
      <div className="admin-panel">
        {trialError && <p className="admin-error">Couldn't load trial requests: {trialError}. Is the backend running?</p>}
        {!trialError && trialRequests && trialRequests.length === 0 && <p className="admin-empty">No trial requests yet.</p>}
        {!trialError && trialRequests && trialRequests.length > 0 && (
          <table>
            <thead>
              <tr><th>Submitted</th><th>Parent</th><th>Email</th><th>Age</th><th>Preferred time</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {trialRequests.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td>{r.parentName}</td>
                  <td>{r.email}</td>
                  <td>{r.childAge ?? ""}</td>
                  <td>{r.preferredTime}</td>
                  <td>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>Contact messages {messages && <span className="badge-count">{messages.length}</span>}</h2>
      <div className="admin-panel">
        {messagesError && <p className="admin-error">Couldn't load messages: {messagesError}. Is the backend running?</p>}
        {!messagesError && messages && messages.length === 0 && <p className="admin-empty">No messages yet.</p>}
        {!messagesError && messages && messages.length > 0 && (
          <table>
            <thead>
              <tr><th>Submitted</th><th>Name</th><th>Email</th><th>Message</th></tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>{fmtDate(m.createdAt)}</td>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
