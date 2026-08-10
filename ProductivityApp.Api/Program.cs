using Microsoft.EntityFrameworkCore;
using ProductivityApp.Api.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Adres frontendu w Angularze
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Rejestracja kontrolerów oraz wbudowanego w .NET OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Konfiguracja interfejsu wizualnego
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();
app.UseCors("AllowAngular");

app.UseAuthorization();
app.MapControllers();

app.Run();