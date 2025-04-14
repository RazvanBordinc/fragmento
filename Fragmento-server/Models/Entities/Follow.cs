using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class Follow
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FollowerId { get; set; }

        [ForeignKey("FollowerId")]
        public virtual User Follower { get; set; }

        [Required]
        public Guid FollowingId { get; set; }

        [ForeignKey("FollowingId")]
        public virtual User Following { get; set; }

        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
    }
}
