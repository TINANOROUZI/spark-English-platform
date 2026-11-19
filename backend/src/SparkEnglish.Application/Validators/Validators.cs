using FluentValidation;
using SparkEnglish.Application.Dtos;

namespace SparkEnglish.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(100)
            .Matches("[A-Za-z]").WithMessage("Password must contain a letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class TrialRequestRequestValidator : AbstractValidator<TrialRequestRequest>
{
    private static readonly string[] Times = ["afternoon", "evening", "weekend"];
    public TrialRequestRequestValidator()
    {
        RuleFor(x => x.ParentName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.ChildAge).InclusiveBetween(3, 18).When(x => x.ChildAge.HasValue);
        RuleFor(x => x.PreferredTime).Must(t => Times.Contains(t!.ToLowerInvariant()))
            .When(x => !string.IsNullOrEmpty(x.PreferredTime))
            .WithMessage("Preferred time must be afternoon, evening or weekend.");
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}

public class ContactMessageRequestValidator : AbstractValidator<ContactMessageRequest>
{
    public ContactMessageRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
    }
}

public class CourseRequestValidator : AbstractValidator<CourseRequest>
{
    public CourseRequestValidator()
    {
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(60).Matches("^[a-z0-9-]+$");
        RuleFor(x => x.Format).IsInEnum();
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(120);
        RuleFor(x => x.TitleIt).NotEmpty().MaximumLength(120);
        RuleFor(x => x.DescriptionEn).MaximumLength(1000);
        RuleFor(x => x.DescriptionIt).MaximumLength(1000);
        RuleFor(x => x.MinAge).InclusiveBetween(3, 18);
        RuleFor(x => x.MaxAge).InclusiveBetween(3, 18).GreaterThanOrEqualTo(x => x.MinAge);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(10, 600);
        RuleFor(x => x.MaxStudents).InclusiveBetween(1, 30);
        RuleFor(x => x.PriceEur).GreaterThanOrEqualTo(0).When(x => x.PriceEur.HasValue);
    }
}

public class ScheduleRequestValidator : AbstractValidator<ScheduleRequest>
{
    public ScheduleRequestValidator()
    {
        RuleFor(x => x.DayOfWeek).IsInEnum();
        RuleFor(x => x.StartTime).Must(s => TimeOnly.TryParse(s, out _)).WithMessage("StartTime must be HH:mm.");
        RuleFor(x => x.Capacity).InclusiveBetween(1, 30);
    }
}
