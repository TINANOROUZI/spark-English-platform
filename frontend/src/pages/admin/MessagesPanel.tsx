import { useState } from "react";
import { useAdminMutations, useMessageList } from "../../api/hooks";
import { fmtDate } from "../../lib/format";
import Pager from "./Pager";

export default function MessagesPanel({ token }: { token: string }) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const q = useMessageList(token, { unreadOnly, page });
  const m = useAdminMutations(token);

  return (
    <section aria-label="Messages">
      <div className="toolbar">
        <label className="check"><input type="checkbox" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} /> Unread only</label>
      </div>
      <div className="admin-panel">
        {q.isError && <p className="admin-error">Couldn't load messages: {q.error.message}</p>}
        {q.data && q.data.items.length === 0 && <p className="admin-empty">No messages.</p>}
        {q.data && q.data.items.length > 0 && (
          <table>
            <thead><tr><th>Submitted</th><th>From</th><th>Message</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {q.data.items.map((x) => (
                <tr key={x.id} className={x.isRead ? "" : "unread"}>
                  <td>{fmtDate(x.createdAt)}</td>
                  <td>{!x.isRead && <span className="dot" aria-label="Unread" />}{x.name}<br /><a href={`mailto:${x.email}`}>{x.email}</a></td>
                  <td className="wrap">{x.message}</td>
                  <td className="actions">
                    <button className="chip" onClick={() => m.setMessageRead.mutate({ id: x.id, isRead: !x.isRead })}>{x.isRead ? "Mark unread" : "Mark read"}</button>
                    <button className="chip danger" onClick={() => confirm(`Delete message from ${x.name}?`) && m.deleteMessage.mutate(x.id)}>Delete</button>
                  </td>
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
