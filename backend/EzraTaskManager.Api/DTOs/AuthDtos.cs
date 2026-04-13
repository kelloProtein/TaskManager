using System.ComponentModel.DataAnnotations;

namespace EzraTaskManager.Api.DTOs;

public record LoginRequest(
    [Required][MaxLength(100)] string Username,
    [Required][MaxLength(100)] string Password
);

public record LoginResponse(
    string Token,
    DateTime Expiration
);
