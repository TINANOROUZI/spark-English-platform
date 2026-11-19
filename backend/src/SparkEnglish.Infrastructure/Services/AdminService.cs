using Microsoft.EntityFrameworkCore;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Enums;
using SparkEnglish.Infrastructure.Persistence;

namespace SparkEnglish.Infrastructure.Services;

public class AdminService(AppDbContext db) : IAdminService
{
    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken ct) => new(
        await db.TrialRequests.CountAsync(ct),
        await db.TrialRequests.CountAsync(t => t.Status == TrialStatus.Pending, ct),
        await db.ContactMessages.CountAsync(ct),
        await db.ContactMessages.CountAsync(m => !m.IsRead, ct),
        await db.Courses.CountAsync(ct));
}
