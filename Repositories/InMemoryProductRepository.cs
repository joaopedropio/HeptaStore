using HeptaStore.Models;

namespace HeptaStore.Repositories;

public class InMemoryProductRepository : IProductRepository
{
    private static readonly List<Product> _defaultProducts =
    [
        new Product { Id = Guid.Parse("d5da0756-fa5f-49c8-b2a3-dbd56150e601"), Name = "Sample Product", Description = "A test product", Price = 9.99m }
    ];

    private readonly List<Product> _products;

    public InMemoryProductRepository(List<Product>? products = null)
    {
        _products = products ?? _defaultProducts;
    }

    public Product Create(string name, string description, decimal price)
    {
        var product = new Product { Name = name, Description = description, Price = price };
        _products.Add(product);
        return product;
    }

    public IEnumerable<Product> GetAll() => _products;
    public Product? GetById(Guid id) => _products.FirstOrDefault(p => p.Id == id);

    public Product? Update(Guid id, string name, string description, decimal price)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product is null) return null;

        product.Name = name;
        product.Description = description;
        product.Price = price;
        product.UpdatedAt = DateTime.UtcNow;
        return product;
    }

    public bool Delete(Guid id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product is null) return false;

        _products.Remove(product);
        return true;
    }
}
