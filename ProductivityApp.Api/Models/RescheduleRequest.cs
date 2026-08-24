namespace ProductivityApp.Api.Models;

public class RescheduleRequest
{
    public DateTime NewStartTime { get; set; }
    public DateTime NewEndTime { get; set; }
}