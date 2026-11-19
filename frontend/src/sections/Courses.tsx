import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import { FORMAT_BULLETS, FORMAT_ICON, chooseCourse, courseText, courseTitle, slotLabel } from "../lib/courses";
import { useCourseList } from "../lib/useCourseList";

export default function Courses() {
  const { t, lang } = useI18n();
  const { courses, isLoading, isFallback, refetch } = useCourseList();

  return (
    <section id="courses" className="section">
      <div className="container">
        <Reveal as="h2">{t("courses_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("courses_sub")}</Reveal>
        {isFallback && (
          <p className="notice" role="status">{t("courses_error")} <button className="link-btn" onClick={() => refetch()}>{t("courses_retry")}</button></p>
        )}
        <div className="cards" aria-busy={isLoading}>
          {isLoading && [0, 1, 2].map((i) => <div key={i} className="card skeleton" aria-hidden="true" />)}
          {courses.map((c) => (
            <Reveal as="article" className="card" key={c.id}>
              <div className="card-icon" aria-hidden="true">{FORMAT_ICON[c.format]}</div>
              <h3>{courseTitle(c, lang)}</h3>
              <p>{courseText(c, lang)}</p>
              <div className="meta">
                {c.format !== "Camp" && <span className="badge">{c.durationMinutes} {t("min_short")}</span>}
                {c.maxStudents > 1 && <span className="badge">{t("up_to")} {c.maxStudents} {t("kids")}</span>}
                <span className="badge">{t("ages_label")} {c.minAge}–{c.maxAge}</span>
              </div>
              <ul className="ticks">{FORMAT_BULLETS[c.format].map((k) => <li key={k}>{t(k)}</li>)}</ul>
              {c.schedules.length > 0 && (
                <p className="slots" aria-label={t("form_schedule")}>
                  {c.schedules.map((s) => <span className="slot" key={s.id}>{slotLabel(s, lang)}</span>)}
                </p>
              )}
              <button className="btn small" onClick={() => chooseCourse(c.id)}>{c.format === "Camp" ? t("cta_info") : t("cta_try")}</button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
