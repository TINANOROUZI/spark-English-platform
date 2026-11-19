using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace SparkEnglish.Infrastructure.Notifications;

/// <summary>
/// Sends alerts through the Telegram Bot API. Uses a plain HttpClient (not IHttpClientFactory) on purpose:
/// the factory's default logging would write the request URL, which contains the bot token, to the logs.
/// </summary>
public class TelegramChannel : INotificationChannel, IDisposable
{
    private readonly TelegramOptions _o;
    private readonly HttpClient _http;

    public TelegramChannel(IOptions<NotificationOptions> options) : this(options, new HttpClient { Timeout = TimeSpan.FromSeconds(15) }) { }

    /// <summary>For tests: supply an HttpClient with a fake handler.</summary>
    public TelegramChannel(IOptions<NotificationOptions> options, HttpClient http) { _o = options.Value.Telegram; _http = http; }
    private const int MaxLength = 4000; // Telegram limit is 4096

    public string Name => "telegram";
    public bool IsConfigured => !string.IsNullOrWhiteSpace(_o.BotToken) && !string.IsNullOrWhiteSpace(_o.ChatId);

    public async Task SendAsync(Notice n, CancellationToken ct)
    {
        var text = $"🔔 {n.Subject}\n\n{n.Body}";
        if (text.Length > MaxLength) text = text[..MaxLength] + "…";

        // No parse_mode: text is sent verbatim, so visitor input can't inject formatting/links.
        using var res = await _http.PostAsJsonAsync(
            $"https://api.telegram.org/bot{_o.BotToken}/sendMessage",
            new { chat_id = _o.ChatId, text, disable_web_page_preview = true }, ct);

        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            string desc = body;
            try { desc = JsonDocument.Parse(body).RootElement.GetProperty("description").GetString() ?? body; } catch { /* keep raw */ }
            throw new InvalidOperationException($"Telegram API {(int)res.StatusCode}: {desc}");
        }
    }

    public void Dispose() => _http.Dispose();
}
