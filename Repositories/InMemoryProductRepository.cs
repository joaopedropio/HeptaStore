using HeptaStore.Models;

namespace HeptaStore.Repositories;

public class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _products =
    [
        new Product { Name = "Sample Product", Description = "A test product", Price = 9.99m }
    ];

    public IEnumerable<Product> GetAll() => _products;
}
