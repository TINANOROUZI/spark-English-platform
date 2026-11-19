import type { Paged } from "../../api/types";

export default function Pager({ data, onPage }: { data: Paged<unknown>; onPage: (p: number) => void }) {
  if (data.totalPages <= 1) return null;
  return (
    <div className="pager">
      <button className="chip" disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>← Prev</button>
      <span>Page {data.page} of {data.totalPages}</span>
      <button className="chip" disabled={data.page >= data.totalPages} onClick={() => onPage(data.page + 1)}>Next →</button>
    </div>
  );
}
