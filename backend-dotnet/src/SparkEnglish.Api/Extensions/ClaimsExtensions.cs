using System.Security.Claims;

namespace SparkEnglish.Api.Extensions;

public static class ClaimsExtensions
{
    public static int? GetUserId(this ClaimsPrincipal user) =>
        int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
