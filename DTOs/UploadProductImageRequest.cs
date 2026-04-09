namespace HeptaStore.DTOs;

public class UploadProductImageRequest
{
    public Guid ProductId { get; set; }
    public IFormFile Image { get; set; } = null!;
}
