using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{

    public class FragranceSeasons
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FragranceId { get; set; }

        [ForeignKey("FragranceId")]
        public virtual Fragrance Fragrance { get; set; }

        [Range(0, 5)]
        public int Spring { get; set; } = 3;

        [Range(0, 5)]
        public int Summer { get; set; } = 3;

        [Range(0, 5)]
        public int Fall { get; set; } = 3;

        [Range(0, 5)]
        public int Winter { get; set; } = 3;
    }
}
