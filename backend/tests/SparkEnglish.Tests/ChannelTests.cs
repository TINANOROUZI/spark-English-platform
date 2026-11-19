using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SparkEnglish.Infrastructure.Notifications;

namespace SparkEnglish.Tests;

public class ChannelTests
{
    private const string Token = "123456:SECRET-TOKEN";
    private static IOptions<NotificationOptions> Opts(string token = Token, string chat = "42") =>
        Options.Create(new NotificationOptions { Telegram = new TelegramOptions { BotToken = token, ChatId = chat } });

    private class StubHandler(HttpStatusCode status, string body) : HttpMessageHandler
    {
        public HttpRequestMessage? Request; public string? Body;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct)
        {
            Request = r; Body = r.Content is null ? null : await r.Content.ReadAsStringAsync(ct);
            return new HttpResponseMessage(status) { Content = new StringContent(body) };
        }
    }

    [Fact]
    public async Task Telegram_posts_plain_text_to_the_bot_api()
    {
        var h = new StubHandler(HttpStatusCode.OK, "{\"ok\":true}");
        var ch = new TelegramChannel(Opts(), new HttpClient(h));
        await ch.SendAsync(new Notice("New trial request: Anna", "<b>hi</b> body", null), default);

        h.Request!.RequestUri!.ToString().Should().Be($"https://api.telegram.org/bot{Token}/sendMessage");
        var json = JsonDocument.Parse(h.Body!).RootElement;
        json.GetProperty("chat_id").GetString().Should().Be("42");
        json.GetProperty("text").GetString().Should().Contain("New trial request: Anna").And.Contain("<b>hi</b>");
        json.TryGetProperty("parse_mode", out _).Should().BeFalse("visitor text must not be interpreted as markup");
    }

    [Fact]
    public async Task Telegram_error_is_reported_without_leaking_the_token()
    {
        var h = new StubHandler(HttpStatusCode.BadRequest, "{\"ok\":false,\"description\":\"Bad Request: chat not found\"}");
        var ch = new TelegramChannel(Opts(), new HttpClient(h));
        var act = () => ch.SendAsync(new Notice("s", "b", null), default);
        var ex = (await act.Should().ThrowAsync<InvalidOperationException>()).Which;
        ex.Message.Should().Contain("chat not found").And.NotContain("SECRET-TOKEN");
    }

    [Fact]
    public async Task Telegram_truncates_very_long_messages()
    {
        var h = new StubHandler(HttpStatusCode.OK, "{}");
        await new TelegramChannel(Opts(), new HttpClient(h)).SendAsync(new Notice("s", new string('x', 9000), null), default);
        JsonDocument.Parse(h.Body!).RootElement.GetProperty("text").GetString()!.Length.Should().BeLessThanOrEqualTo(4100);
    }

    [Fact]
    public void Channels_report_whether_they_are_configured()
    {
        new TelegramChannel(Opts()).IsConfigured.Should().BeTrue();
        new TelegramChannel(Opts("", "42")).IsConfigured.Should().BeFalse();
        new EmailChannel(Options.Create(new NotificationOptions())).IsConfigured.Should().BeFalse();
    }

    private class FakeChannel(bool fail) : INotificationChannel
    {
        public string Name => fail ? "bad" : "good";
        public bool IsConfigured => true;
        public int Sent;
        public Task SendAsync(Notice n, CancellationToken ct) { if (fail) throw new InvalidOperationException("boom"); Interlocked.Increment(ref Sent); return Task.CompletedTask; }
    }

    [Fact]
    public async Task A_failing_channel_does_not_stop_the_others()
    {
        var queue = new NotificationQueue(); var bad = new FakeChannel(true); var good = new FakeChannel(false);
        var d = new NotificationDispatcher(queue, [bad, good], NullLogger<NotificationDispatcher>.Instance);
        await d.StartAsync(default);
        queue.Enqueue(new Notice("a", "b", null)); queue.Enqueue(new Notice("c", "d", null));
        for (var i = 0; i < 50 && good.Sent < 2; i++) await Task.Delay(50);
        await d.StopAsync(default);
        good.Sent.Should().Be(2);
    }
}
