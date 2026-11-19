using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SparkEnglish.Infrastructure.Persistence;

/// <summary>Lets `dotnet ef` build the model for PostgreSQL migrations without running the API.</summary>
public class DesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=design_time_only", b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
            .Options;
        return new AppDbContext(options);
    }
}
