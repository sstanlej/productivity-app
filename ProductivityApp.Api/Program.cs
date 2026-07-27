using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Rejestracja kontrolerów oraz wbudowanego w .NET OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// 2. Konfiguracja interfejsu wizualnego
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Udostępnia OpenAPI pod /openapi/v1.json

    // Domyślny, czysty start Scalara
    app.MapScalarApiReference();
}

// Wyłączone na czas testów lokalnych
// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();