import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Field from "../components/Field";
import Select from "../components/Select";
import Reveal from "../components/Reveal";
import { ApiError } from "../api/client";
import { useSubmitTrial } from "../api/hooks";
import { useAuth } from "../context/AuthContext";
import { OWNER } from "../constants";
import { errorMessage, useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";
import { SELECT_COURSE_EVENT, courseTitle, slotLabel } from "../lib/courses";
import { fireConfetti } from "../lib/confetti";
import { useCourseList } from "../lib/useCourseList";

const schema = z.object({
  parentName: z.string().trim().min(1, "err_required").max(100),
  email: z.email("err_email"),
  childAge: z.string().refine((v) => { const n = Number(v); return v !== "" && Number.isInteger(n) && n >= 3 && n <= 18; }, "err_age"),
  preferredTime: z.enum(["afternoon", "evening", "weekend"]),
  courseId: z.string(),
  scheduleId: z.string(),
  notes: z.string().max(2000),
});
type Values = z.infer<typeof schema>;
const DEFAULTS: Values = { parentName: "", email: "", childAge: "", preferredTime: "afternoon", courseId: "", scheduleId: "", notes: "" };

export default function Contact() {
  const { t, lang } = useI18n();
  const { auth } = useAuth();
  const { courses, isFallback } = useCourseList();
  const submit = useSubmitTrial(auth?.token);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const { register, control, handleSubmit, reset, setValue, setError, watch, formState: { errors, isSubmitting } } =
    useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  const courseId = watch("courseId");
  const selectedCourse = courses.find((c) => String(c.id) === courseId);
  const slots = selectedCourse?.schedules ?? [];
  const tr = (m?: string) => (m ? t(m as CopyKey) : undefined);

  // Course cards / pricing buttons preselect a course.
  useEffect(() => {
    const onSelect = (e: Event) => { setValue("courseId", String((e as CustomEvent<number>).detail)); setValue("scheduleId", ""); };
    window.addEventListener(SELECT_COURSE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_COURSE_EVENT, onSelect);
  }, [setValue]);

  const onSubmit = handleSubmit(async (v) => {
    setResult(null);
    try {
      await submit.mutateAsync({
        parentName: v.parentName, email: v.email, childAge: Number(v.childAge), preferredTime: v.preferredTime,
        notes: v.notes.trim() || null,
        courseId: v.courseId ? Number(v.courseId) : null, scheduleId: v.scheduleId ? Number(v.scheduleId) : null,
      });
      setResult({ ok: true, text: t("form_ok") });
      reset(DEFAULTS);
      fireConfetti();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        Object.entries(err.fieldErrors).forEach(([field, msgs]) => { if (field in DEFAULTS) setError(field as keyof Values, { message: msgs[0] }); });
      }
      setResult({ ok: false, text: errorMessage(err, t) });
    }
  });

  return (
    <section id="contact" className="section section-cta">
      <Reveal className="container">
        <h2>{t("contact_title")}</h2>
        <p className="section-lead">{t("contact_sub")}</p>
        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="row">
            <Field label={t("form_name")} error={tr(errors.parentName?.message)}>
              <input type="text" autoComplete="name" placeholder="Alex Rossi" {...register("parentName")} />
            </Field>
            <Field label={t("form_email")} error={tr(errors.email?.message)}>
              <input type="email" autoComplete="email" placeholder="alex@email.com" {...register("email")} />
            </Field>
          </div>
          <div className="row">
            <Field label={t("form_age")} error={tr(errors.childAge?.message)}>
              <input type="number" inputMode="numeric" min={3} max={18} placeholder="10" {...register("childAge")} />
            </Field>
            <Controller control={control} name="preferredTime" render={({ field }) => (
              <Select label={t("form_time")} value={field.value} onChange={field.onChange} options={[
                { value: "afternoon", label: t("time_afternoon") },
                { value: "evening", label: t("time_evening") },
                { value: "weekend", label: t("time_weekend") },
              ]} />
            )} />
          </div>
          {!isFallback && courses.length > 0 && (
            <div className="row">
              <Controller control={control} name="courseId" render={({ field }) => (
                <Select label={t("form_course")} value={field.value} onChange={(v) => { field.onChange(v); setValue("scheduleId", ""); }}
                  options={[{ value: "", label: t("form_course_any") }, ...courses.map((c) => ({ value: String(c.id), label: courseTitle(c, lang) }))]} />
              )} />
              <Controller control={control} name="scheduleId" render={({ field }) => (
                <Select label={t("form_schedule")} value={field.value} onChange={field.onChange} disabled={slots.length === 0}
                  options={[{ value: "", label: t("form_schedule_any") }, ...slots.map((sl) => ({ value: String(sl.id), label: slotLabel(sl, lang) }))]} />
              )} />
            </div>
          )}
          <Field className="full" label={t("form_msg")} error={tr(errors.notes?.message)}>
            <textarea rows={4} placeholder="…" {...register("notes")} />
          </Field>
          <button className="btn big" type="submit" disabled={isSubmitting}>{isSubmitting ? t("form_sending") : t("form_send")}</button>
        </form>
        <p className={`form-result ${result && !result.ok ? "error" : ""}`} role="status" aria-live="polite">{result?.text}</p>

        <div className="contact-direct">
          <a className="contact-card" href={`mailto:${OWNER.email}`}><span className="icon" aria-hidden="true">✉️</span><span>{OWNER.email}</span></a>
          <a className="contact-card" href={`tel:${OWNER.phoneTel}`}><span className="icon" aria-hidden="true">📞</span><span>{OWNER.phoneDisplay} (Call/WhatsApp)</span></a>
          <a className="contact-card" href={`https://t.me/${OWNER.telegram}`} target="_blank" rel="noopener noreferrer"><span className="icon" aria-hidden="true">💬</span><span>@{OWNER.telegram}</span></a>
        </div>
      </Reveal>
    </section>
  );
}
