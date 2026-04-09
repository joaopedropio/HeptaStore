using HeptaStore.Controllers;
using HeptaStore.DTOs;
using HeptaStore.Models;
using HeptaStore.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace HeptaStore.Tests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _controller = new ProductsController(_repositoryMock.Object);
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
}
