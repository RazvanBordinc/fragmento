using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Fragmento_server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly FragmentoDbContext _context;

        public UsersController(FragmentoDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        [Authorize]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<UserBriefResponse>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserBriefResponse
                {
                    Id = u.Id.ToString(),
                    Username = u.Username,
                    ProfilePictureUrl = u.ProfilePictureUrl
                })
                .Take(50) // Limit to 10 users for performance
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/{username}
        [HttpGet("{username}")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<UserProfileResponse>> GetUserByUsername(string username)
        {
            var user = await _context.Users
                .Include(u => u.SignatureFragrance)
                    .ThenInclude(sf => sf.Notes)
                .Include(u => u.Posts)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Get follow counts
            var followersCount = await _context.Follows
                .CountAsync(f => f.FollowingId == user.Id);

            var followingCount = await _context.Follows
                .CountAsync(f => f.FollowerId == user.Id);

            // Check if current user is following this profile
            bool isFollowing = false;

            if (User.Identity.IsAuthenticated)
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                isFollowing = await _context.Follows
                    .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == user.Id);
            }

            // Get signature fragrance
            SignatureFragranceResponse signatureFragrance = null;
            if (user.SignatureFragrance != null)
            {
                signatureFragrance = new SignatureFragranceResponse
                {
                    Name = user.SignatureFragrance.Name,
                    Brand = user.SignatureFragrance.Brand,
                    Category = user.SignatureFragrance.Category,
                    Description = user.SignatureFragrance.Description,
                    PhotoUrl = user.SignatureFragrance.PhotoUrl,
                    Notes = user.SignatureFragrance.Notes.Select(n => new NoteResponse
                    {
                        Name = n.Name,
                        Category = n.Category
                    }).ToList()
                };
            }

            // Build response
            var response = new UserProfileResponse
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = null, // Don't expose email to other users
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl,
                CoverPictureUrl = user.CoverPictureUrl,
                CreatedAt = user.CreatedAt,
                LastActive = user.LastActive,
                IsFollowing = isFollowing,
                Stats = new UserStatsResponse
                {
                    PostsCount = user.Posts.Count,
                    FollowersCount = followersCount,
                    FollowingCount = followingCount
                },
                SignatureFragrance = signatureFragrance,
                // We'll load posts in a separate endpoint to keep the profile response light
                IsCurrentUser = false // Will be set correctly below
            };

            // Check if this is the current user's profile
            if (User.Identity.IsAuthenticated)
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                if (currentUserId == user.Id)
                {
                    response.IsCurrentUser = true;
                    response.Email = user.Email; // Only expose email to the user themselves
                }
            }

            return Ok(response);
        }

        // GET: api/users/me
        [HttpGet("me")]
        [Authorize]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<UserProfileResponse>> GetCurrentUser()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var user = await _context.Users
                .Include(u => u.SignatureFragrance)
                    .ThenInclude(sf => sf.Notes)
                .Include(u => u.Posts)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Get follow counts
            var followersCount = await _context.Follows
                .CountAsync(f => f.FollowingId == user.Id);

            var followingCount = await _context.Follows
                .CountAsync(f => f.FollowerId == user.Id);

            // Get signature fragrance
            SignatureFragranceResponse signatureFragrance = null;
            if (user.SignatureFragrance != null)
            {
                signatureFragrance = new SignatureFragranceResponse
                {
                    Name = user.SignatureFragrance.Name,
                    Brand = user.SignatureFragrance.Brand,
                    Category = user.SignatureFragrance.Category,
                    Description = user.SignatureFragrance.Description,
                    PhotoUrl = user.SignatureFragrance.PhotoUrl,
                    Notes = user.SignatureFragrance.Notes.Select(n => new NoteResponse
                    {
                        Name = n.Name,
                        Category = n.Category
                    }).ToList()
                };
            }

            // Build response with more details since it's the current user
            var response = new UserProfileResponse
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email, // Include email for current user
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl,
                CoverPictureUrl = user.CoverPictureUrl,
                CreatedAt = user.CreatedAt,
                LastActive = user.LastActive,
                IsFollowing = false, // N/A for own profile
                Stats = new UserStatsResponse
                {
                    PostsCount = user.Posts.Count,
                    FollowersCount = followersCount,
                    FollowingCount = followingCount
                },
                SignatureFragrance = signatureFragrance,
                IsCurrentUser = true
            };

            return Ok(response);
        }

        // PUT: api/users/me
        [HttpPut("me")]
        [Authorize]
        [EnableRateLimiting("default")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var user = await _context.Users
                .Include(u => u.SignatureFragrance)
                    .ThenInclude(sf => sf.Notes)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update basic profile info
            if (!string.IsNullOrWhiteSpace(request.Bio))
            {
                user.Bio = request.Bio;
            }

            if (!string.IsNullOrWhiteSpace(request.ProfilePictureUrl))
            {
                user.ProfilePictureUrl = request.ProfilePictureUrl;
            }

            if (!string.IsNullOrWhiteSpace(request.CoverPictureUrl))
            {
                user.CoverPictureUrl = request.CoverPictureUrl;
            }

            // Update or create signature fragrance
            if (request.SignatureFragrance != null)
            {
                if (user.SignatureFragrance == null)
                {
                    // Create new signature fragrance
                    user.SignatureFragrance = new FragranceSignature
                    {
                        UserId = user.Id,
                        Name = request.SignatureFragrance.Name,
                        Brand = request.SignatureFragrance.Brand,
                        Category = request.SignatureFragrance.Category,
                        Description = request.SignatureFragrance.Description,
                        PhotoUrl = request.SignatureFragrance.PhotoUrl
                    };
                }
                else
                {
                    // Update existing signature fragrance
                    user.SignatureFragrance.Name = request.SignatureFragrance.Name;
                    user.SignatureFragrance.Brand = request.SignatureFragrance.Brand;
                    user.SignatureFragrance.Category = request.SignatureFragrance.Category;
                    user.SignatureFragrance.Description = request.SignatureFragrance.Description;
                    user.SignatureFragrance.PhotoUrl = request.SignatureFragrance.PhotoUrl;

                    // Remove existing notes
                    _context.FragranceSignatureNotes.RemoveRange(user.SignatureFragrance.Notes);
                }

                // Add new notes
                if (request.SignatureFragrance.Notes != null && request.SignatureFragrance.Notes.Any())
                {
                    int order = 0;
                    foreach (var note in request.SignatureFragrance.Notes)
                    {
                        user.SignatureFragrance.Notes.Add(new FragranceSignatureNote
                        {
                            Name = note.Name,
                            Category = note.Category,
                            Order = order++
                        });
                    }
                }
            }
            else if (request.RemoveSignatureFragrance && user.SignatureFragrance != null)
            {
                // Remove signature fragrance if requested
                _context.FragranceSignatureNotes.RemoveRange(user.SignatureFragrance.Notes);
                _context.FragranceSignatures.Remove(user.SignatureFragrance);
                user.SignatureFragrance = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        // GET: api/users/{username}/posts
        [HttpGet("{username}/posts")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<PostResponse>>> GetUserPosts(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Fragrance)
                    .ThenInclude(f => f.Tags)
                .Include(p => p.Fragrance)
                    .ThenInclude(f => f.Notes)
                .Include(p => p.Fragrance)
                    .ThenInclude(f => f.Accords)
                .Include(p => p.Fragrance)
                    .ThenInclude(f => f.Ratings)
                .Include(p => p.Fragrance)
                    .ThenInclude(f => f.Seasons)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                    .ThenInclude(c => c.User)
                .Where(p => p.UserId == user.Id)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // Similar to the logic in PostsController for converting to DTOs
            var postResponses = posts.Select(p => new PostResponse
            {
                Id = p.Id.ToString(),
                User = new UserBriefResponse
                {
                    Id = p.User.Id.ToString(),
                    Username = p.User.Username,
                    ProfilePictureUrl = p.User.ProfilePictureUrl
                },
                CreatedAt = p.CreatedAt,
                Fragrance = new FragranceResponse
                {
                    Id = p.Fragrance.Id.ToString(),
                    Name = p.Fragrance.Name,
                    Brand = p.Fragrance.Brand,
                    Category = p.Fragrance.Category,
                    Description = p.Fragrance.Description,
                    Occasion = p.Fragrance.Occasion,
                    PhotoUrl = p.Fragrance.PhotoUrl,
                    DayNightPreference = p.Fragrance.DayNightPreference,
                    Tags = p.Fragrance.Tags.Select(t => t.Name).ToList(),
                    Notes = p.Fragrance.Notes.Select(n => new NoteResponse
                    {
                        Name = n.Name,
                        Category = n.Category
                    }).ToList(),
                    Accords = p.Fragrance.Accords.Select(a => a.Name).ToList(),
                    Ratings = new RatingsResponse
                    {
                        Overall = p.Fragrance.Ratings.Overall,
                        Longevity = p.Fragrance.Ratings.Longevity,
                        Sillage = p.Fragrance.Ratings.Sillage,
                        Scent = p.Fragrance.Ratings.Scent,
                        Value = p.Fragrance.Ratings.Value
                    },
                    Seasons = new SeasonsResponse
                    {
                        Spring = p.Fragrance.Seasons.Spring,
                        Summer = p.Fragrance.Seasons.Summer,
                        Fall = p.Fragrance.Seasons.Fall,
                        Winter = p.Fragrance.Seasons.Winter
                    }
                },
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,
                Comments = p.Comments
                    .Where(c => c.ParentCommentId == null) // Only top-level comments
                    .Take(3) // Limit to 3 comments
                    .Select(c => new CommentResponse
                    {
                        Id = c.Id.ToString(),
                        User = new UserBriefResponse
                        {
                            Id = c.User.Id.ToString(),
                            Username = c.User.Username,
                            ProfilePictureUrl = c.User.ProfilePictureUrl
                        },
                        Text = c.Text,
                        CreatedAt = c.CreatedAt,
                        LikesCount = c.Likes.Count,
                        RepliesCount = c.Replies.Count
                    }).ToList()
            }).ToList();

            return Ok(postResponses);
        }

        // GET: api/users/{username}/saved
        [HttpGet("{username}/saved")]
        [Authorize]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<PostResponse>>> GetUserSavedPosts(string username)
        {
            // Check if user is requesting their own saved posts
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Only allow users to see their own saved posts
            if (user.Id != currentUserId)
            {
                return Forbid("You can only view your own saved posts");
            }

            var savedPosts = await _context.SavedPosts
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.User)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Likes)
                .Include(sp => sp.Post)
                    .ThenInclude(p => p.Comments)
                        .ThenInclude(c => c.User)
                .Where(sp => sp.UserId == user.Id)
                .OrderByDescending(sp => sp.SavedAt)
                .Select(sp => sp.Post)
                .ToListAsync();

            // Convert to DTOs (similar to GetUserPosts)
            var postResponses = savedPosts.Select(p => new PostResponse
            {
                Id = p.Id.ToString(),
                User = new UserBriefResponse
                {
                    Id = p.User.Id.ToString(),
                    Username = p.User.Username,
                    ProfilePictureUrl = p.User.ProfilePictureUrl
                },
                CreatedAt = p.CreatedAt,
                Fragrance = new FragranceResponse
                {
                    Id = p.Fragrance.Id.ToString(),
                    Name = p.Fragrance.Name,
                    Brand = p.Fragrance.Brand,
                    Category = p.Fragrance.Category,
                    Description = p.Fragrance.Description,
                    Occasion = p.Fragrance.Occasion,
                    PhotoUrl = p.Fragrance.PhotoUrl,
                    DayNightPreference = p.Fragrance.DayNightPreference,
                    Tags = p.Fragrance.Tags.Select(t => t.Name).ToList(),
                    Notes = p.Fragrance.Notes.Select(n => new NoteResponse
                    {
                        Name = n.Name,
                        Category = n.Category
                    }).ToList(),
                    Accords = p.Fragrance.Accords.Select(a => a.Name).ToList(),
                    Ratings = new RatingsResponse
                    {
                        Overall = p.Fragrance.Ratings.Overall,
                        Longevity = p.Fragrance.Ratings.Longevity,
                        Sillage = p.Fragrance.Ratings.Sillage,
                        Scent = p.Fragrance.Ratings.Scent,
                        Value = p.Fragrance.Ratings.Value
                    },
                    Seasons = new SeasonsResponse
                    {
                        Spring = p.Fragrance.Seasons.Spring,
                        Summer = p.Fragrance.Seasons.Summer,
                        Fall = p.Fragrance.Seasons.Fall,
                        Winter = p.Fragrance.Seasons.Winter
                    }
                },
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,
                Comments = p.Comments
                    .Where(c => c.ParentCommentId == null) // Only top-level comments
                    .Take(3) // Limit to 3 comments
                    .Select(c => new CommentResponse
                    {
                        Id = c.Id.ToString(),
                        User = new UserBriefResponse
                        {
                            Id = c.User.Id.ToString(),
                            Username = c.User.Username,
                            ProfilePictureUrl = c.User.ProfilePictureUrl
                        },
                        Text = c.Text,
                        CreatedAt = c.CreatedAt,
                        LikesCount = c.Likes.Count,
                        RepliesCount = c.Replies.Count
                    }).ToList()
            }).ToList();

            return Ok(postResponses);
        }

        // GET: api/users/{username}/followers
        [HttpGet("{username}/followers")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<FollowResponse>>> GetFollowers(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var followers = await _context.Follows
                .Include(f => f.Follower)
                .Where(f => f.FollowingId == user.Id)
                .OrderByDescending(f => f.FollowedAt)
                .Select(f => new FollowResponse
                {
                    Id = f.Follower.Id.ToString(),
                    Username = f.Follower.Username,
                    ProfilePictureUrl = f.Follower.ProfilePictureUrl,
                    FollowedAt = f.FollowedAt
                })
                .ToListAsync();

            return Ok(followers);
        }

        // GET: api/users/{username}/following
        [HttpGet("{username}/following")]
        public async Task<ActionResult<IEnumerable<FollowResponse>>> GetFollowing(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var following = await _context.Follows
                .Include(f => f.Following)
                .Where(f => f.FollowerId == user.Id)
                .OrderByDescending(f => f.FollowedAt)
                .Select(f => new FollowResponse
                {
                    Id = f.Following.Id.ToString(),
                    Username = f.Following.Username,
                    ProfilePictureUrl = f.Following.ProfilePictureUrl,
                    FollowedAt = f.FollowedAt
                })
                .ToListAsync();

            return Ok(following);
        }
    }
}

 