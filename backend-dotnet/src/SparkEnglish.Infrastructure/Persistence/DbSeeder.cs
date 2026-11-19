using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Infrastructure.Persistence;

public record AdminSeedOptions(string Name, string Email, string? Password);

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher hasher, AdminSeedOptions admin, ILogger logger)
    {
        var email = admin.Email.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(admin.Password) && !await db.Users.AnyAsync(u => u.Email == email))
        {
            db.Users.Add(new User { Name = admin.Name, Email = email, PasswordHash = hasher.Hash(admin.Password), Role = UserRole.Admin });
            logger.LogInformation("Seeded admin account {Email}", email);
        }
        else if (string.IsNullOrWhiteSpace(admin.Password))
        {
            logger.LogWarning("Admin:Password not configured; no admin account seeded.");
        }

        if (!await db.Courses.AnyAsync())
        {
            db.Courses.AddRange(
                new Course
                {
                    Slug = "one-to-one", Format = CourseFormat.OneToOne,
                    TitleEn = "1:1 Online Lessons", TitleIt = "Lezioni online 1:1",
                    DescriptionEn = "Personal lessons, 25 or 50 minutes, tailored to your child.",
                    DescriptionIt = "Lezioni personali da 25 o 50 minuti, su misura per tuo figlio.",
                    MinAge = 5, MaxAge = 17, DurationMinutes = 25, MaxStudents = 1, PriceEur = 19m,
                    Schedules = [
                        new() { DayOfWeek = DayOfWeek.Monday, StartTime = new TimeOnly(16, 0), Capacity = 1 },
                        new() { DayOfWeek = DayOfWeek.Wednesday, StartTime = new TimeOnly(17, 30), Capacity = 1 },
                        new() { DayOfWeek = DayOfWeek.Saturday, StartTime = new TimeOnly(10, 0), Capacity = 1 },
                    ],
                },
                new Course
                {
                    Slug = "mini-group", Format = CourseFormat.MiniGroup,
                    TitleEn = "Mini-Group", TitleIt = "Mini-gruppo",
                    DescriptionEn = "Learn with friends in groups of up to 4 children.",
                    DescriptionIt = "Impara con gli amici in gruppi fino a 4 bambini.",
                    MinAge = 5, MaxAge = 17, DurationMinutes = 50, MaxStudents = 4, PriceEur = 16m, IsPopular = true,
                    Schedules = [
                        new() { DayOfWeek = DayOfWeek.Tuesday, StartTime = new TimeOnly(17, 0), Capacity = 4 },
                        new() { DayOfWeek = DayOfWeek.Thursday, StartTime = new TimeOnly(18, 0), Capacity = 4 },
                    ],
                },
                new Course
                {
                    Slug = "summer-camp", Format = CourseFormat.Camp,
                    TitleEn = "Summer English Camp", TitleIt = "Campo estivo di inglese",
                    DescriptionEn = "One-week immersion with games, songs and projects.",
                    DescriptionIt = "Una settimana di immersione con giochi, canzoni e progetti.",
                    MinAge = 6, MaxAge = 14, DurationMinutes = 120, MaxStudents = 8, PriceEur = null,
                });
        }
        await db.SaveChangesAsync();
    }
}
