using HeptaStore.Models;

namespace HeptaStore.Repositories;

public interface IProductRepository
{
    Product Create(string name, string description, decimal price);
    IEnumerable<Product> GetAll();
    Product? GetById(Guid id);
    Product? Update(Guid id, string name, string description, decimal price);
    bool Delete(Guid id);
}
