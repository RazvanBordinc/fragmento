using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Responses;
using Fragmento_server.Models.Entities;
using Fragmento_server.Models.Entities.Fragmento_server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FollowsController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly ILogger<FollowsController> _logger;

        public FollowsController(FragmentoDbContext context, ILogger<FollowsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/follows/{username}
        [HttpPost("{username}")]
        public async Task<IActionResult> FollowUser(string username)
        {
            try
            {
                // Get current user from token
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Follow attempt for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Prevent self-following
                if (targetUser.Id == currentUserId)
                {
                    _logger.LogWarning($"User {currentUserId} attempted to follow themselves");
                    return BadRequest(new { message = "You cannot follow yourself" });
                }

                // Check if already following
                var existingFollow = await _context.Follows
                    .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == targetUser.Id);

                if (existingFollow != null)
                {
                    _logger.LogInformation($"User {currentUserId} already follows {targetUser.Id}");
                    return Conflict(new { message = "You are already following this user" });
                }

                // Create follow relationship
                var follow = new Follow
                {
                    FollowerId = currentUserId,
                    FollowingId = targetUser.Id,
                    FollowedAt = DateTime.UtcNow
                };

                _context.Follows.Add(follow);

                // Create notification for the target user
                var notification = new Notification
                {
                    UserId = targetUser.Id,
                    ActorId = currentUserId,
                    Type = "follow",
                    Content = new NotificationContent
                    {
                        Action = "followed you"
                    }
                };

                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                _logger.LogInformation($"User {currentUserId} followed user {targetUser.Id}");

                return Ok(new
                {
                    followed = true,
                    message = $"You are now following {username}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error following user: {username}");
                return StatusCode(500, new { message = "An error occurred while following the user" });
            }
        }

        // DELETE: api/follows/{username}
        [HttpDelete("{username}")]
        public async Task<IActionResult> UnfollowUser(string username)
        {
            try
            {
                // Get current user from token
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Unfollow attempt for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Find existing follow relationship
                var follow = await _context.Follows
                    .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == targetUser.Id);

                if (follow == null)
                {
                    _logger.LogWarning($"User {currentUserId} attempted to unfollow {targetUser.Id} but wasn't following");
                    return NotFound(new { message = "You are not following this user" });
                }

                // Remove follow relationship
                _context.Follows.Remove(follow);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User {currentUserId} unfollowed user {targetUser.Id}");

                return Ok(new
                {
                    followed = false,
                    message = $"You have unfollowed {username}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unfollowing user: {username}");
                return StatusCode(500, new { message = "An error occurred while unfollowing the user" });
            }
        }

        // GET: api/follows/check/{username}
        [HttpGet("check/{username}")]
        public async Task<ActionResult<FollowCheckResponse>> CheckFollow(string username)
        {
            try
            {
                // Get current user from token
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Follow check for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Check if following
                var isFollowing = await _context.Follows
                    .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == targetUser.Id);

                // Check if followed by
                var isFollowedBy = await _context.Follows
                    .AnyAsync(f => f.FollowerId == targetUser.Id && f.FollowingId == currentUserId);

                return Ok(new FollowCheckResponse
                {
                    IsFollowing = isFollowing,
                    IsFollowedBy = isFollowedBy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking follow status for user: {username}");
                return StatusCode(500, new { message = "An error occurred while checking follow status" });
            }
        }

        // GET: api/follows/followers/count/{username}
        [HttpGet("followers/count/{username}")]
        [AllowAnonymous] // This endpoint can be accessed without auth
        public async Task<ActionResult<int>> GetFollowersCount(string username)
        {
            try
            {
                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Followers count request for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Get followers count
                var followersCount = await _context.Follows
                    .CountAsync(f => f.FollowingId == targetUser.Id);

                return Ok(followersCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting followers count for user: {username}");
                return StatusCode(500, new { message = "An error occurred while getting followers count" });
            }
        }

        // GET: api/follows/following/count/{username}
        [HttpGet("following/count/{username}")]
        [AllowAnonymous] // This endpoint can be accessed without auth
        public async Task<ActionResult<int>> GetFollowingCount(string username)
        {
            try
            {
                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Following count request for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Get following count
                var followingCount = await _context.Follows
                    .CountAsync(f => f.FollowerId == targetUser.Id);

                return Ok(followingCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting following count for user: {username}");
                return StatusCode(500, new { message = "An error occurred while getting following count" });
            }
        }

        // GET: api/follows/followers/{username}
        [HttpGet("followers/{username}")]
        [AllowAnonymous] // Allow public access to followers
        public async Task<ActionResult<object>> GetFollowers(string username, [FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            try
            {
                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Followers request for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Validate pagination parameters
                page = Math.Max(1, page);
                limit = Math.Clamp(limit, 1, 100);

                // Get total count for pagination
                var totalCount = await _context.Follows
                    .CountAsync(f => f.FollowingId == targetUser.Id);

                // Get followers with pagination
                var followers = await _context.Follows
                    .Include(f => f.Follower)
                    .Where(f => f.FollowingId == targetUser.Id)
                    .OrderByDescending(f => f.FollowedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(f => new FollowResponse
                    {
                        Id = f.Follower.Id.ToString(),
                        Username = f.Follower.Username,
                        ProfilePictureUrl = f.Follower.ProfilePictureUrl,
                        FollowedAt = f.FollowedAt
                    })
                    .ToListAsync();

                // Return paginated result
                return Ok(new
                {
                    followers,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalItems = totalCount,
                        itemsPerPage = limit
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting followers for user: {username}");
                return StatusCode(500, new { message = "An error occurred while getting followers" });
            }
        }

        // GET: api/follows/following/{username}
        [HttpGet("following/{username}")]
        [AllowAnonymous] // Allow public access to following list
        public async Task<ActionResult<object>> GetFollowing(string username, [FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            try
            {
                // Find target user
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (targetUser == null)
                {
                    _logger.LogWarning($"Following request for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Validate pagination parameters
                page = Math.Max(1, page);
                limit = Math.Clamp(limit, 1, 100);

                // Get total count for pagination
                var totalCount = await _context.Follows
                    .CountAsync(f => f.FollowerId == targetUser.Id);

                // Get following with pagination
                var following = await _context.Follows
                    .Include(f => f.Following)
                    .Where(f => f.FollowerId == targetUser.Id)
                    .OrderByDescending(f => f.FollowedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(f => new FollowResponse
                    {
                        Id = f.Following.Id.ToString(),
                        Username = f.Following.Username,
                        ProfilePictureUrl = f.Following.ProfilePictureUrl,
                        FollowedAt = f.FollowedAt
                    })
                    .ToListAsync();

                // Return paginated result
                return Ok(new
                {
                    following,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalItems = totalCount,
                        itemsPerPage = limit
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting following for user: {username}");
                return StatusCode(500, new { message = "An error occurred while getting following" });
            }
        }

        // DELETE: api/follows/remove-follower/{username}
        [HttpDelete("remove-follower/{username}")]
        public async Task<IActionResult> RemoveFollower(string username)
        {
            try
            {
                // Get current user from token
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Find follower user
                var followerUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (followerUser == null)
                {
                    _logger.LogWarning($"Remove follower attempt for non-existent user: {username}");
                    return NotFound(new { message = "User not found" });
                }

                // Find follow relationship where the specified user is following the current user
                var follow = await _context.Follows
                    .FirstOrDefaultAsync(f => f.FollowerId == followerUser.Id && f.FollowingId == currentUserId);

                if (follow == null)
                {
                    _logger.LogWarning($"User {currentUserId} attempted to remove {followerUser.Id} but they weren't following");
                    return NotFound(new { message = "This user is not following you" });
                }

                // Remove follow relationship
                _context.Follows.Remove(follow);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User {currentUserId} removed follower {followerUser.Id}");

                return Ok(new
                {
                    removed = true,
                    message = $"You have removed {username} from your followers"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing follower: {username}");
                return StatusCode(500, new { message = "An error occurred while removing follower" });
            }
        }
    }
}

 