using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Infrastructure.Auth;
using SparkEnglish.Infrastructure.Notifications;
using SparkEnglish.Infrastructure.Persistence;
using SparkEnglish.Infrastructure.Services;

namespace SparkEnglish.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var provider = config["Database:Provider"] ?? "Sqlite";
        var cs = config.GetConnectionString("Default") ?? "Data Source=sparkenglish.db";

        services.AddDbContext<AppDbContext>(o =>
        {
            if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase)) o.UseNpgsql(cs);
            else o.UseSqlite(cs);
        });

        services.Configure<JwtOptions>(config.GetSection(JwtOptions.Section));
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.Configure<NotificationOptions>(config.GetSection(NotificationOptions.Section));
        services.AddSingleton<NotificationQueue>();
        services.AddSingleton<INotificationService, NotificationService>();
        services.AddSingleton<INotificationChannel, EmailChannel>();
        services.AddSingleton<INotificationChannel>(sp => new TelegramChannel(sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<NotificationOptions>>()));
        services.AddHostedService<NotificationDispatcher>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<ITrialRequestService, TrialRequestService>();
        services.AddScoped<IContactMessageService, ContactMessageService>();
        services.AddScoped<IAdminService, AdminService>();
        return services;
    }
}
