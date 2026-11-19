using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SparkEnglish.Api.Extensions;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(IAuthService auth) : ControllerBase
{
    /// <summary>Create a parent account.</summary>
    [HttpPost("register"), EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await auth.RegisterAsync(request, ct));

    /// <summary>Log in and receive a JWT.</summary>
    [HttpPost("login"), EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct) =>
        await auth.LoginAsync(request, ct);

    /// <summary>Current user's profile.</summary>
    [HttpGet("me"), Authorize]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken ct) =>
        await auth.GetProfileAsync(User.GetUserId()!.Value, ct);
}
