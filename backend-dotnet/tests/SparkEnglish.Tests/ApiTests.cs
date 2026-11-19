using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Domain.Enums;

namespace SparkEnglish.Tests;

public class ApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Health_is_ok()
    {
        var res = await factory.CreateClient().GetAsync("/health");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Courses_are_public_and_seeded()
    {
        var courses = await factory.CreateClient().GetFromJsonAsync<List<CourseDto>>("/api/courses");
        courses.Should().HaveCountGreaterOrEqualTo(3);
        courses!.First(c => c.Slug == "mini-group").Schedules.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Register_then_login_works_and_duplicate_conflicts()
    {
        var (client, auth) = await factory.ParentClientAsync("dup@test.com");
        auth.Role.Should().Be("Parent");
        (await client.GetFromJsonAsync<UserResponse>("/api/auth/me"))!.Email.Should().Be("dup@test.com");

        var dup = await factory.CreateClient().PostAsJsonAsync("/api/auth/register", new RegisterRequest("X", "dup@test.com", "Password123"));
        dup.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var bad = await factory.CreateClient().PostAsJsonAsync("/api/auth/login", new LoginRequest("dup@test.com", "wrong"));
        bad.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_validates_input()
    {
        var res = await factory.CreateClient().PostAsJsonAsync("/api/auth/register", new RegisterRequest("", "not-an-email", "123"));
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.Should().Contain("email").And.Contain("password");
    }

    [Fact]
    public async Task Anonymous_can_book_trial_but_cannot_list()
    {
        var anon = factory.CreateClient();
        var res = await anon.PostAsJsonAsync("/api/trial-requests",
            new TrialRequestRequest("Maria", "maria@test.com", 8, "evening", "hi", null, null));
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        (await anon.GetAsync("/api/trial-requests")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Parent_cannot_access_admin_endpoints()
    {
        var (parent, _) = await factory.ParentClientAsync();
        (await parent.GetAsync("/api/trial-requests")).StatusCode.Should().Be(HttpStatusCode.Forbidden);
        (await parent.GetAsync("/api/messages")).StatusCode.Should().Be(HttpStatusCode.Forbidden);
        (await parent.GetAsync("/api/admin/stats")).StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Trial_rejects_bad_age_and_unknown_course()
    {
        var c = factory.CreateClient();
        (await c.PostAsJsonAsync("/api/trial-requests", new TrialRequestRequest("A", "a@test.com", 40, null, null, null, null)))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await c.PostAsJsonAsync("/api/trial-requests", new TrialRequestRequest("A", "a@test.com", 9, null, null, 9999, null)))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Admin_can_triage_trial_requests_and_parent_sees_own()
    {
        var (parent, _) = await factory.ParentClientAsync();
        var created = await (await parent.PostAsJsonAsync("/api/trial-requests",
            new TrialRequestRequest("Parent", "own@test.com", 7, "weekend", null, 1, null))).Content.ReadFromJsonAsync<TrialRequestDto>();
        created!.Status.Should().Be(TrialStatus.Pending);

        (await parent.GetFromJsonAsync<List<TrialRequestDto>>("/api/trial-requests/me"))!
            .Should().Contain(t => t.Id == created.Id);

        var admin = await factory.AdminClientAsync();
        var patch = await admin.PatchAsJsonAsync($"/api/trial-requests/{created.Id}/status", new UpdateTrialStatusRequest(TrialStatus.Scheduled));
        patch.StatusCode.Should().Be(HttpStatusCode.OK);

        var page = await admin.GetFromJsonAsync<PagedResult<TrialRequestDto>>("/api/trial-requests?status=Scheduled&search=own@test");
        page!.Items.Should().ContainSingle(t => t.Id == created.Id);

        (await admin.DeleteAsync($"/api/trial-requests/{created.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await admin.DeleteAsync($"/api/trial-requests/{created.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Contact_message_flow_and_stats()
    {
        var res = await factory.CreateClient().PostAsJsonAsync("/api/messages", new ContactMessageRequest("Luca", "luca@test.com", "Hello!"));
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var msg = (await res.Content.ReadFromJsonAsync<ContactMessageDto>())!;

        var admin = await factory.AdminClientAsync();
        var before = (await admin.GetFromJsonAsync<AdminStatsDto>("/api/admin/stats"))!;
        before.UnreadMessages.Should().BeGreaterThan(0);

        (await admin.PatchAsJsonAsync($"/api/messages/{msg.Id}/read", new UpdateMessageReadRequest(true))).EnsureSuccessStatusCode();
        var after = (await admin.GetFromJsonAsync<AdminStatsDto>("/api/admin/stats"))!;
        after.UnreadMessages.Should().Be(before.UnreadMessages - 1);
    }

    [Fact]
    public async Task Admin_course_and_schedule_crud()
    {
        var admin = await factory.AdminClientAsync();
        var req = new CourseRequest("test-course", CourseFormat.MiniGroup, "Test", "Prova", "d", "d", 6, 10, 45, 4, 12m, false);

        var created = await (await admin.PostAsJsonAsync("/api/courses", req)).Content.ReadFromJsonAsync<CourseDto>();
        (await admin.PostAsJsonAsync("/api/courses", req)).StatusCode.Should().Be(HttpStatusCode.Conflict);

        var sched = await admin.PostAsJsonAsync($"/api/courses/{created!.Id}/schedules", new ScheduleRequest(DayOfWeek.Friday, "15:30", 4));
        sched.StatusCode.Should().Be(HttpStatusCode.Created);

        var fetched = await factory.CreateClient().GetFromJsonAsync<CourseDto>($"/api/courses/{created.Id}");
        fetched!.Schedules.Should().ContainSingle(s => s.StartTime == "15:30");

        (await admin.PutAsJsonAsync($"/api/courses/{created.Id}", req with { MinAge = 12, MaxAge = 8 }))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await admin.DeleteAsync($"/api/courses/{created.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
