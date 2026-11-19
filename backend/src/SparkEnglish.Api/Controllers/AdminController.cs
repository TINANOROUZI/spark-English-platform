using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(IAdminService admin) : ControllerBase
{
    /// <summary>Dashboard counters.</summary>
    [HttpGet("stats")]
    public Task<AdminStatsDto> Stats(CancellationToken ct) => admin.GetStatsAsync(ct);
}
