// Fragmento-server/Extensions/RateLimitingExtensions.cs
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Threading.RateLimiting;

namespace Fragmento_server.Extensions
{
    public static class RateLimitingExtensions
    {
        public static IServiceCollection AddFragmentoRateLimiting(this IServiceCollection services)
        {
            // Configure rate limiting options
            services.AddRateLimiter(options =>
            {
                // Default general policy (fallback for endpoints without specific policies)
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 600,
                            Window = TimeSpan.FromMinutes(1)
                        }));

                // Define policy for authentication endpoints (registration, login, etc.)
                options.AddPolicy("auth", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetIpAddress(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(15)
                        }));

                // Define policy for post creation and updates
                options.AddPolicy("post_create", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 100,
                            Window = TimeSpan.FromHours(1)
                        }));

                // Define policy for comments
                options.AddPolicy("comments", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 300,
                            Window = TimeSpan.FromMinutes(10)
                        }));

                // Define policy for like/unlike operations
                options.AddPolicy("likes", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 600,
                            Window = TimeSpan.FromMinutes(10)
                        }));

                // Define policy for search operations
                options.AddPolicy("search", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 300,
                            Window = TimeSpan.FromMinutes(5)
                        }));

                // Define policy for follow/unfollow operations
                options.AddPolicy("follows", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 300,
                            Window = TimeSpan.FromMinutes(10)
                        }));

                // Define policy for notifications
                options.AddPolicy("notifications", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetUserIdentifier(httpContext),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 600,
                            Window = TimeSpan.FromMinutes(5)
                        }));

                // Configure response when rate limit is reached
                options.OnRejected = async (context, token) =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    logger.LogWarning("Rate limit exceeded for {RequestPath} by {UserIdentifier}",
                        context.HttpContext.Request.Path,
                        GetUserIdentifier(context.HttpContext));

                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/json";

                    // Add a standard Retry-After header (in seconds)
                    context.HttpContext.Response.Headers.Add("Retry-After", "60");

                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = "Rate limit exceeded. Please try again later."
                    }, token);
                };
            });

            return services;
        }

        // Helper method to get user identifier (user ID if authenticated, IP address if not)
        private static string GetUserIdentifier(HttpContext httpContext)
        {
            // If user is authenticated, use their ID
            if (httpContext.User?.Identity?.IsAuthenticated == true)
            {
                var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    return $"user_{userId}";
                }
            }

            // Otherwise use IP address
            return $"ip_{GetIpAddress(httpContext)}";
        }

        // Helper method to get client IP address, handling proxies
        private static string GetIpAddress(HttpContext httpContext)
        {
            string ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            // Also check X-Forwarded-For header in case the app is behind a proxy/load balancer
            string forwarded = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? string.Empty;

            return !string.IsNullOrEmpty(forwarded) ? forwarded.Split(',')[0].Trim() : ipAddress;
        }
    }
}