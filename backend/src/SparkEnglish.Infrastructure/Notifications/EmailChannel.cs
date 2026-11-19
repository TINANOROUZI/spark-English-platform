using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace SparkEnglish.Infrastructure.Notifications;

public class EmailChannel(IOptions<NotificationOptions> options) : INotificationChannel
{
    private readonly NotificationOptions _o = options.Value;
    public string Name => "email";
    public bool IsConfigured => !string.IsNullOrWhiteSpace(_o.To) && !string.IsNullOrWhiteSpace(_o.Smtp.Host);

    public async Task SendAsync(Notice n, CancellationToken ct)
    {
        var from = string.IsNullOrWhiteSpace(_o.From) ? _o.Smtp.User : _o.From;
        var mime = new MimeMessage();
        mime.From.Add(MailboxAddress.Parse(from));
        mime.To.Add(MailboxAddress.Parse(_o.To));
        if (!string.IsNullOrWhiteSpace(n.ReplyTo) && MailboxAddress.TryParse(n.ReplyTo, out var reply)) mime.ReplyTo.Add(reply);
        mime.Subject = n.Subject;
        mime.Body = new TextPart("plain") { Text = n.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync(_o.Smtp.Host, _o.Smtp.Port, _o.Smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls, ct);
        if (!string.IsNullOrWhiteSpace(_o.Smtp.User)) await client.AuthenticateAsync(_o.Smtp.User, _o.Smtp.Password, ct);
        await client.SendAsync(mime, ct);
        await client.DisconnectAsync(true, ct);
    }
}
