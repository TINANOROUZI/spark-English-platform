using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Api.Controllers;

[ApiController]
[Route("api/courses")]
[Produces("application/json")]
public class CoursesController(ICourseService courses) : ControllerBase
{
    /// <summary>List courses with their schedules. Admins may pass includeInactive=true.</summary>
    [HttpGet]
    public async Task<IReadOnlyList<CourseDto>> List([FromQuery] bool includeInactive, CancellationToken ct) =>
        await courses.ListAsync(includeInactive && User.IsInRole("Admin"), ct);

    [HttpGet("{id:int}")]
    public Task<CourseDto> Get(int id, CancellationToken ct) => courses.GetAsync(id, ct);

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<ActionResult<CourseDto>> Create(CourseRequest request, CancellationToken ct)
    {
        var created = await courses.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}"), Authorize(Roles = "Admin")]
    public Task<CourseDto> Update(int id, CourseRequest request, CancellationToken ct) => courses.UpdateAsync(id, request, ct);

    [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) { await courses.DeleteAsync(id, ct); return NoContent(); }

    [HttpPost("{courseId:int}/schedules"), Authorize(Roles = "Admin")]
    public async Task<ActionResult<ScheduleDto>> AddSchedule(int courseId, ScheduleRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await courses.AddScheduleAsync(courseId, request, ct));

    [HttpPut("{courseId:int}/schedules/{scheduleId:int}"), Authorize(Roles = "Admin")]
    public Task<ScheduleDto> UpdateSchedule(int courseId, int scheduleId, ScheduleRequest request, CancellationToken ct) =>
        courses.UpdateScheduleAsync(courseId, scheduleId, request, ct);

    [HttpDelete("{courseId:int}/schedules/{scheduleId:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSchedule(int courseId, int scheduleId, CancellationToken ct)
    {
        await courses.DeleteScheduleAsync(courseId, scheduleId, ct);
        return NoContent();
    }
}
