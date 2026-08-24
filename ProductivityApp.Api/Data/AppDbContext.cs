using Microsoft.EntityFrameworkCore;
using ProductivityApp.Api.Models;

namespace ProductivityApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks { get; set; }
    public DbSet<TaskSession> TaskSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskSession>()
            .HasOne(s => s.TaskItem)
            .WithMany(t => t.Sessions)
            .HasForeignKey(s => s.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}