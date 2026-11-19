import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qs, request } from "./client";
import type {
  AdminStats, AuthResponse, ContactMessage, ContactMessageInput, Course, CourseInput, Paged,
  Schedule, ScheduleInput, TrialRequest, TrialRequestInput, TrialStatus,
} from "./types";

// ---------- public ----------
export const useCourses = () =>
  useQuery({ queryKey: ["courses", "public"], queryFn: () => request<Course[]>("/courses"), staleTime: 5 * 60_000, retry: 1 });

export const useSubmitTrial = (token?: string | null) =>
  useMutation({ mutationFn: (b: TrialRequestInput) => request<TrialRequest>("/trial-requests", { method: "POST", body: b, token }) });

export const useSubmitMessage = (token?: string | null) =>
  useMutation({ mutationFn: (b: ContactMessageInput) => request<ContactMessage>("/messages", { method: "POST", body: b, token }) });

export const authApi = {
  login: (email: string, password: string) => request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  register: (name: string, email: string, password: string) => request<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } }),
  me: (token: string) => request<{ id: number; name: string; email: string; role: string }>("/auth/me", { token }),
};

// ---------- admin ----------
export const useAdminStats = (token: string) =>
  useQuery({ queryKey: ["admin", "stats"], queryFn: () => request<AdminStats>("/admin/stats", { token }) });

export const useAdminCourses = (token: string) =>
  useQuery({ queryKey: ["courses", "admin"], queryFn: () => request<Course[]>("/courses?includeInactive=true", { token }) });

export function useTrialList(token: string, p: { status?: TrialStatus | ""; search?: string; page: number }) {
  return useQuery({
    queryKey: ["admin", "trials", p],
    queryFn: () => request<Paged<TrialRequest>>(`/trial-requests${qs({ ...p, pageSize: 10 })}`, { token }),
    placeholderData: keepPreviousData,
  });
}

export function useMessageList(token: string, p: { unreadOnly: boolean; page: number }) {
  return useQuery({
    queryKey: ["admin", "messages", p],
    queryFn: () => request<Paged<ContactMessage>>(`/messages${qs({ unreadOnly: p.unreadOnly, page: p.page, pageSize: 10 })}`, { token }),
    placeholderData: keepPreviousData,
  });
}

/** Mutations for the admin area; each invalidates the lists + stats it affects. */
export function useAdminMutations(token: string) {
  const qc = useQueryClient();
  const done = (...keys: string[]) => () => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: k === "stats" ? ["admin", "stats"] : [k] })));
  return {
    setTrialStatus: useMutation({
      mutationFn: (v: { id: number; status: TrialStatus }) => request<TrialRequest>(`/trial-requests/${v.id}/status`, { method: "PATCH", body: { status: v.status }, token }),
      onSuccess: done("admin"),
    }),
    deleteTrial: useMutation({ mutationFn: (id: number) => request<void>(`/trial-requests/${id}`, { method: "DELETE", token }), onSuccess: done("admin") }),
    setMessageRead: useMutation({
      mutationFn: (v: { id: number; isRead: boolean }) => request<ContactMessage>(`/messages/${v.id}/read`, { method: "PATCH", body: { isRead: v.isRead }, token }),
      onSuccess: done("admin"),
    }),
    deleteMessage: useMutation({ mutationFn: (id: number) => request<void>(`/messages/${id}`, { method: "DELETE", token }), onSuccess: done("admin") }),
    saveCourse: useMutation({
      mutationFn: (v: { id?: number; data: CourseInput }) =>
        v.id ? request<Course>(`/courses/${v.id}`, { method: "PUT", body: v.data, token }) : request<Course>("/courses", { method: "POST", body: v.data, token }),
      onSuccess: done("courses", "stats"),
    }),
    deleteCourse: useMutation({ mutationFn: (id: number) => request<void>(`/courses/${id}`, { method: "DELETE", token }), onSuccess: done("courses", "stats") }),
    addSchedule: useMutation({
      mutationFn: (v: { courseId: number; data: ScheduleInput }) => request<Schedule>(`/courses/${v.courseId}/schedules`, { method: "POST", body: v.data, token }),
      onSuccess: done("courses"),
    }),
    deleteSchedule: useMutation({
      mutationFn: (v: { courseId: number; id: number }) => request<void>(`/courses/${v.courseId}/schedules/${v.id}`, { method: "DELETE", token }),
      onSuccess: done("courses"),
    }),
  };
}
