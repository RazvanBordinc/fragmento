using Fragmento_server.Models.Entities;
using System.Security.Claims;

namespace Fragmento_server.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
        DateTime GetTokenExpirationTime();
    }
}
