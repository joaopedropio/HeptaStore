using HeptaStore.Controllers;
using HeptaStore.DTOs;
using HeptaStore.Models;
using HeptaStore.Repositories;
using HeptaStore.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace HeptaStore.Tests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly Mock<IFileStorageService> _fileStorageMock;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _fileStorageMock = new Mock<IFileStorageService>();
        _controller = new ProductsController(_repositoryMock.Object, _fileStorageMock.Object);
    }

    [Fact]
    public void Create_ReturnsCreatedWithProduct()
    {
        var request = new CreateProductRequest { Name = "New Product", Description = "Desc", Price = 10m };
        var product = new Product { Name = request.Name, Description = request.Description, Price = request.Price };
        _repositoryMock.Setup(r => r.Create(request.Name, request.Description, request.Price)).Returns(product);

        var result = _controller.Create(request);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var value = Assert.IsType<Product>(created.Value);
        Assert.Equal(request.Name, value.Name);
        Assert.Equal(request.Description, value.Description);
        Assert.Equal(request.Price, value.Price);
        Assert.Equal(nameof(_controller.GetById), created.ActionName);
    }

    [Fact]
    public void Get_ReturnsAllProducts()
    {
        var products = new List<Product>
        {
            new Product { Name = "Product A", Description = "Desc A", Price = 10m },
            new Product { Name = "Product B", Description = "Desc B", Price = 20m },
        };
        _repositoryMock.Setup(r => r.GetAll()).Returns(products);

        var result = _controller.Get().ToList();

        Assert.Equal(2, result.Count);
        Assert.Equal("Product A", result[0].Name);
        Assert.Equal("Product B", result[1].Name);
    }

    [Fact]
    public void Get_WhenRepositoryIsEmpty_ReturnsEmptyList()
    {
        _repositoryMock.Setup(r => r.GetAll()).Returns([]);

        var result = _controller.Get();

        Assert.Empty(result);
    }

    [Fact]
    public void GetById_WhenProductExists_ReturnsOkWithProduct()
    {
        var product = new Product { Name = "Product A", Description = "Desc A", Price = 10m };
        _repositoryMock.Setup(r => r.GetById(product.Id)).Returns(product);

        var result = _controller.GetById(product.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        var value = Assert.IsType<Product>(ok.Value);
        Assert.Equal(product.Id, value.Id);
        Assert.Equal(product.Name, value.Name);
        Assert.Equal(product.Description, value.Description);
        Assert.Equal(product.Price, value.Price);
    }

    [Fact]
    public void GetById_WhenProductDoesNotExist_ReturnsNotFound()
    {
        _repositoryMock.Setup(r => r.GetById(It.IsAny<Guid>())).Returns((Product?)null);

        var result = _controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void Update_WhenProductExists_ReturnsOkWithUpdatedProduct()
    {
        var id = Guid.NewGuid();
        var request = new UpdateProductRequest { Name = "New Name", Description = "New Desc", Price = 15m };
        var updatedProduct = new Product { Id = id, Name = request.Name, Description = request.Description, Price = request.Price };
        _repositoryMock.Setup(r => r.Update(id, request.Name, request.Description, request.Price)).Returns(updatedProduct);

        var result = _controller.Update(id, request);

        var ok = Assert.IsType<OkObjectResult>(result);
        var value = Assert.IsType<Product>(ok.Value);
        Assert.Equal(request.Name, value.Name);
        Assert.Equal(request.Description, value.Description);
        Assert.Equal(request.Price, value.Price);
    }

    [Fact]
    public void Update_WhenProductDoesNotExist_ReturnsNotFound()
    {
        _repositoryMock.Setup(r => r.Update(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<decimal>())).Returns((Product?)null);

        var result = _controller.Update(Guid.NewGuid(), new UpdateProductRequest());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void Delete_WhenProductExists_ReturnsNoContent()
    {
        _repositoryMock.Setup(r => r.Delete(It.IsAny<Guid>())).Returns(true);

        var result = _controller.Delete(Guid.NewGuid());

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public void Delete_WhenProductDoesNotExist_ReturnsNotFound()
    {
        _repositoryMock.Setup(r => r.Delete(It.IsAny<Guid>())).Returns(false);

        var result = _controller.Delete(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UploadImage_WhenProductExists_ReturnsOkWithUpdatedProduct()
    {
        var product = new Product { Name = "Product A", Description = "Desc A", Price = 10m };
        var imagePath = "abc.jpg";
        var updatedProduct = new Product { Id = product.Id, Name = product.Name, Description = product.Description, Price = product.Price, ImagePath = imagePath };

        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(100);
        fileMock.Setup(f => f.FileName).Returns("abc.jpg");

        _repositoryMock.Setup(r => r.GetById(product.Id)).Returns(product);
        _fileStorageMock.Setup(s => s.SaveAsync(fileMock.Object)).ReturnsAsync(imagePath);
        _repositoryMock.Setup(r => r.UpdateImagePath(product.Id, imagePath)).Returns(updatedProduct);

        var request = new UploadProductImageRequest { ProductId = product.Id, Image = fileMock.Object };
        var result = await _controller.UploadImage(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        var value = Assert.IsType<Product>(ok.Value);
        Assert.Equal(imagePath, value.ImagePath);
    }

    [Fact]
    public async Task UploadImage_WhenProductDoesNotExist_ReturnsNotFound()
    {
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(100);
        fileMock.Setup(f => f.FileName).Returns("photo.png");

        _repositoryMock.Setup(r => r.GetById(It.IsAny<Guid>())).Returns((Product?)null);

        var request = new UploadProductImageRequest { ProductId = Guid.NewGuid(), Image = fileMock.Object };
        var result = await _controller.UploadImage(request);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UploadImage_WhenImageIsEmpty_ReturnsBadRequest()
    {
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(0);

        var request = new UploadProductImageRequest { ProductId = Guid.NewGuid(), Image = fileMock.Object };
        var result = await _controller.UploadImage(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UploadImage_WhenImageHasInvalidExtension_ReturnsBadRequest()
    {
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(100);
        fileMock.Setup(f => f.FileName).Returns("file.gif");

        var request = new UploadProductImageRequest { ProductId = Guid.NewGuid(), Image = fileMock.Object };
        var result = await _controller.UploadImage(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UploadImage_WhenImageIsNull_ReturnsBadRequest()
    {
        var request = new UploadProductImageRequest { ProductId = Guid.NewGuid(), Image = null! };
        var result = await _controller.UploadImage(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void DownloadImage_WhenProductHasImage_ReturnsFileResult()
    {
        var product = new Product { Name = "A", Description = "B", Price = 1m, ImagePath = "abc.png" };
        _repositoryMock.Setup(r => r.GetById(product.Id)).Returns(product);
        _fileStorageMock.Setup(s => s.Download(product.ImagePath)).Returns(new MemoryStream([0x01]));

        var result = _controller.DownloadImage(product.Id);

        var file = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("image/png", file.ContentType);
    }

    [Fact]
    public void DownloadImage_WhenProductDoesNotExist_ReturnsNotFound()
    {
        _repositoryMock.Setup(r => r.GetById(It.IsAny<Guid>())).Returns((Product?)null);

        var result = _controller.DownloadImage(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void DownloadImage_WhenProductHasNoImage_ReturnsNotFound()
    {
        var product = new Product { Name = "A", Description = "B", Price = 1m, ImagePath = null };
        _repositoryMock.Setup(r => r.GetById(product.Id)).Returns(product);

        var result = _controller.DownloadImage(product.Id);

        Assert.IsType<NotFoundResult>(result);
    }
}
