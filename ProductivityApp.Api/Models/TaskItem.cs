namespace ProductivityApp.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Obsługa ostatecznego terminu i jego modyfikacji
    public DateTime? OriginalDeadline { get; set; }
    public DateTime? Deadline { get; set; }
    public bool CanExtendDeadline { get; set; } = true;
    public int DeadlineShiftCount { get; set; } = 0;

    // Relacja z pod-sesjami
    public List<TaskSession> Sessions { get; set; } = new();
}