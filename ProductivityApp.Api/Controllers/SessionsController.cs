using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductivityApp.Api.Data;
using ProductivityApp.Api.Models;

namespace ProductivityApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SessionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/sessions/calendar?from=...&to=...
    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<TaskSession>>> GetCalendarSessions([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var fromUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
        var toUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);

        var sessions = await _context.TaskSessions
            .Where(s => s.StartTime.HasValue && s.EndTime.HasValue 
                     && s.StartTime.Value >= fromUtc && s.EndTime.Value <= toUtc)
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        return Ok(sessions);
    }

    // GET: api/sessions/unplanned
    [HttpGet("unplanned")]
    public async Task<ActionResult<IEnumerable<TaskSession>>> GetUnplannedSessions()
    {
        var sessions = await _context.TaskSessions
            .Where(s => s.StartTime == null || s.EndTime == null)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(sessions);
    }

    // POST: api/sessions (tworzenie sesji z walidacją kolizji i deadline'u)
    [HttpPost]
    public async Task<ActionResult<TaskSession>> CreateSession([FromBody] TaskSession session)
    {
        if (session.StartTime.HasValue && session.EndTime.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(session.StartTime.Value, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(session.EndTime.Value, DateTimeKind.Utc);

            if (endUtc <= startUtc)
            {
                return BadRequest("Czas zakończenia musi być późniejszy niż czas rozpoczęcia.");
            }

            // 1. Walidacja kolizji czasowej z innymi zaplanowanymi sesjami
            bool hasOverlap = await _context.TaskSessions.AnyAsync(s =>
                s.StartTime.HasValue && s.EndTime.HasValue &&
                startUtc < s.EndTime.Value && endUtc > s.StartTime.Value);

            if (hasOverlap)
            {
                return BadRequest("W tym przedziale czasowym masz już zaplanowane inne zadanie!");
            }

            session.StartTime = startUtc;
            session.EndTime = endUtc;
        }

        // 2. Walidacja deadline'u zadania nadrzędnego
        if (session.TaskItemId.HasValue)
        {
            var parentTask = await _context.Tasks.FindAsync(session.TaskItemId.Value);
            if (parentTask == null) return NotFound("Zadanie nadrzędne nie istnieje.");

            if (parentTask.Deadline.HasValue && session.EndTime.HasValue && session.EndTime.Value > parentTask.Deadline.Value)
            {
                return BadRequest("Nie można zaplanować sesji poza ostatecznym terminem (Deadline) zadania głównego!");
            }
        }

        session.CreatedAt = DateTime.UtcNow;
        _context.TaskSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // PATCH: api/sessions/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] TaskSessionStatus status)
    {
        var session = await _context.TaskSessions.FindAsync(id);
        if (session == null) return NotFound();

        session.Status = status;
        await _context.SaveChangesAsync();
        return Ok(session);
    }

    // PATCH: api/sessions/5/reschedule (przesunięcie z walidacją kolizji i deadline'u)
    [HttpPatch("{id}/reschedule")]
    public async Task<IActionResult> RescheduleSession(int id, [FromBody] RescheduleRequest request)
    {
        var session = await _context.TaskSessions.Include(s => s.TaskItem).FirstOrDefaultAsync(s => s.Id == id);
        if (session == null) return NotFound();

        var newStart = DateTime.SpecifyKind(request.NewStartTime, DateTimeKind.Utc);
        var newEnd = DateTime.SpecifyKind(request.NewEndTime, DateTimeKind.Utc);

        if (newEnd <= newStart)
        {
            return BadRequest("Czas zakończenia musi być późniejszy niż czas rozpoczęcia.");
        }

        // Sprawdzamy kolizję z wyłączeniem aktualnie edytowanej sesji (s.Id != id)
        bool hasOverlap = await _context.TaskSessions.AnyAsync(s =>
            s.Id != id &&
            s.StartTime.HasValue && s.EndTime.HasValue &&
            newStart < s.EndTime.Value && newEnd > s.StartTime.Value);

        if (hasOverlap)
        {
            return BadRequest("Nie można przesunąć: w docelowym terminie masz już inne zadanie!");
        }

        if (session.TaskItem?.Deadline != null && newEnd > session.TaskItem.Deadline.Value)
        {
            return BadRequest("Przesunięcie przekracza dopuszczalny termin zadania nadrzędnego!");
        }

        session.StartTime = newStart;
        session.EndTime = newEnd;
        session.RescheduleCount++;
        session.Status = TaskSessionStatus.Planned;

        await _context.SaveChangesAsync();
        return Ok(session);
    }

    // DELETE: api/sessions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var session = await _context.TaskSessions.FindAsync(id);
        if (session == null) return NotFound();

        _context.TaskSessions.Remove(session);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}