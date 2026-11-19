using Microsoft.EntityFrameworkCore;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Exceptions;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Infrastructure.Persistence;

namespace SparkEnglish.Infrastructure.Services;

public class CourseService(AppDbContext db) : ICourseService
{
    public async Task<IReadOnlyList<CourseDto>> ListAsync(bool includeInactive, CancellationToken ct)
    {
        var q = db.Courses.AsNoTracking().Include(c => c.Schedules).AsQueryable();
        if (!includeInactive) q = q.Where(c => c.IsActive);
        var list = await q.OrderBy(c => c.Id).ToListAsync(ct);
        return list.Select(c => ToDto(c, includeInactive)).ToList();
    }

    public async Task<CourseDto> GetAsync(int id, CancellationToken ct)
    {
        var c = await db.Courses.AsNoTracking().Include(x => x.Schedules).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Course not found.");
        return ToDto(c, true);
    }

    public async Task<CourseDto> CreateAsync(CourseRequest r, CancellationToken ct)
    {
        if (await db.Courses.AnyAsync(c => c.Slug == r.Slug, ct)) throw new ConflictException("Slug already in use.");
        var c = new Course();
        Apply(c, r);
        db.Courses.Add(c);
        await db.SaveChangesAsync(ct);
        return ToDto(c, true);
    }

    public async Task<CourseDto> UpdateAsync(int id, CourseRequest r, CancellationToken ct)
    {
        var c = await db.Courses.Include(x => x.Schedules).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Course not found.");
        if (await db.Courses.AnyAsync(x => x.Slug == r.Slug && x.Id != id, ct)) throw new ConflictException("Slug already in use.");
        Apply(c, r);
        await db.SaveChangesAsync(ct);
        return ToDto(c, true);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var c = await db.Courses.FindAsync([id], ct) ?? throw new NotFoundException("Course not found.");
        db.Courses.Remove(c);
        await db.SaveChangesAsync(ct);
    }

    public async Task<ScheduleDto> AddScheduleAsync(int courseId, ScheduleRequest r, CancellationToken ct)
    {
        if (!await db.Courses.AnyAsync(c => c.Id == courseId, ct)) throw new NotFoundException("Course not found.");
        var s = new ClassSchedule { CourseId = courseId };
        Apply(s, r);
        db.Schedules.Add(s);
        await db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    public async Task<ScheduleDto> UpdateScheduleAsync(int courseId, int scheduleId, ScheduleRequest r, CancellationToken ct)
    {
        var s = await db.Schedules.FirstOrDefaultAsync(x => x.Id == scheduleId && x.CourseId == courseId, ct)
            ?? throw new NotFoundException("Schedule not found.");
        Apply(s, r);
        await db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    public async Task DeleteScheduleAsync(int courseId, int scheduleId, CancellationToken ct)
    {
        var s = await db.Schedules.FirstOrDefaultAsync(x => x.Id == scheduleId && x.CourseId == courseId, ct)
            ?? throw new NotFoundException("Schedule not found.");
        db.Schedules.Remove(s);
        await db.SaveChangesAsync(ct);
    }

    private static void Apply(Course c, CourseRequest r)
    {
        c.Slug = r.Slug; c.Format = r.Format;
        c.TitleEn = r.TitleEn; c.TitleIt = r.TitleIt;
        c.DescriptionEn = r.DescriptionEn; c.DescriptionIt = r.DescriptionIt;
        c.MinAge = r.MinAge; c.MaxAge = r.MaxAge;
        c.DurationMinutes = r.DurationMinutes; c.MaxStudents = r.MaxStudents;
        c.PriceEur = r.PriceEur; c.IsPopular = r.IsPopular; c.IsActive = r.IsActive;
    }

    private static void Apply(ClassSchedule s, ScheduleRequest r)
    {
        s.DayOfWeek = r.DayOfWeek;
        s.StartTime = TimeOnly.Parse(r.StartTime);
        s.Capacity = r.Capacity;
        s.IsActive = r.IsActive;
    }

    private static ScheduleDto ToDto(ClassSchedule s) =>
        new(s.Id, s.CourseId, s.DayOfWeek, s.StartTime.ToString("HH:mm"), s.Capacity, s.IsActive);

    private static CourseDto ToDto(Course c, bool includeInactiveSchedules) => new(
        c.Id, c.Slug, c.Format, c.TitleEn, c.TitleIt, c.DescriptionEn, c.DescriptionIt,
        c.MinAge, c.MaxAge, c.DurationMinutes, c.MaxStudents, c.PriceEur, c.IsPopular, c.IsActive,
        c.Schedules.Where(s => includeInactiveSchedules || s.IsActive)
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime).Select(ToDto).ToList());
}
