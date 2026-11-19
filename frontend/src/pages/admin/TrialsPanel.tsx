import { useEffect, useState } from "react";
import { useAdminMutations, useTrialList } from "../../api/hooks";
import { TRIAL_STATUSES, type TrialStatus } from "../../api/types";
import { fmtDate } from "../../lib/format";
import Pager from "./Pager";

export default function TrialsPanel({ token }: { token: string }) {
  const [status, setStatus] = useState<TrialStatus | "">("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { const h = setTimeout(() => { setDebounced(search); setPage(1); }, 300); return () => clearTimeout(h); }, [search]);

  const q = useTrialList(token, { status, search: debounced, page });
  const m = useAdminMutations(token);

  return (
    <section aria-label="Trial requests">
      <div className="toolbar">
        <input type="search" placeholder="Search name or email…" aria-label="Search trial requests" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value as TrialStatus | ""); setPage(1); }}>
          <option value="">All statuses</option>
          {TRIAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="admin-panel">
        {q.isError && <p className="admin-error">Couldn't load trial requests: {q.error.message}</p>}
        {q.data && q.data.items.length === 0 && <p className="admin-empty">No trial requests match.</p>}
        {q.data && q.data.items.length > 0 && (
          <table>
            <thead><tr><th>Submitted</th><th>Parent</th><th>Child</th><th>Course</th><th>Time</th><th>Notes</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {q.data.items.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td>{r.parentName}<br /><a href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td>{r.childAge ?? "–"}</td>
                  <td>{r.courseTitle ?? "–"}</td>
                  <td>{r.preferredTime ?? "–"}</td>
                  <td className="wrap">{r.notes}</td>
                  <td>
                    <select className={`status status-${r.status}`} aria-label={`Status for ${r.parentName}`} value={r.status}
                      onChange={(e) => m.setTrialStatus.mutate({ id: r.id, status: e.target.value as TrialStatus })}>
                      {TRIAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="chip danger" onClick={() => confirm(`Delete request from ${r.parentName}?`) && m.deleteTrial.mutate(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {q.isPending && <p className="admin-empty">Loading…</p>}
      </div>
      {q.data && <Pager data={q.data} onPage={setPage} />}
    </section>
  );
}
