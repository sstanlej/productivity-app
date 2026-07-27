using Microsoft.EntityFrameworkCore;
using ProductivityApp.Api.Models;

namespace ProductivityApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Stworzenie tabeli Tasks z kolumnami odpowiadającymi właściwościom klasy TaskItem
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}