using SparkEnglish.Application.Dtos;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Application.Interfaces;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IJwtTokenService
{
    string Generate(User user);
}

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<UserResponse> GetProfileAsync(int userId, CancellationToken ct);
}

public interface ICourseService
{
    Task<IReadOnlyList<CourseDto>> ListAsync(bool includeInactive, CancellationToken ct);
    Task<CourseDto> GetAsync(int id, CancellationToken ct);
    Task<CourseDto> CreateAsync(CourseRequest request, CancellationToken ct);
    Task<CourseDto> UpdateAsync(int id, CourseRequest request, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<ScheduleDto> AddScheduleAsync(int courseId, ScheduleRequest request, CancellationToken ct);
    Task<ScheduleDto> UpdateScheduleAsync(int courseId, int scheduleId, ScheduleRequest request, CancellationToken ct);
    Task DeleteScheduleAsync(int courseId, int scheduleId, CancellationToken ct);
}

public interface ITrialRequestService
{
    Task<TrialRequestDto> SubmitAsync(TrialRequestRequest request, int? userId, CancellationToken ct);
    Task<IReadOnlyList<TrialRequestDto>> ListMineAsync(int userId, CancellationToken ct);
    Task<PagedResult<TrialRequestDto>> ListAsync(TrialStatus? status, string? search, int page, int pageSize, CancellationToken ct);
    Task<TrialRequestDto> UpdateStatusAsync(int id, TrialStatus status, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}

public interface IContactMessageService
{
    Task<ContactMessageDto> SubmitAsync(ContactMessageRequest request, int? userId, CancellationToken ct);
    Task<PagedResult<ContactMessageDto>> ListAsync(bool? unreadOnly, int page, int pageSize, CancellationToken ct);
    Task<ContactMessageDto> SetReadAsync(int id, bool isRead, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken ct);
}

/// <summary>Tells the school owner about new bookings/messages. Must never throw or block the request.</summary>
public interface INotificationService
{
    void TrialRequested(TrialRequestDto trial);
    void MessageReceived(ContactMessageDto message);
}
