namespace HeptaStore.Services;

public interface IFileStorageService
{
    Task<string> SaveAsync(IFormFile file);
    Stream Download(string imagePath);
    void Delete(string imagePath);
}
