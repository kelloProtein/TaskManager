using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using EzraTaskManager.Api.Services;

namespace EzraTaskManager.Tests;

public class AuthServiceTests
{
    private readonly AuthService _service;
    private readonly IConfiguration _config;

    private const string TestKey = "ThisIsATestKeyThatIsAtLeast32BytesLong!!!";
    private const string TestIssuer = "TestIssuer";
    private const string TestAudience = "TestAudience";

    public AuthServiceTests()
    {
        var configData = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = TestKey,
            ["Jwt:Issuer"] = TestIssuer,
            ["Jwt:Audience"] = TestAudience,
            ["Jwt:ExpirationMinutes"] = "60"
        };
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var loggerMock = new Mock<ILogger<AuthService>>();
        _service = new AuthService(_config, loggerMock.Object);
    }

    [Fact]
    public void Authenticate_ReturnsToken_WhenCredentialsValid()
    {
        var result = _service.Authenticate("demo", "Password123!");

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.Token));
        Assert.True(result.Expiration > DateTime.UtcNow);
    }

    [Fact]
    public void Authenticate_ReturnsNull_WhenUsernameWrong()
    {
        var result = _service.Authenticate("wrong", "Password123!");

        Assert.Null(result);
    }

    [Fact]
    public void Authenticate_ReturnsNull_WhenPasswordWrong()
    {
        var result = _service.Authenticate("demo", "wrongpassword");

        Assert.Null(result);
    }

    [Fact]
    public void Authenticate_TokenContainsExpectedClaims()
    {
        var result = _service.Authenticate("demo", "Password123!");
        Assert.NotNull(result);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result!.Token);

        Assert.Equal("demo", jwt.Subject);
        Assert.Equal(TestIssuer, jwt.Issuer);
        Assert.Contains(TestAudience, jwt.Audiences);
    }
}
