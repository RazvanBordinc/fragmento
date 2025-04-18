using Fragmento_server.Models.Entities.Fragmento_server.Models.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores")]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(255)]  // Increased to accommodate modern password hash formats
        public string PasswordHash { get; set; }

        [StringLength(1000)]
        public string Bio { get; set; } = string.Empty;

        // Profile picture and cover photo URLs
        [StringLength(500)]
        public string ProfilePictureUrl { get; set; } = string.Empty;

        [StringLength(500)]
        public string CoverPictureUrl { get; set; } = string.Empty;

        // Registration date
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;

        // Signature fragrance
        public FragranceSignature SignatureFragrance { get; set; }

        // Navigation properties for relationships
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Follow> Followers { get; set; }
        public virtual ICollection<Follow> Following { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }

        // Constructor to initialize collections
        public User()
        {
            Posts = new HashSet<Post>();
            Comments = new HashSet<Comment>();
            Followers = new HashSet<Follow>();
            Following = new HashSet<Follow>();
            Notifications = new HashSet<Notification>();
            RefreshTokens = new HashSet<RefreshToken>();
        }
    }
}