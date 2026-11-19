using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Domain.Entities;

public class TrialRequest
{
    public int Id { get; set; }
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? ChildAge { get; set; }
    public string? PreferredTime { get; set; }
    public string? Notes { get; set; }
    public int? CourseId { get; set; }
    public Course? Course { get; set; }
    public int? ScheduleId { get; set; }
    public TrialStatus Status { get; set; } = TrialStatus.Pending;
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
