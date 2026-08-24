using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductivityApp.Api.Data;
using ProductivityApp.Api.Models;

namespace ProductivityApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks (Pobiera wszystkie cele główne wraz z przypisanymi sesjami pracy)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .Include(t => t.Sessions) // Jawne dołączenie relacji sesji z bazy danych
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    // GET: api/tasks/5 (Pobiera pojedynczy cel główny po ID z historią sesji)
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Sessions)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound($"Zadanie o ID {id} nie zostało odnalezione.");
        }

        return Ok(task);
    }

    // POST: api/tasks (Tworzenie nowego celu nadrzędnego)
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask([FromBody] TaskItem task)
    {
        // Ujednolicenie strefy czasowej na UTC dla PostgreSQL
        if (task.Deadline.HasValue)
        {
            task.Deadline = DateTime.SpecifyKind(task.Deadline.Value, DateTimeKind.Utc);
            task.OriginalDeadline = task.Deadline;
        }

        task.CreatedAt = DateTime.UtcNow;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PATCH: api/tasks/5/shift-deadline (Awaryjne przesunięcie deadline'u nadrzędnego)
    [HttpPatch("{id}/shift-deadline")]
    public async Task<IActionResult> ShiftDeadline(int id, [FromBody] DateTime newDeadline)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound($"Nie znaleziono zadania o ID {id}.");
        }

        // Blokada dla zadań o nieprzekraczalnym terminie (np. egzamin)
        if (!task.CanExtendDeadline)
        {
            return BadRequest("To zadanie ma zablokowaną możliwość zmiany deadline'u!");
        }

        task.Deadline = DateTime.SpecifyKind(newDeadline, DateTimeKind.Utc);
        task.DeadlineShiftCount++;

        await _context.SaveChangesAsync();
        return Ok(task);
    }

    // DELETE: api/tasks/5 (Usuwanie zadania nadrzędnego wraz z jego sesjami)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound($"Nie znaleziono zadania o ID {id}.");
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}