using System.ComponentModel.DataAnnotations;

namespace HeptaStore.DTOs;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    bool IsManager = false
);
