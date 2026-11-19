using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Interfaces;

namespace SparkEnglish.Tests;

public class NotificationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private class FakeNotifier : INotificationService
    {
        public List<TrialRequestDto> Trials { get; } = new();
        public List<ContactMessageDto> Messages { get; } = new();
        public void TrialRequested(TrialRequestDto t) => Trials.Add(t);
        public void MessageReceived(ContactMessageDto m) => Messages.Add(m);
    }

    [Fact]
    public async Task Owner_is_notified_of_new_trial_requests_and_messages()
    {
        var fake = new FakeNotifier();
        var client = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            s.RemoveAll<INotificationService>();
            s.AddSingleton<INotificationService>(fake);
        })).CreateClient();

        (await client.PostAsJsonAsync("/api/trial-requests", new TrialRequestRequest("Anna", "anna@test.com", 8, "evening", "hi", null, null)))
            .StatusCode.Should().Be(HttpStatusCode.Created);
        (await client.PostAsJsonAsync("/api/messages", new ContactMessageRequest("Luca", "luca@test.com", "Hello")))
            .StatusCode.Should().Be(HttpStatusCode.Created);

        fake.Trials.Should().ContainSingle(t => t.Email == "anna@test.com");
        fake.Messages.Should().ContainSingle(m => m.Email == "luca@test.com");
    }

    [Fact]
    public async Task Invalid_requests_do_not_notify()
    {
        var fake = new FakeNotifier();
        var client = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            s.RemoveAll<INotificationService>();
            s.AddSingleton<INotificationService>(fake);
        })).CreateClient();
        (await client.PostAsJsonAsync("/api/messages", new ContactMessageRequest("", "bad", ""))).StatusCode.Should().Be(HttpStatusCode.BadRequest);
        fake.Messages.Should().BeEmpty();
    }
}
