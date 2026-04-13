using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EzraTaskManager.Api.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace EzraTaskManager.Api.Services;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    // Hardcoded demo credentials — production would use a database with bcrypt/Argon2 hashing
    private const string DemoUsername = "demo";
    private const string DemoPassword = "Password123!";

    public AuthService(IConfiguration config, ILogger<AuthService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public LoginResponse? Authenticate(string username, string password)
    {
        // FixedTimeEquals requires equal-length spans to be truly constant-time —
        // it short-circuits on length mismatch. Hashing both sides to a fixed-length
        // SHA256 digest ensures the comparison always takes the same time regardless
        // of input length. Production would use bcrypt/Argon2 instead.
        var usernameMatch = CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(username.ToLowerInvariant())),
            SHA256.HashData(Encoding.UTF8.GetBytes(DemoUsername)));

        var passwordMatch = CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(password)),
            SHA256.HashData(Encoding.UTF8.GetBytes(DemoPassword)));

        if (!usernameMatch || !passwordMatch)
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
