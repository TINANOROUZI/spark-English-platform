import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminCourses, useAdminMutations } from "../../api/hooks";
import { DAYS, type Course, type CourseFormat, type DayName } from "../../api/types";

const FORMATS: CourseFormat[] = ["OneToOne", "MiniGroup", "Camp"];
const num = (min: number, max: number) => z.string().refine((v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max, `${min}–${max}`);
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, digits, dashes").max(60),
  format: z.enum(["OneToOne", "MiniGroup", "Camp"]),
  titleEn: z.string().min(1, "required"), titleIt: z.string().min(1, "required"),
  descriptionEn: z.string().max(1000), descriptionIt: z.string().max(1000),
  minAge: num(3, 18), maxAge: num(3, 18), durationMinutes: num(10, 600), maxStudents: num(1, 30),
  priceEur: z.string().refine((v) => v === "" || Number(v) >= 0, "≥ 0"),
  isPopular: z.boolean(), isActive: z.boolean(),
}).refine((v) => Number(v.maxAge) >= Number(v.minAge), { path: ["maxAge"], message: "≥ min age" });
type Values = z.infer<typeof schema>;

const toValues = (c?: Course): Values => ({
  slug: c?.slug ?? "", format: c?.format ?? "MiniGroup", titleEn: c?.titleEn ?? "", titleIt: c?.titleIt ?? "",
  descriptionEn: c?.descriptionEn ?? "", descriptionIt: c?.descriptionIt ?? "",
  minAge: String(c?.minAge ?? 5), maxAge: String(c?.maxAge ?? 17), durationMinutes: String(c?.durationMinutes ?? 50), maxStudents: String(c?.maxStudents ?? 4),
  priceEur: c?.priceEur == null ? "" : String(c.priceEur), isPopular: c?.isPopular ?? false, isActive: c?.isActive ?? true,
});

function CourseForm({ course, token, onDone }: { course?: Course; token: string; onDone: () => void }) {
  const m = useAdminMutations(token);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(course) });
  const [err, setErr] = useState("");
  const e = (k: keyof Values) => errors[k]?.message && <small className="field-error">{errors[k]?.message as string}</small>;

  const onSubmit = handleSubmit(async (v) => {
    setErr("");
    try {
      await m.saveCourse.mutateAsync({
        id: course?.id,
        data: { ...v, minAge: +v.minAge, maxAge: +v.maxAge, durationMinutes: +v.durationMinutes, maxStudents: +v.maxStudents, priceEur: v.priceEur === "" ? null : +v.priceEur },
      });
      onDone();
    } catch (x) { setErr((x as Error).message); }
  });

  return (
    <form className="form course-form" onSubmit={onSubmit} noValidate>
      <div className="row"><label><span>Slug</span><input {...register("slug")} />{e("slug")}</label>
        <label><span>Format</span><select {...register("format")}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></label></div>
      <div className="row"><label><span>Title (EN)</span><input {...register("titleEn")} />{e("titleEn")}</label><label><span>Title (IT)</span><input {...register("titleIt")} />{e("titleIt")}</label></div>
      <div className="row"><label><span>Description (EN)</span><textarea rows={2} {...register("descriptionEn")} /></label><label><span>Description (IT)</span><textarea rows={2} {...register("descriptionIt")} /></label></div>
      <div className="row4">
        <label><span>Min age</span><input type="number" {...register("minAge")} />{e("minAge")}</label>
        <label><span>Max age</span><input type="number" {...register("maxAge")} />{e("maxAge")}</label>
        <label><span>Minutes</span><input type="number" {...register("durationMinutes")} />{e("durationMinutes")}</label>
        <label><span>Max students</span><input type="number" {...register("maxStudents")} />{e("maxStudents")}</label>
      </div>
      <div className="row"><label><span>Price € (empty = ask info)</span><input type="number" step="0.01" {...register("priceEur")} />{e("priceEur")}</label>
        <div className="checks"><label className="check"><input type="checkbox" {...register("isPopular")} /> Popular</label><label className="check"><input type="checkbox" {...register("isActive")} /> Active (visible)</label></div></div>
      <div className="toolbar"><button className="btn small" disabled={isSubmitting}>{course ? "Save changes" : "Create course"}</button><button type="button" className="chip" onClick={onDone}>Cancel</button></div>
      {err && <p className="form-result error" role="alert">{err}</p>}
    </form>
  );
}

function Schedules({ course, token }: { course: Course; token: string }) {
  const m = useAdminMutations(token);
  const [day, setDay] = useState<DayName>("Monday");
  const [time, setTime] = useState("16:00");
  const [cap, setCap] = useState(course.maxStudents);
  return (
    <div className="schedules">
      <strong>Schedules</strong>
      <ul>
        {course.schedules.length === 0 && <li className="muted">None yet</li>}
        {course.schedules.map((s) => (
          <li key={s.id}>{s.dayOfWeek} {s.startTime} · cap {s.capacity}
            <button className="chip danger" onClick={() => m.deleteSchedule.mutate({ courseId: course.id, id: s.id })} aria-label={`Delete ${s.dayOfWeek} ${s.startTime}`}>×</button></li>
        ))}
      </ul>
      <div className="toolbar">
        <select aria-label="Day" value={day} onChange={(e) => setDay(e.target.value as DayName)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
        <input type="time" aria-label="Start time" value={time} onChange={(e) => setTime(e.target.value)} />
        <input type="number" min={1} max={30} aria-label="Capacity" value={cap} onChange={(e) => setCap(+e.target.value)} style={{ width: 80 }} />
        <button className="chip" disabled={!time || m.addSchedule.isPending} onClick={() => m.addSchedule.mutate({ courseId: course.id, data: { dayOfWeek: day, startTime: time, capacity: cap, isActive: true } })}>+ Add slot</button>
      </div>
    </div>
  );
}

export default function CoursesPanel({ token }: { token: string }) {
  const q = useAdminCourses(token);
  const m = useAdminMutations(token);
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <section aria-label="Courses">
      <div className="toolbar"><button className="btn small" onClick={() => setEditing("new")}>+ New course</button></div>
      {editing === "new" && <div className="admin-panel pad"><CourseForm token={token} onDone={() => setEditing(null)} /></div>}
      {q.isError && <p className="admin-error">Couldn't load courses: {q.error.message}</p>}
      {q.isPending && <p className="admin-empty">Loading…</p>}
      {q.data?.map((c) => (
        <div className="admin-panel pad" key={c.id}>
          {editing === c.id ? <CourseForm course={c} token={token} onDone={() => setEditing(null)} /> : (
            <>
              <div className="course-head">
                <div><h3>{c.titleEn} <span className="muted">/ {c.titleIt}</span></h3>
                  <p className="muted">{c.format} · {c.slug} · ages {c.minAge}–{c.maxAge} · {c.durationMinutes} min · max {c.maxStudents} · {c.priceEur == null ? "ask info" : `€${c.priceEur}`}
                    {c.isPopular && " · ★ popular"}{!c.isActive && " · hidden"}</p></div>
                <div className="actions">
                  <button className="chip" onClick={() => setEditing(c.id)}>Edit</button>
                  <button className="chip danger" onClick={() => confirm(`Delete "${c.titleEn}" and its schedules?`) && m.deleteCourse.mutate(c.id)}>Delete</button>
                </div>
              </div>
              <Schedules course={c} token={token} />
            </>
          )}
        </div>
      ))}
    </section>
  );
}
