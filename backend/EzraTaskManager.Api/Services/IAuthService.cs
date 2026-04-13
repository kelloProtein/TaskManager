using EzraTaskManager.Api.DTOs;

namespace EzraTaskManager.Api.Services;

public interface IAuthService
{
    LoginResponse? Authenticate(string username, string password);
}
