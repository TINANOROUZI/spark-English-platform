using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SparkEnglish.Api.Extensions;

/// <summary>Runs any registered FluentValidation validator for each action argument and returns a 400 ValidationProblemDetails.</summary>
public class ValidationFilter(IServiceProvider sp) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext ctx, ActionExecutionDelegate next)
    {
        foreach (var arg in ctx.ActionArguments.Values)
        {
            if (arg is null) continue;
            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            if (sp.GetService(validatorType) is not IValidator validator) continue;

            var result = await validator.ValidateAsync(new ValidationContext<object>(arg));
            if (result.IsValid) continue;

            var errors = result.Errors
                .GroupBy(e => JsonNamingCamel(e.PropertyName))
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            ctx.Result = new BadRequestObjectResult(new ValidationProblemDetails(errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
            });
            return;
        }
        await next();
    }

    private static string JsonNamingCamel(string s) => string.IsNullOrEmpty(s) ? s : char.ToLowerInvariant(s[0]) + s[1..];
}
