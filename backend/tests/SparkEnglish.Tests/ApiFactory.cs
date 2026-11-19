using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using SparkEnglish.Application.Dtos;

namespace SparkEnglish.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbFile = Path.Combine(Path.GetTempPath(), $"spark-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        // UseSetting applies before Program.cs reads configuration (minimal hosting).
        builder.UseSetting("ConnectionStrings:Default", $"Data Source={_dbFile}");
        builder.UseSetting("Jwt:Secret", "test-secret-test-secret-test-secret-123456");
        builder.UseSetting("Admin:Email", "admin@test.com");
        builder.UseSetting("Admin:Password", "AdminPass123");
        builder.UseSetting("RateLimiting:FormsPerMinute", "1000");
        builder.UseSetting("RateLimiting:AuthPerMinute", "1000");
    }

    public async Task<HttpClient> AdminClientAsync()
    {
        var client = CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest("admin@test.com", "AdminPass123"));
        res.EnsureSuccessStatusCode();
        var auth = (await res.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        return client;
    }

    public async Task<(HttpClient client, AuthResponse auth)> ParentClientAsync(string? email = null)
    {
        var client = CreateClient();
        email ??= $"parent-{Guid.NewGuid():N}@test.com";
        var res = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest("Parent", email, "Password123"));
        res.EnsureSuccessStatusCode();
        var auth = (await res.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        return (client, auth);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        try { File.Delete(_dbFile); } catch { /* ignore */ }
    }
}
