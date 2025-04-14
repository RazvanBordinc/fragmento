using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class FragranceNote
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FragranceId { get; set; }

        [ForeignKey("FragranceId")]
        public virtual Fragrance Fragrance { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        // Category can be "top", "middle", "base", or "unspecified"
        [StringLength(20)]
        public string Category { get; set; }

        // Order in the collection
        public int Order { get; set; }
    }
}
