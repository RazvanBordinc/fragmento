using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;

namespace Fragmento_server.Models.Entities
{
    public class Post
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        public Fragrance Fragrance { get; set; }

        // Navigation properties
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<PostLike> Likes { get; set; }

        public Post()
        {
            Comments = new HashSet<Comment>();
            Likes = new HashSet<PostLike>();
        }
    }
} 