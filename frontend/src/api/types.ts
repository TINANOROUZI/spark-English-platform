export type Role = "Parent" | "Admin";
export type CourseFormat = "OneToOne" | "MiniGroup" | "Camp";
export type TrialStatus = "Pending" | "Contacted" | "Scheduled" | "Cancelled";
export const TRIAL_STATUSES: TrialStatus[] = ["Pending", "Contacted", "Scheduled", "Cancelled"];
export type DayName = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export const DAYS: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface AuthResponse { token: string; id: number; name: string; email: string; role: Role }

export interface Schedule { id: number; courseId: number; dayOfWeek: DayName; startTime: string; capacity: number; isActive: boolean }
export interface ScheduleInput { dayOfWeek: DayName; startTime: string; capacity: number; isActive: boolean }

export interface Course {
  id: number; slug: string; format: CourseFormat;
  titleEn: string; titleIt: string; descriptionEn: string; descriptionIt: string;
  minAge: number; maxAge: number; durationMinutes: number; maxStudents: number;
  priceEur: number | null; isPopular: boolean; isActive: boolean; schedules: Schedule[];
}
export type CourseInput = Omit<Course, "id" | "schedules">;

export interface TrialRequestInput {
  parentName: string; email: string; childAge: number | null; preferredTime: string | null;
  notes: string | null; courseId: number | null; scheduleId: number | null;
}
export interface TrialRequest {
  id: number; parentName: string; email: string; childAge: number | null; preferredTime: string | null;
  notes: string | null; courseId: number | null; courseTitle: string | null; scheduleId: number | null;
  status: TrialStatus; userId: number | null; createdAt: string;
}
export interface ContactMessageInput { name: string; email: string; message: string }
export interface ContactMessage { id: number; name: string; email: string; message: string; isRead: boolean; createdAt: string }

export interface Paged<T> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number }
export interface AdminStats { trialRequests: number; pendingTrialRequests: number; messages: number; unreadMessages: number; courses: number }
