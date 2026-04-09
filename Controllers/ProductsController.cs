using HeptaStore.DTOs;
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

    [HttpPost]
    public IActionResult Create(CreateProductRequest request)
    {
        var product = _repository.Create(request.Name, request.Description, request.Price);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpGet]
    public IEnumerable<Product> Get() => _repository.GetAll();

    [HttpGet("{id}")]
    public IActionResult GetById(Guid id)
    {
        var product = _repository.GetById(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPut("{id}")]
    public IActionResult Update(Guid id, UpdateProductRequest request)
    {
        var product = _repository.Update(id, request.Name, request.Description, request.Price);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        return _repository.Delete(id) ? NoContent() : NotFound();
    }
}
