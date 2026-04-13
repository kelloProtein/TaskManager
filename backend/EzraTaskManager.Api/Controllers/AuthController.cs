using EzraTaskManager.Api.DTOs;
using EzraTaskManager.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EzraTaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = _authService.Authenticate(request.Username, request.Password);

        return result is null
            ? Unauthorized(new { error = "Invalid username or password" })
            : Ok(result);
    }
}
