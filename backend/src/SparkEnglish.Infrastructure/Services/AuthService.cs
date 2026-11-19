using Microsoft.EntityFrameworkCore;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Exceptions;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Domain.Enums;
using SparkEnglish.Infrastructure.Persistence;

namespace SparkEnglish.Infrastructure.Services;

public class AuthService(AppDbContext db, IPasswordHasher hasher, IJwtTokenService jwt) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest r, CancellationToken ct)
    {
        var email = r.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            throw new ConflictException("An account with this email already exists.");

        var user = new User { Name = r.Name.Trim(), Email = email, PasswordHash = hasher.Hash(r.Password), Role = UserRole.Parent };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return ToResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest r, CancellationToken ct)
    {
        var email = r.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null || !hasher.Verify(r.Password, user.PasswordHash))
            throw new UnauthorizedAppException("Invalid email or password.");
        return ToResponse(user);
    }

    public async Task<UserResponse> GetProfileAsync(int userId, CancellationToken ct)
    {
        var u = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");
        return new UserResponse(u.Id, u.Name, u.Email, u.Role.ToString(), u.CreatedAt);
    }

    private AuthResponse ToResponse(User u) => new(jwt.Generate(u), u.Id, u.Name, u.Email, u.Role.ToString());
}
