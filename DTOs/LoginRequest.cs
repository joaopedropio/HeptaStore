using System.ComponentModel.DataAnnotations;

namespace HeptaStore.DTOs;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);
