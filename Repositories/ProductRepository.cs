using HeptaStore.Data;
using HeptaStore.Models;

namespace HeptaStore.Repositories;

public class ProductRepository(StoreDbContext db) : IProductRepository
{
    public Product Create(string name, string description, decimal price)
    {
        var product = new Product
        {
            Name = name,
            Description = description,
            Price = price
        };

        db.Products.Add(product);
        db.SaveChanges();

        return product;
    }

    public IEnumerable<Product> GetAll() =>
        db.Products.ToList();

    public Product? GetById(Guid id) =>
        db.Products.Find(id);

    public Product? Update(Guid id, string name, string description, decimal price)
    {
        var product = db.Products.Find(id);
        if (product is null) return null;

        product.Name = name;
        product.Description = description;
        product.Price = price;
        product.UpdatedAt = DateTime.UtcNow;

        db.SaveChanges();

        return product;
    }

    public Product? UpdateImagePath(Guid id, string imagePath)
    {
        var product = db.Products.Find(id);
        if (product is null) return null;

        product.ImagePath = imagePath;
        product.UpdatedAt = DateTime.UtcNow;

        db.SaveChanges();

        return product;
    }

    public bool Delete(Guid id)
    {
        var product = db.Products.Find(id);
        if (product is null) return false;

        db.Products.Remove(product);
        db.SaveChanges();

        return true;
    }
}
