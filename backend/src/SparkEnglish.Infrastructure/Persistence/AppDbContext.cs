using Microsoft.EntityFrameworkCore;
using SparkEnglish.Domain.Entities;

namespace SparkEnglish.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<ClassSchedule> Schedules => Set<ClassSchedule>();
    public DbSet<TrialRequest> TrialRequests => Set<TrialRequest>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Name).HasMaxLength(100);
            e.Property(u => u.Email).HasMaxLength(254);
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        });
        b.Entity<Course>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.Slug).HasMaxLength(60);
            e.Property(c => c.Format).HasConversion<string>().HasMaxLength(20);
            e.Property(c => c.PriceEur).HasPrecision(10, 2);
            e.HasMany(c => c.Schedules).WithOne(s => s.Course).HasForeignKey(s => s.CourseId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<ClassSchedule>(e =>
        {
            e.Property(s => s.DayOfWeek).HasConversion<string>().HasMaxLength(12);
        });
        b.Entity<TrialRequest>(e =>
        {
            e.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(t => t.Email).HasMaxLength(254);
            e.Property(t => t.Notes).HasMaxLength(2000);
            e.HasIndex(t => t.Status);
            e.HasOne(t => t.Course).WithMany().HasForeignKey(t => t.CourseId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.SetNull);
        });
        b.Entity<ContactMessage>(e =>
        {
            e.Property(m => m.Message).HasMaxLength(4000);
            e.HasOne(m => m.User).WithMany().HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
