using System.ComponentModel.DataAnnotations;

namespace HeptaStore.DTOs;

public record UpdateProfileRequest(
    [EmailAddress] string? Email,
    string? CurrentPassword,
    [MinLength(6)] string? NewPassword
);
