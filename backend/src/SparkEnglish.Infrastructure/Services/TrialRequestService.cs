using Microsoft.EntityFrameworkCore;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Exceptions;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Domain.Enums;
using SparkEnglish.Infrastructure.Persistence;

namespace SparkEnglish.Infrastructure.Services;

public class TrialRequestService(AppDbContext db, INotificationService notifier) : ITrialRequestService
{
    public async Task<TrialRequestDto> SubmitAsync(TrialRequestRequest r, int? userId, CancellationToken ct)
    {
        if (r.CourseId is not null && !await db.Courses.AnyAsync(c => c.Id == r.CourseId && c.IsActive, ct))
            throw new BadRequestException("Selected course does not exist.");
        if (r.ScheduleId is not null &&
            !await db.Schedules.AnyAsync(s => s.Id == r.ScheduleId && s.IsActive && (r.CourseId == null || s.CourseId == r.CourseId), ct))
            throw new BadRequestException("Selected schedule does not exist.");

        var t = new TrialRequest
        {
            ParentName = r.ParentName.Trim(), Email = r.Email.Trim().ToLowerInvariant(),
            ChildAge = r.ChildAge, PreferredTime = r.PreferredTime?.ToLowerInvariant(),
            Notes = r.Notes?.Trim(), CourseId = r.CourseId, ScheduleId = r.ScheduleId, UserId = userId,
        };
        db.TrialRequests.Add(t);
        await db.SaveChangesAsync(ct);
        await db.Entry(t).Reference(x => x.Course).LoadAsync(ct);
        var dto = ToDto(t);
        notifier.TrialRequested(dto);
        return dto;
    }

    public async Task<IReadOnlyList<TrialRequestDto>> ListMineAsync(int userId, CancellationToken ct) =>
        (await db.TrialRequests.AsNoTracking().Include(t => t.Course)
            .Where(t => t.UserId == userId).OrderByDescending(t => t.CreatedAt).ToListAsync(ct))
        .Select(ToDto).ToList();

    public async Task<PagedResult<TrialRequestDto>> ListAsync(TrialStatus? status, string? search, int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = Paging.Normalize(page, pageSize);
        var q = db.TrialRequests.AsNoTracking().Include(t => t.Course).AsQueryable();
        if (status is not null) q = q.Where(t => t.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(t => t.ParentName.ToLower().Contains(s) || t.Email.Contains(s));
        }
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(items.Select(ToDto).ToList(), page, pageSize, total);
    }

    public async Task<TrialRequestDto> UpdateStatusAsync(int id, TrialStatus status, CancellationToken ct)
    {
        var t = await db.TrialRequests.Include(x => x.Course).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Trial request not found.");
        t.Status = status;
        await db.SaveChangesAsync(ct);
        return ToDto(t);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var t = await db.TrialRequests.FindAsync([id], ct) ?? throw new NotFoundException("Trial request not found.");
        db.TrialRequests.Remove(t);
        await db.SaveChangesAsync(ct);
    }

    private static TrialRequestDto ToDto(TrialRequest t) => new(
        t.Id, t.ParentName, t.Email, t.ChildAge, t.PreferredTime, t.Notes,
        t.CourseId, t.Course?.TitleEn, t.ScheduleId, t.Status, t.UserId, t.CreatedAt);
}

internal static class Paging
{
    public static (int page, int size) Normalize(int page, int size) =>
        (Math.Max(1, page), Math.Clamp(size, 1, 100));
}
