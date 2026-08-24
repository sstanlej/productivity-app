using System.Text.Json.Serialization;

namespace ProductivityApp.Api.Models;

public class TaskSession
{
    public int Id { get; set; }
    
    // Nullable TaskItemId: brak nadrzędnego zadania = pojedyncze zadanie direct (np. do koła fortuny)
    public int? TaskItemId { get; set; }
    
    [JsonIgnore]
    public TaskItem? TaskItem { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Nullable czasy: jeśli null, zadanie czeka na zaplanowanie na liście / backlogu
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public TaskSessionStatus Status { get; set; } = TaskSessionStatus.Planned;
    public int RescheduleCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}