using HeptaStore.DTOs;
using HeptaStore.Models;
using HeptaStore.Repositories;
using HeptaStore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace HeptaStore.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repository;
    private readonly IFileStorageService _fileStorage;

    public ProductsController(IProductRepository repository, IFileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
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
    [Authorize(Roles = "Manager")]
    public IActionResult Update(Guid id, UpdateProductRequest request)
    {
        var product = _repository.Update(id, request.Name, request.Description, request.Price);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UploadImage([FromForm] UploadProductImageRequest request)
    {
        if (request.Image is null || request.Image.Length == 0)
            return BadRequest("Image file is required.");

        var ext = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png"))
            return BadRequest("Only .jpg, .jpeg and .png files are allowed.");

        var product = _repository.GetById(request.ProductId);
        if (product is null) return NotFound();

        var oldImagePath = product.ImagePath;
        var imagePath = await _fileStorage.SaveAsync(request.Image);
        var updated = _repository.UpdateImagePath(request.ProductId, imagePath);

        if (oldImagePath is not null)
            _fileStorage.Delete(oldImagePath);

        return Ok(updated);
    }

    [HttpGet("{id}/image")]
    public IActionResult DownloadImage(Guid id)
    {
        var product = _repository.GetById(id);
        if (product is null || product.ImagePath is null) return NotFound();

        var stream = _fileStorage.Download(product.ImagePath);
        var ext = Path.GetExtension(product.ImagePath).ToLowerInvariant();
        var contentType = ext == ".png" ? "image/png" : "image/jpeg";

        return File(stream, contentType);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public IActionResult Delete(Guid id)
    {
        var product = _repository.GetById(id);
        if (product is null) return NotFound();

        if (product.ImagePath is not null)
            _fileStorage.Delete(product.ImagePath);

        _repository.Delete(id);
        return NoContent();
    }
}
