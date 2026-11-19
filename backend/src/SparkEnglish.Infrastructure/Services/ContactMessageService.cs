using Microsoft.EntityFrameworkCore;
using SparkEnglish.Application.Dtos;
using SparkEnglish.Application.Exceptions;
using SparkEnglish.Application.Interfaces;
using SparkEnglish.Domain.Entities;
using SparkEnglish.Infrastructure.Persistence;

namespace SparkEnglish.Infrastructure.Services;

public class ContactMessageService(AppDbContext db) : IContactMessageService
{
    public async Task<ContactMessageDto> SubmitAsync(ContactMessageRequest r, int? userId, CancellationToken ct)
    {
        var m = new ContactMessage { Name = r.Name.Trim(), Email = r.Email.Trim().ToLowerInvariant(), Message = r.Message.Trim(), UserId = userId };
        db.ContactMessages.Add(m);
        await db.SaveChangesAsync(ct);
        return ToDto(m);
    }

    public async Task<PagedResult<ContactMessageDto>> ListAsync(bool? unreadOnly, int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = Paging.Normalize(page, pageSize);
        var q = db.ContactMessages.AsNoTracking().AsQueryable();
        if (unreadOnly == true) q = q.Where(m => !m.IsRead);
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(items.Select(ToDto).ToList(), page, pageSize, total);
    }

    public async Task<ContactMessageDto> SetReadAsync(int id, bool isRead, CancellationToken ct)
    {
        var m = await db.ContactMessages.FindAsync([id], ct) ?? throw new NotFoundException("Message not found.");
        m.IsRead = isRead;
        await db.SaveChangesAsync(ct);
        return ToDto(m);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var m = await db.ContactMessages.FindAsync([id], ct) ?? throw new NotFoundException("Message not found.");
        db.ContactMessages.Remove(m);
        await db.SaveChangesAsync(ct);
    }

    private static ContactMessageDto ToDto(ContactMessage m) => new(m.Id, m.Name, m.Email, m.Message, m.IsRead, m.CreatedAt);
}
