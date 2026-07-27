namespace ProductivityApp.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime OriginalDueDate { get; set; }
    public DateTime CurrentDueDate { get; set; }

    public int RescheduleCount { get; set; } = 0;
    public int PointsValue { get; set; } = 10;
}