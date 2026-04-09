using System.Net;
using System.Net.Http.Json;
using HeptaStore.Data;
using HeptaStore.DTOs;
using HeptaStore.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HeptaStore.Tests.Controllers;

public class ProductsControllerIntegrationTests : IAsyncLifetime
{
    private static readonly Guid SeededId = Guid.Parse("d5da0756-fa5f-49c8-b2a3-dbd56150e601");

    private readonly string _connectionString;
    private WebApplicationFactory<Program> _factory = null!;

    public ProductsControllerIntegrationTests()
    {
        _connectionString = $"Server=localhost,1433;Database=HeptaStore_Test_{Guid.NewGuid():N};User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;";
    }

    public async Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d =>
                        d.ServiceType == typeof(DbContextOptions<StoreDbContext>));
                    if (descriptor != null) services.Remove(descriptor);

                    services.AddDbContext<StoreDbContext>(options =>
                        options.UseSqlServer(_connectionString));
                });
            });

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        await db.Database.EnsureDeletedAsync();
        await _factory.DisposeAsync();
    }

    private HttpClient CreateClient(List<Product>? products = null)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        db.Products.RemoveRange(db.Products);
        db.SaveChanges();

        if (products?.Count > 0)
        {
            db.Products.AddRange(products);
            db.SaveChanges();
        }

        return _factory.CreateClient();
    }

    public static List<Product> FreshProducts() =>
    [
        new Product { Id = SeededId, Name = "Sample Product", Description = "A test product", Price = 9.99m }
    ];

    [Fact]
    public async Task Create_ReturnsCreatedWithProduct()
    {
        var client = CreateClient([]);
        var request = new CreateProductRequest { Name = "New Product", Description = "A desc", Price = 29.99m };

        var response = await client.PostAsJsonAsync("/products", request);
        var product = await response.Content.ReadFromJsonAsync<Product>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotEqual(Guid.Empty, product!.Id);
        Assert.Equal(request.Name, product.Name);
        Assert.Equal(request.Description, product.Description);
        Assert.Equal(request.Price, product.Price);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithProducts()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.GetAsync("/products");
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();

        var seeded = FreshProducts()[0];
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(products!);
        Assert.Equal(seeded.Id, products![0].Id);
        Assert.Equal(seeded.Name, products[0].Name);
        Assert.Equal(seeded.Description, products[0].Description);
        Assert.Equal(seeded.Price, products[0].Price);
    }

    [Fact]
    public async Task GetById_WithValidExistingId_ReturnsOkWithProduct()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.GetAsync($"/products/{SeededId}");
        var product = await response.Content.ReadFromJsonAsync<Product>();

        var seeded = FreshProducts()[0];
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(seeded.Id, product!.Id);
        Assert.Equal(seeded.Name, product.Name);
        Assert.Equal(seeded.Description, product.Description);
        Assert.Equal(seeded.Price, product.Price);
    }

    [Fact]
    public async Task GetById_WithInvalidGuid_ReturnsBadRequest()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.GetAsync("/products/not-a-guid");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_WithValidExistingId_ReturnsOkWithUpdatedProduct()
    {
        var client = CreateClient(FreshProducts());
        var request = new UpdateProductRequest { Name = "Updated", Description = "Updated desc", Price = 49.99m };

        var response = await client.PutAsJsonAsync($"/products/{SeededId}", request);
        var product = await response.Content.ReadFromJsonAsync<Product>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SeededId, product!.Id);
        Assert.Equal(request.Name, product.Name);
        Assert.Equal(request.Description, product.Description);
        Assert.Equal(request.Price, product.Price);
    }

    [Fact]
    public async Task Delete_WithValidExistingId_ReturnsNoContent()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.DeleteAsync($"/products/{SeededId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WhenEmpty_ReturnsOkWithEmptyList()
    {
        var client = CreateClient([]);

        var response = await client.GetAsync("/products");
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(products!);
    }

    [Fact]
    public async Task GetById_WithNonExistentId_ReturnsNotFound()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.GetAsync($"/products/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_WithNonExistentId_ReturnsNotFound()
    {
        var client = CreateClient(FreshProducts());
        var request = new UpdateProductRequest { Name = "Updated", Description = "Updated desc", Price = 49.99m };

        var response = await client.PutAsJsonAsync($"/products/{Guid.NewGuid()}", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_WithInvalidGuid_ReturnsBadRequest()
    {
        var client = CreateClient(FreshProducts());
        var request = new UpdateProductRequest { Name = "Updated", Description = "Updated desc", Price = 49.99m };

        var response = await client.PutAsJsonAsync("/products/not-a-guid", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WithNonExistentId_ReturnsNotFound()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.DeleteAsync($"/products/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WithInvalidGuid_ReturnsBadRequest()
    {
        var client = CreateClient(FreshProducts());

        var response = await client.DeleteAsync("/products/not-a-guid");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
