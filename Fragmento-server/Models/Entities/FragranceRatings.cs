using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class FragranceRatings
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FragranceId { get; set; }

        [ForeignKey("FragranceId")]
        public virtual Fragrance Fragrance { get; set; }

        [Range(0, 10)]
        public decimal Overall { get; set; } = 5;

        [Range(0, 10)]
        public decimal Longevity { get; set; } = 5;

        [Range(0, 10)]
        public decimal Sillage { get; set; } = 5;

        [Range(0, 10)]
        public decimal Scent { get; set; } = 5;

        [Range(0, 10)]
        public decimal Value { get; set; } = 5;
    }
}