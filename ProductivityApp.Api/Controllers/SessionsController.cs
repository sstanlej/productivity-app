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

    // POST: api/sessions (tutaj dodajemy sesję lub zadanie direct)
    [HttpPost]
    public async Task<ActionResult<TaskSession>> CreateSession([FromBody] TaskSession session)
    {
        if (session.TaskItemId.HasValue)
        {
            var parentTask = await _context.Tasks.FindAsync(session.TaskItemId.Value);
            if (parentTask == null) return NotFound("Zadanie nadrzędne nie istnieje.");

            if (parentTask.Deadline.HasValue && session.EndTime.HasValue && session.EndTime.Value > parentTask.Deadline.Value)
            {
                return BadRequest("Nie można zaplanować sesji poza ostatecznym terminem (Deadline) zadania głównego!");
            }
        }

        if (session.StartTime.HasValue)
            session.StartTime = DateTime.SpecifyKind(session.StartTime.Value, DateTimeKind.Utc);

        if (session.EndTime.HasValue)
            session.EndTime = DateTime.SpecifyKind(session.EndTime.Value, DateTimeKind.Utc);

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

    // PATCH: api/sessions/5/reschedule
    [HttpPatch("{id}/reschedule")]
    public async Task<IActionResult> RescheduleSession(int id, [FromBody] RescheduleRequest request)
    {
        var session = await _context.TaskSessions.Include(s => s.TaskItem).FirstOrDefaultAsync(s => s.Id == id);
        if (session == null) return NotFound();

        var newStart = DateTime.SpecifyKind(request.NewStartTime, DateTimeKind.Utc);
        var newEnd = DateTime.SpecifyKind(request.NewEndTime, DateTimeKind.Utc);

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

public class RescheduleRequest
{
    public DateTime NewStartTime { get; set; }
    public DateTime NewEndTime { get; set; }
}