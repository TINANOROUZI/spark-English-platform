using System.Text;
using System.Threading.Channels;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Infrastructure.Notifications;

public class SmtpOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public string User { get; set; } = "";
    public string Password { get; set; } = "";
}

public class TelegramOptions
{
    /// <summary>Token from @BotFather. Treat as a secret.</summary>
    public string BotToken { get; set; } = "";
    /// <summary>Your chat id (a number) or @channelname.</summary>
    public string ChatId { get; set; } = "";
}

public class NotificationOptions
{
    public const string Section = "Notifications";
    /// <summary>Email address that receives alerts (the school owner).</summary>
    public string To { get; set; } = "";
    /// <summary>Sender address; defaults to the SMTP user.</summary>
    public string From { get; set; } = "";
    /// <summary>Link to the admin dashboard included in each alert.</summary>
    public string AdminUrl { get; set; } = "";
    public SmtpOptions Smtp { get; set; } = new();
    public TelegramOptions Telegram { get; set; } = new();
}

/// <summary>A provider-neutral alert. Channels render it however they like.</summary>
public record Notice(string Subject, string Body, string? ReplyTo);

public interface INotificationChannel
{
    string Name { get; }
    bool IsConfigured { get; }
    Task SendAsync(Notice notice, CancellationToken ct);
}

public class NotificationQueue
{
    private readonly Channel<Notice> _channel = Channel.CreateBounded<Notice>(
        new BoundedChannelOptions(200) { FullMode = BoundedChannelFullMode.DropOldest });
    public void Enqueue(Notice n) => _channel.Writer.TryWrite(n);
    public IAsyncEnumerable<Notice> ReadAllAsync(CancellationToken ct) => _channel.Reader.ReadAllAsync(ct);
}

/// <summary>Builds the alert text and queues it. Returns immediately so the HTTP request is never slowed.</summary>
public class NotificationService(NotificationQueue queue, IOptions<NotificationOptions> options) : INotificationService
{
    private readonly NotificationOptions _o = options.Value;

    public void TrialRequested(TrialRequestDto t)
    {
        var sb = new StringBuilder();
        sb.AppendLine("New free-trial request\n");
        sb.AppendLine($"Parent:    {t.ParentName}");
        sb.AppendLine($"Email:     {t.Email}");
        sb.AppendLine($"Child age: {t.ChildAge?.ToString() ?? "-"}");
        sb.AppendLine($"Preferred: {t.PreferredTime ?? "-"}");
        sb.AppendLine($"Course:    {t.CourseTitle ?? "not chosen"}");
        if (!string.IsNullOrWhiteSpace(t.Notes)) sb.AppendLine($"\nNotes:\n{t.Notes}");
        Footer(sb);
        queue.Enqueue(new Notice($"New trial request: {Clean(t.ParentName)}", sb.ToString(), t.Email));
    }

    public void MessageReceived(ContactMessageDto m)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"New message from {m.Name} <{m.Email}>\n");
        sb.AppendLine(m.Message);
        Footer(sb);
        queue.Enqueue(new Notice($"New message from {Clean(m.Name)}", sb.ToString(), m.Email));
    }

    private void Footer(StringBuilder sb)
    {
        sb.AppendLine("\n--");
        if (!string.IsNullOrWhiteSpace(_o.AdminUrl)) sb.AppendLine($"Dashboard: {_o.AdminUrl}");
    }

    /// <summary>Strip control characters so user input can't inject mail headers.</summary>
    private static string Clean(string s) => new string(s.Where(c => !char.IsControl(c)).ToArray()).Trim();
}

/// <summary>Fans each queued notice out to every configured channel. A failing channel never affects the others or the visitor.</summary>
public class NotificationDispatcher(NotificationQueue queue, IEnumerable<INotificationChannel> channels, ILogger<NotificationDispatcher> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var active = channels.Where(c => c.IsConfigured).ToList();
        foreach (var c in channels.Where(c => !c.IsConfigured)) logger.LogWarning("Notification channel '{Channel}' is OFF (not configured).", c.Name);
        if (active.Count > 0) logger.LogInformation("Notification channels active: {Channels}", string.Join(", ", active.Select(c => c.Name)));

        await foreach (var notice in queue.ReadAllAsync(ct))
        {
            if (active.Count == 0)
            {
                logger.LogInformation("[no notification channel configured] {Subject}\n{Body}", notice.Subject, notice.Body);
                continue;
            }
            await Task.WhenAll(active.Select(async c =>
            {
                try { await c.SendAsync(notice, ct); logger.LogInformation("Notification sent via {Channel}: {Subject}", c.Name, notice.Subject); }
                catch (OperationCanceledException) { }
                catch (Exception ex) { logger.LogError("Notification via {Channel} failed: {Type}: {Message}", c.Name, ex.GetType().Name, ex.Message); }
            }));
        }
    }
}
