using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EzraTaskManager.Api.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace EzraTaskManager.Api.Services;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    // Hardcoded demo credentials — production would store users in a database
    // with bcrypt/Argon2-hashed passwords and use constant-time comparison.
    private const string DemoUsername = "demo";
    private const string DemoPassword = "Password123!";

    public AuthService(IConfiguration config, ILogger<AuthService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public LoginResponse? Authenticate(string username, string password)
    {
        if (!string.Equals(username, DemoUsername, StringComparison.OrdinalIgnoreCase)
            || password != DemoPassword)
        {
            _logger.LogWarning("Failed login attempt for username '{Username}'", username);
            return null;
        }

        _logger.LogInformation("User '{Username}' authenticated successfully", username);

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var expirationMinutes = int.Parse(_config["Jwt:ExpirationMinutes"] ?? "60");
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, DemoUsername),
                new Claim(JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64)
            },
            expires: expiration,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiration);
    }
}
