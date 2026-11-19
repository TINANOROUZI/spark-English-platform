using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SparkEnglish.Api.Extensions;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Api.Controllers;

[ApiController]
[Route("api/trial-requests")]
[Produces("application/json")]
public class TrialRequestsController(ITrialRequestService trials) : ControllerBase
{
    /// <summary>Book a free trial lesson. Public; linked to the account if a valid token is sent.</summary>
    [HttpPost, AllowAnonymous, EnableRateLimiting("forms")]
    [ProducesResponseType(typeof(TrialRequestDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<TrialRequestDto>> Submit(TrialRequestRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await trials.SubmitAsync(request, User.GetUserId(), ct));

    /// <summary>The current user's own requests.</summary>
    [HttpGet("me"), Authorize]
    public async Task<IReadOnlyList<TrialRequestDto>> Mine(CancellationToken ct) =>
        await trials.ListMineAsync(User.GetUserId()!.Value, ct);

    /// <summary>Admin: paged list, optionally filtered by status and search text.</summary>
    [HttpGet, Authorize(Roles = "Admin")]
    public Task<PagedResult<TrialRequestDto>> List(
        [FromQuery] TrialStatus? status, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        trials.ListAsync(status, search, page, pageSize, ct);

    [HttpPatch("{id:int}/status"), Authorize(Roles = "Admin")]
    public Task<TrialRequestDto> UpdateStatus(int id, UpdateTrialStatusRequest request, CancellationToken ct) =>
        trials.UpdateStatusAsync(id, request.Status, ct);

    [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) { await trials.DeleteAsync(id, ct); return NoContent(); }
}
