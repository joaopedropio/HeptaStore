using HeptaStore.Models;
using HeptaStore.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HeptaStore.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repository;

    public ProductsController(IProductRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public IEnumerable<Product> Get() => _repository.GetAll();
}
