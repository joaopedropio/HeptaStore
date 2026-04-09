using HeptaStore.Data;
using HeptaStore.Repositories;
using HeptaStore.Services;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartHeadersLengthLimit = 16 * 1024 * 1024; // 16 MB
    options.MultipartBodyLengthLimit = 16 * 1024 * 1024;    // 16 MB
});
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

public partial class Program { }
