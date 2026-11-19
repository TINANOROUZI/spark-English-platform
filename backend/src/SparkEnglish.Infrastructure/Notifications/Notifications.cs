using System.Text;
using System.Threading.Channels;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
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

public class NotificationOptions
{
    public const string Section = "Notifications";
    /// <summary>Address that receives the alerts (the school owner).</summary>
    public string To { get; set; } = "";
    /// <summary>Sender address; defaults to the SMTP user.</summary>
    public string From { get; set; } = "";
    /// <summary>Link to the admin dashboard included in each email.</summary>
    public string AdminUrl { get; set; } = "";
    public SmtpOptions Smtp { get; set; } = new();
    public bool IsConfigured => !string.IsNullOrWhiteSpace(To) && !string.IsNullOrWhiteSpace(Smtp.Host);
}

public record EmailMessage(string Subject, string Body, string? ReplyTo);

public class EmailQueue
{
    private readonly Channel<EmailMessage> _channel = Channel.CreateBounded<EmailMessage>(
        new BoundedChannelOptions(200) { FullMode = BoundedChannelFullMode.DropOldest });
    public void Enqueue(EmailMessage m) => _channel.Writer.TryWrite(m);
    public IAsyncEnumerable<EmailMessage> ReadAllAsync(CancellationToken ct) => _channel.Reader.ReadAllAsync(ct);
}

public class EmailNotificationService(EmailQueue queue, IOptions<NotificationOptions> options) : INotificationService
{
    private readonly NotificationOptions _o = options.Value;

    public void TrialRequested(TrialRequestDto t)
    {
        var sb = new StringBuilder();
        sb.AppendLine("A new free-trial request just came in.\n");
        sb.AppendLine($"Parent:    {t.ParentName}");
        sb.AppendLine($"Email:     {t.Email}");
        sb.AppendLine($"Child age: {t.ChildAge?.ToString() ?? "-"}");
        sb.AppendLine($"Preferred: {t.PreferredTime ?? "-"}");
        sb.AppendLine($"Course:    {t.CourseTitle ?? "not chosen"}");
        if (!string.IsNullOrWhiteSpace(t.Notes)) sb.AppendLine($"\nNotes:\n{t.Notes}");
        Footer(sb);
        queue.Enqueue(new EmailMessage($"New trial request: {Clean(t.ParentName)}", sb.ToString(), t.Email));
    }

    public void MessageReceived(ContactMessageDto m)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"New message from {m.Name} <{m.Email}>:\n");
        sb.AppendLine(m.Message);
        Footer(sb);
        queue.Enqueue(new EmailMessage($"New message from {Clean(m.Name)}", sb.ToString(), m.Email));
    }

    private void Footer(StringBuilder sb)
    {
        sb.AppendLine("\n--");
        sb.AppendLine("Hit Reply to answer the sender directly.");
        if (!string.IsNullOrWhiteSpace(_o.AdminUrl)) sb.AppendLine($"Dashboard: {_o.AdminUrl}");
    }

    /// <summary>Strip control characters so user input can't inject mail headers.</summary>
    private static string Clean(string s) => new string(s.Where(c => !char.IsControl(c)).ToArray()).Trim();
}

/// <summary>Sends queued emails in the background. Failures are logged and never reach the visitor.</summary>
public class SmtpEmailSender(EmailQueue queue, IOptions<NotificationOptions> options, ILogger<SmtpEmailSender> logger) : BackgroundService
{
    private readonly NotificationOptions _o = options.Value;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        if (!_o.IsConfigured)
            logger.LogWarning("Email notifications are OFF (set Notifications:To and Notifications:Smtp:*). New requests are still saved; emails will be logged only.");

        await foreach (var msg in queue.ReadAllAsync(ct))
        {
            if (!_o.IsConfigured)
            {
                logger.LogInformation("[email not sent - not configured] {Subject}\n{Body}", msg.Subject, msg.Body);
                continue;
            }
            try { await SendAsync(msg, ct); logger.LogInformation("Notification email sent: {Subject}", msg.Subject); }
            catch (Exception ex) when (ex is not OperationCanceledException) { logger.LogError(ex, "Failed to send notification email: {Subject}", msg.Subject); }
        }
    }

    private async Task SendAsync(EmailMessage m, CancellationToken ct)
    {
        var from = string.IsNullOrWhiteSpace(_o.From) ? _o.Smtp.User : _o.From;
        var mime = new MimeMessage();
        mime.From.Add(MailboxAddress.Parse(from));
        mime.To.Add(MailboxAddress.Parse(_o.To));
        if (!string.IsNullOrWhiteSpace(m.ReplyTo) && MailboxAddress.TryParse(m.ReplyTo, out var reply)) mime.ReplyTo.Add(reply);
        mime.Subject = m.Subject;
        mime.Body = new TextPart("plain") { Text = m.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync(_o.Smtp.Host, _o.Smtp.Port, _o.Smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls, ct);
        if (!string.IsNullOrWhiteSpace(_o.Smtp.User)) await client.AuthenticateAsync(_o.Smtp.User, _o.Smtp.Password, ct);
        await client.SendAsync(mime, ct);
        await client.DisconnectAsync(true, ct);
    }
}
