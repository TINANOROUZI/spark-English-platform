namespace SparkEnglish.Domain.Entities;

public class ClassSchedule
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course? Course { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public int Capacity { get; set; } = 4;
    public bool IsActive { get; set; } = true;
}
