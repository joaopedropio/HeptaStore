using HeptaStore.Models;

namespace HeptaStore.Repositories;

public interface IProductRepository
{
    IEnumerable<Product> GetAll();
}
