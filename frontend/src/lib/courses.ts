import type { Course, CourseFormat, DayName, Schedule } from "../api/types";
import { COPY, type CopyKey, type Lang } from "../i18n/copy";

export const FORMAT_ICON: Record<CourseFormat, string> = { OneToOne: "🧑‍🏫", MiniGroup: "👫", Camp: "🏕️" };
export const FORMAT_BULLETS: Record<CourseFormat, CopyKey[]> = {
  OneToOne: ["c1_p1", "c1_p2", "c1_p3"],
  MiniGroup: ["c2_p1", "c2_p2", "c2_p3"],
  Camp: ["c3_p1", "c3_p2", "c3_p3"],
};
export const FORMAT_PRICE_BULLETS: Record<CourseFormat, CopyKey[]> = {
  OneToOne: ["p_oneToOne_1", "p_oneToOne_2", "p_oneToOne_3"],
  MiniGroup: ["p_miniGroup_1", "p_miniGroup_2", "p_miniGroup_3"],
  Camp: ["p_camp_1", "p_camp_2", "p_camp_3"],
};

export const courseTitle = (c: Course, lang: Lang) => (lang === "it" ? c.titleIt : c.titleEn);
export const courseText = (c: Course, lang: Lang) => (lang === "it" ? c.descriptionIt : c.descriptionEn);

const DAY_INDEX: Record<DayName, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
/** Localized short weekday, e.g. "Mon" / "lun". 2024-01-07 is a Sunday. */
export const dayLabel = (d: DayName, lang: Lang) =>
  new Date(2024, 0, 7 + DAY_INDEX[d]).toLocaleDateString(lang, { weekday: "short" });
export const slotLabel = (s: Pick<Schedule, "dayOfWeek" | "startTime">, lang: Lang) => `${dayLabel(s.dayOfWeek, lang)} ${s.startTime}`;

/** Shown only if the API is unreachable, so the marketing page never looks empty. Ids are negative: never submitted. */
const fb = (id: number, slug: string, format: CourseFormat, k: "c1" | "c2" | "c3", min: number, dur: number, max: number, price: number | null, popular = false): Course => {
  const en = COPY.en, it = COPY.it;
  return {
    id, slug, format,
    titleEn: en[`${k}_title`], titleIt: it[`${k}_title`], descriptionEn: en[`${k}_text`], descriptionIt: it[`${k}_text`],
    minAge: min, maxAge: 17, durationMinutes: dur, maxStudents: max, priceEur: price, isPopular: popular, isActive: true, schedules: [],
  };
};
export const FALLBACK_COURSES: Course[] = [
  fb(-1, "one-to-one", "OneToOne", "c1", 5, 25, 1, 19),
  fb(-2, "mini-group", "MiniGroup", "c2", 5, 50, 4, 16, true),
  fb(-3, "summer-camp", "Camp", "c3", 6, 120, 8, null),
];

export const SELECT_COURSE_EVENT = "spark:select-course";
/** Scrolls to the trial form and asks it to preselect a course. */
export function chooseCourse(courseId: number) {
  if (courseId > 0) window.dispatchEvent(new CustomEvent<number>(SELECT_COURSE_EVENT, { detail: courseId }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}
