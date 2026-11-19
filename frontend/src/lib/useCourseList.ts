import { useCourses } from "../api/hooks";
import { FALLBACK_COURSES } from "./courses";

/** Live courses from the API, falling back to static formats if the API is down. */
export function useCourseList() {
  const q = useCourses();
  const live = q.data?.filter((c) => c.isActive);
  return {
    courses: live ?? (q.isError ? FALLBACK_COURSES : []),
    isLoading: q.isPending,
    isFallback: q.isError,
    refetch: q.refetch,
  };
}
