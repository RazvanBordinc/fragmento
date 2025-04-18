using System;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Fragmento_server.Models.Entities;
using Fragmento_server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Fragmento_server.Services.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;

        public AuthController(
            FragmentoDbContext context,
            IPasswordService passwordService,
            IJwtService jwtService,
            IConfiguration configuration)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if email is already in use
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return Conflict(new { message = "Email is already in use" });
            }

            // Check if username is already taken
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return Conflict(new { message = "Username is already taken" });
            }

            // Check if password is strong enough
            if (!_passwordService.IsStrongPassword(request.Password))
            {
                return BadRequest(new { message = "Password is not strong enough. It should contain at least 8 characters, including uppercase, lowercase, numbers, and special characters." });
            }

            // Create new user
            var user = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = _passwordService.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                LastActive = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpiration = _jwtService.GetTokenExpirationTime();

            // Store refresh token
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7), // Refresh tokens valid for 7 days
                UserId = user.Id,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            // Return user info and tokens
            return Ok(new AuthResponse
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                Token = token,
                RefreshToken = refreshToken,
                TokenExpiration = tokenExpiration
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find user by username
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            // Check if user exists
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Update last active timestamp
            user.LastActive = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpiration = _jwtService.GetTokenExpirationTime();

            // Revoke any existing refresh tokens
            var existingTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
                .ToListAsync();

            foreach (var existingToken in existingTokens)
            {
                existingToken.IsRevoked = true;
            }

            // Store new refresh token
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7), // Refresh tokens valid for 7 days
                UserId = user.Id,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();
            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = false, // Set to true in production
                Expires = DateTime.UtcNow.AddMinutes(60),
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
            // Return user info and tokens
            return Ok(new AuthResponse
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                Token = token,
                RefreshToken = refreshToken,
                TokenExpiration = tokenExpiration
            });
        }

        // POST: api/auth/refresh
        [HttpPost("refresh")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<AuthResponse>> RefreshToken(RefreshTokenRequest request)
        {
            // Extract token from Authorization header
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return BadRequest(new { message = "Missing or invalid access token" });
            }

            var accessToken = authHeader.Substring("Bearer ".Length).Trim();

            try
            {
                // Validate the expired token
                var principal = _jwtService.GetPrincipalFromExpiredToken(accessToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Invalid access token" });
                }

                // Get user
                var user = await _context.Users.FindAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Validate refresh token
                var storedToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken &&
                                             rt.UserId == user.Id &&
                                             !rt.IsRevoked &&
                                             rt.ExpiryDate > DateTime.UtcNow);

                if (storedToken == null)
                {
                    return Unauthorized(new { message = "Invalid or expired refresh token" });
                }

                // Generate new tokens
                var newAccessToken = _jwtService.GenerateToken(user);
                var newRefreshToken = _jwtService.GenerateRefreshToken();
                var tokenExpiration = _jwtService.GetTokenExpirationTime();

                // Revoke old refresh token
                storedToken.IsRevoked = true;

                // Store new refresh token
                var refreshTokenEntity = new RefreshToken
                {
                    Token = newRefreshToken,
                    ExpiryDate = DateTime.UtcNow.AddDays(7),
                    UserId = user.Id,
                    IsRevoked = false
                };

                _context.RefreshTokens.Add(refreshTokenEntity);
                await _context.SaveChangesAsync();
                Response.Cookies.Append("token", newAccessToken, new CookieOptions
                {
                    HttpOnly = false,
                    Expires = tokenExpiration,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                });
                // Return new tokens
                return Ok(new AuthResponse
                {
                    Id = user.Id.ToString(),
                    Username = user.Username,
                    Email = user.Email,
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken,
                    TokenExpiration = tokenExpiration
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error processing token refresh", error = ex.Message });
            }
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] // Explicitly specify scheme
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Logout(RefreshTokenRequest request)
        {
            try
            {
                // Get current user id from token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Find and revoke the refresh token
                var refreshToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken &&
                                              rt.UserId == Guid.Parse(userId) &&
                                              !rt.IsRevoked);

                if (refreshToken != null)
                {
                    refreshToken.IsRevoked = true;
                    await _context.SaveChangesAsync();
                }

                // Clear auth cookies if present
                Response.Cookies.Delete("token");
                Response.Cookies.Delete("userId");
                Response.Cookies.Delete("username");

                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                // Log the error but still return success to allow frontend to clean up
            
                return Ok(new { message = "Logged out successfully" });
            }
        }
        // POST: api/auth/change-password
        [HttpPost("change-password")]
        [Authorize]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user id from token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            // Find user
            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }

            // Check if new password is strong enough
            if (!_passwordService.IsStrongPassword(request.NewPassword))
            {
                return BadRequest(new { message = "New password is not strong enough. It should contain at least 8 characters, including uppercase, lowercase, numbers, and special characters." });
            }

            // Update password
            user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            // Revoke all refresh tokens for security
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }



        // GET: api/auth/validate
        [HttpGet("validate")]
        [Authorize]
        [EnableRateLimiting("auth")]
        public IActionResult ValidateToken()
        {
            return Ok(new { isValid = true });
        }
    }
}