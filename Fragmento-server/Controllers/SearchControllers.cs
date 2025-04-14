using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly ILogger<SearchController> _logger;

        public SearchController(FragmentoDbContext context, ILogger<SearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/search/users?query=abc
        [HttpGet("users")]
        [EnableRateLimiting("search")]
        public async Task<ActionResult<SearchUsersResponse>> SearchUsers([FromQuery] SearchUsersRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid search request: {ValidationErrors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(request.Query))
            {
                _logger.LogWarning("Empty search query received");
                return BadRequest("Search query cannot be empty");
            }

            var currentUserId = Guid.Empty;
            if (User.Identity.IsAuthenticated)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out Guid userId))
                {
                    currentUserId = userId;
                }
            }

            _logger.LogInformation("User {UserId} searching for '{Query}' with limit {Limit}",
                currentUserId, request.Query, request.Limit);

            try
            {
                // Sanitize and prepare the search query
                var searchQuery = request.Query.Trim().ToLower();

                // Get total count for pagination info
                var totalCount = await _context.Users
                    .Where(u => u.Username.ToLower().Contains(searchQuery))
                    .CountAsync();

                // Get search results with limit
                var users = await _context.Users
                    .Where(u => u.Username.ToLower().Contains(searchQuery))
                    .OrderBy(u => u.Username.ToLower().IndexOf(searchQuery)) // Show exact matches first
                    .ThenBy(u => u.Username)
                    .Take(request.Limit)
                    .Select(u => new
                    {
                        User = u,
                        IsFollowing = currentUserId != Guid.Empty && _context.Follows.Any(f =>
                            f.FollowerId == currentUserId && f.FollowingId == u.Id)
                    })
                    .ToListAsync();

                var response = new SearchUsersResponse
                {
                    Query = request.Query,
                    Total = totalCount,
                    Users = users.Select(result => new UserSearchResult
                    {
                        Id = result.User.Id.ToString(),
                        Username = result.User.Username,
                        ProfilePictureUrl = result.User.ProfilePictureUrl,
                        Bio = result.User.Bio,
                        IsFollowing = result.IsFollowing
                    }).ToList()
                };

                _logger.LogInformation("Search for '{Query}' returned {ResultCount} results out of {TotalCount} total",
                    request.Query, response.Users.Count, totalCount);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching for users with query: {Query}", request.Query);
                return StatusCode(500, "An error occurred while processing your search");
            }
        }

        // GET: api/search/suggest?query=abc
        [HttpGet("suggest")]
        [EnableRateLimiting("search")]
        public async Task<ActionResult<List<UserSearchResult>>> GetUserSuggestions([FromQuery] string query, [FromQuery] int limit = 5)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Ok(new List<UserSearchResult>());
            }

            var currentUserId = Guid.Empty;
            if (User.Identity.IsAuthenticated)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out Guid userId))
                {
                    currentUserId = userId;
                }
            }

            _logger.LogInformation("User {UserId} requesting typeahead suggestions for '{Query}'",
                currentUserId, query);

            try
            {
                // Limit for typeahead suggestions
                limit = Math.Min(limit, 10);

                // Sanitize the query
                var searchQuery = query.Trim().ToLower();

                // Get quick suggestions (just usernames and IDs for typeahead)
                var suggestions = await _context.Users
                    .Where(u => u.Username.ToLower().Contains(searchQuery))
                    .OrderBy(u => u.Username.ToLower().IndexOf(searchQuery)) // Exact matches first
                    .ThenBy(u => u.Username)
                    .Take(limit)
                    .Select(u => new UserSearchResult
                    {
                        Id = u.Id.ToString(),
                        Username = u.Username,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        IsFollowing = currentUserId != Guid.Empty && _context.Follows.Any(f =>
                            f.FollowerId == currentUserId && f.FollowingId == u.Id)
                    })
                    .ToListAsync();

                _logger.LogInformation("Typeahead for '{Query}' returned {Count} suggestions",
                    query, suggestions.Count);

                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting typeahead suggestions for query: {Query}", query);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
    }
}