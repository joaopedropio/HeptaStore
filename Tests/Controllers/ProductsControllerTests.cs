using HeptaStore.Controllers;
using HeptaStore.Models;
using HeptaStore.Repositories;
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
    public void Get_ReturnsAllProducts()
    {
        var products = new List<Product>
        {
            new Product { Name = "Product A", Description = "Desc A", Price = 10m },
            new Product { Name = "Product B", Description = "Desc B", Price = 20m },
        };
        _repositoryMock.Setup(r => r.GetAll()).Returns(products);

        var result = _controller.Get();

        Assert.Equal(products, result);
    }

    [Fact]
    public void Get_WhenRepositoryIsEmpty_ReturnsEmptyList()
    {
        _repositoryMock.Setup(r => r.GetAll()).Returns([]);

        var result = _controller.Get();

        Assert.Empty(result);
    }
}
