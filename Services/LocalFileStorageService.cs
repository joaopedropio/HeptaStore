namespace HeptaStore.Services;

public class LocalFileStorageService(IWebHostEnvironment env, IConfiguration configuration) : IFileStorageService
{
    private string StoragePath
    {
        get
        {
            var configured = configuration["FileStorage:Path"]
                ?? throw new InvalidOperationException("FileStorage:Path is not configured.");

            return Path.IsPathRooted(configured)
                ? configured
                : Path.Combine(env.ContentRootPath, configured);
        }
    }

    public async Task<string> SaveAsync(IFormFile file)
    {
        Directory.CreateDirectory(StoragePath);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(StoragePath, fileName);

        await using var stream = File.Create(filePath);
        await file.CopyToAsync(stream);

        return fileName;
    }

    public Stream Download(string imagePath)
    {
        var fullPath = Path.Combine(StoragePath, imagePath);
        return File.OpenRead(fullPath);
    }
}
