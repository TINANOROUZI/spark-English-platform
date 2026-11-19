using System.Text.Json.Serialization;
using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Application.Dtos;

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, int Id, string Name, string Email, string Role);
public record UserResponse(int Id, string Name, string Email, string Role, DateTime CreatedAt);

public record ScheduleDto(int Id, int CourseId, [property: JsonConverter(typeof(JsonStringEnumConverter))] DayOfWeek DayOfWeek, string StartTime, int Capacity, bool IsActive);
public record ScheduleRequest([property: JsonConverter(typeof(JsonStringEnumConverter))] DayOfWeek DayOfWeek, string StartTime, int Capacity, bool IsActive = true);

public record CourseDto(
    int Id, string Slug, CourseFormat Format, string TitleEn, string TitleIt,
    string DescriptionEn, string DescriptionIt, int MinAge, int MaxAge, int DurationMinutes,
    int MaxStudents, decimal? PriceEur, bool IsPopular, bool IsActive, IReadOnlyList<ScheduleDto> Schedules);

public record CourseRequest(
    string Slug, CourseFormat Format, string TitleEn, string TitleIt,
    string DescriptionEn, string DescriptionIt, int MinAge, int MaxAge, int DurationMinutes,
    int MaxStudents, decimal? PriceEur, bool IsPopular, bool IsActive = true);

public record TrialRequestRequest(
    string ParentName, string Email, int? ChildAge, string? PreferredTime, string? Notes,
    int? CourseId, int? ScheduleId);
public record TrialRequestDto(
    int Id, string ParentName, string Email, int? ChildAge, string? PreferredTime, string? Notes,
    int? CourseId, string? CourseTitle, int? ScheduleId, TrialStatus Status, int? UserId, DateTime CreatedAt);
public record UpdateTrialStatusRequest(TrialStatus Status);

public record ContactMessageRequest(string Name, string Email, string Message);
public record ContactMessageDto(int Id, string Name, string Email, string Message, bool IsRead, DateTime CreatedAt);
public record UpdateMessageReadRequest(bool IsRead);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public record AdminStatsDto(int TrialRequests, int PendingTrialRequests, int Messages, int UnreadMessages, int Courses);
