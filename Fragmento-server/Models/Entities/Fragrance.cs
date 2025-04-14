using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class Fragrance
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string Brand { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Occasion { get; set; }

        [StringLength(500)]
        public string PhotoUrl { get; set; }

        // Day/Night preference (0-100)
        [Range(0, 100)]
        public int DayNightPreference { get; set; } = 50;

        // Navigation properties for related entities
        public virtual ICollection<FragranceTag> Tags { get; set; }
        public virtual ICollection<FragranceNote> Notes { get; set; }
        public virtual ICollection<FragranceAccord> Accords { get; set; }

        // Rating properties
        public virtual FragranceRatings Ratings { get; set; }
        public virtual FragranceSeasons Seasons { get; set; }

        // Foreign key to the post this fragrance belongs to
        public Guid PostId { get; set; }

        [ForeignKey("PostId")]
        public virtual Post Post { get; set; }

        public Fragrance()
        {
            Tags = new HashSet<FragranceTag>();
            Notes = new HashSet<FragranceNote>();
            Accords = new HashSet<FragranceAccord>();
        }
    }
}
