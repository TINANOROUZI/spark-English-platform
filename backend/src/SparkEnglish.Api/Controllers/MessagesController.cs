using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SparkEnglish.Api.Extensions;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Produces("application/json")]
public class MessagesController(IContactMessageService messages) : ControllerBase
{
    /// <summary>Send a contact message. Public.</summary>
    [HttpPost, AllowAnonymous, EnableRateLimiting("forms")]
    [ProducesResponseType(typeof(ContactMessageDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ContactMessageDto>> Submit(ContactMessageRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await messages.SubmitAsync(request, User.GetUserId(), ct));

    [HttpGet, Authorize(Roles = "Admin")]
    public Task<PagedResult<ContactMessageDto>> List(
        [FromQuery] bool? unreadOnly, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        messages.ListAsync(unreadOnly, page, pageSize, ct);

    [HttpPatch("{id:int}/read"), Authorize(Roles = "Admin")]
    public Task<ContactMessageDto> SetRead(int id, UpdateMessageReadRequest request, CancellationToken ct) =>
        messages.SetReadAsync(id, request.IsRead, ct);

    [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) { await messages.DeleteAsync(id, ct); return NoContent(); }
}
