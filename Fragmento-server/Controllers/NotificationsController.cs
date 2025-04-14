using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Fragmento_server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fragmento_server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            FragmentoDbContext context,
            ILogger<NotificationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/notifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationResponse>>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool unreadOnly = false)
        {
            // Validate parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100; // Limit max page size

            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Build query with filtering
                var query = _context.Notifications
                    .Include(n => n.Actor)
                    .Include(n => n.Post)
                    .Include(n => n.Comment)
                    .Where(n => n.UserId == currentUserId);

                // Apply unread filter if requested
                if (unreadOnly)
                {
                    query = query.Where(n => !n.IsRead);
                }

                // Get total count for pagination info
                var totalCount = await query.CountAsync();

                // Apply pagination and get results
                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Update the mapping logic in the GetNotifications method to correctly map NotificationContent to NotificationContentResponse
                var notificationResponses = notifications.Select(n => new NotificationResponse
                {
                    Id = n.Id.ToString(),
                    Type = n.Type,
                    Actor = new UserBriefResponse
                    {
                        Id = n.Actor.Id.ToString(),
                        Username = n.Actor.Username,
                        ProfilePictureUrl = n.Actor.ProfilePictureUrl
                    },
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    Content = new NotificationContentResponse
                    {
                        Action = n.Content.Action,
                        PostTitle = n.Content.PostTitle,
                        CommentText = n.Content.CommentText
                    },
                    PostId = n.PostId?.ToString(),
                    CommentId = n.CommentId?.ToString()
                }).ToList();

                // Add pagination headers
                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());
                Response.Headers.Add("X-Total-Pages", ((int)Math.Ceiling(totalCount / (double)pageSize)).ToString());

                return Ok(notificationResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications for user {UserId}", currentUserId);
                return StatusCode(500, "An error occurred while retrieving notifications");
            }
        }

        // GET: api/notifications/count
        [HttpGet("count")]
        public async Task<ActionResult<NotificationCountResponse>> GetNotificationCount()
        {
            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Get total count
                var totalCount = await _context.Notifications
                    .Where(n => n.UserId == currentUserId)
                    .CountAsync();

                // Get unread count
                var unreadCount = await _context.Notifications
                    .Where(n => n.UserId == currentUserId && !n.IsRead)
                    .CountAsync();

                return Ok(new NotificationCountResponse
                {
                    TotalCount = totalCount,
                    UnreadCount = unreadCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification count for user {UserId}", currentUserId);
                return StatusCode(500, "An error occurred while retrieving notification count");
            }
        }

        // PATCH: api/notifications/mark-read
        [HttpPatch("mark-read")]
        public async Task<IActionResult> MarkNotificationsAsRead(MarkNotificationsReadRequest request)
        {
            if (request == null || request.NotificationIds == null || !request.NotificationIds.Any())
            {
                return BadRequest("No notification IDs provided");
            }

            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Convert string IDs to Guids, handle invalid IDs
                var notificationGuids = new List<Guid>();
                foreach (var idString in request.NotificationIds)
                {
                    if (Guid.TryParse(idString, out Guid notificationId))
                    {
                        notificationGuids.Add(notificationId);
                    }
                }

                if (!notificationGuids.Any())
                {
                    return BadRequest("No valid notification IDs provided");
                }

                // Get notifications that belong to the current user
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == currentUserId && notificationGuids.Contains(n.Id))
                    .ToListAsync();

                if (!notifications.Any())
                {
                    return NotFound("No matching notifications found");
                }

                // Mark notifications as read
                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                // Save changes
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} marked {Count} notifications as read",
                    currentUserId, notifications.Count);

                return Ok(new
                {
                    message = $"{notifications.Count} notifications marked as read",
                    markedIds = notifications.Select(n => n.Id.ToString()).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notifications as read for user {UserId}", currentUserId);
                return StatusCode(500, "An error occurred while marking notifications as read");
            }
        }

        // PATCH: api/notifications/mark-all-read
        [HttpPatch("mark-all-read")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Get all unread notifications for the user
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == currentUserId && !n.IsRead)
                    .ToListAsync();

                if (!notifications.Any())
                {
                    return Ok(new { message = "No unread notifications found" });
                }

                // Mark all as read
                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                // Save changes
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} marked all {Count} notifications as read",
                    currentUserId, notifications.Count);

                return Ok(new { message = $"All {notifications.Count} notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", currentUserId);
                return StatusCode(500, "An error occurred while marking all notifications as read");
            }
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            if (!Guid.TryParse(id, out Guid notificationId))
            {
                return BadRequest("Invalid notification ID format");
            }

            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Find notification
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId);

                if (notification == null)
                {
                    return NotFound("Notification not found");
                }

                // Security check - ensure user only deletes their own notifications
                if (notification.UserId != currentUserId)
                {
                    _logger.LogWarning("User {UserId} attempted to delete notification {NotificationId} belonging to another user",
                        currentUserId, notificationId);
                    return Forbid("You can only delete your own notifications");
                }

                // Delete notification
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} deleted notification {NotificationId}",
                    currentUserId, notificationId);

                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId} for user {UserId}",
                    notificationId, currentUserId);
                return StatusCode(500, "An error occurred while deleting the notification");
            }
        }

        // DELETE: api/notifications
        [HttpDelete]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            // Get current user from token claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            try
            {
                // Get all notifications for the user
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == currentUserId)
                    .ToListAsync();

                if (!notifications.Any())
                {
                    return Ok(new { message = "No notifications found to delete" });
                }

                // Delete all notifications
                _context.Notifications.RemoveRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} deleted all {Count} notifications",
                    currentUserId, notifications.Count);

                return Ok(new { message = $"All {notifications.Count} notifications deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all notifications for user {UserId}", currentUserId);
                return StatusCode(500, "An error occurred while deleting notifications");
            }
        }

        // Helper method to get current user ID from claims
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return userId;
            }

            _logger.LogWarning("Failed to extract valid user ID from token claims");
            return Guid.Empty;
        }
    }
}