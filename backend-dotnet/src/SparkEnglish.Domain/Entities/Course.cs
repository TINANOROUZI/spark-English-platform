using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public CourseFormat Format { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleIt { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionIt { get; set; } = string.Empty;
    public int MinAge { get; set; }
    public int MaxAge { get; set; }
    public int DurationMinutes { get; set; }
    public int MaxStudents { get; set; } = 1;
    /// <summary>Null means "ask for info" (e.g. camps).</summary>
    public decimal? PriceEur { get; set; }
    public bool IsPopular { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ClassSchedule> Schedules { get; set; } = new();
}
