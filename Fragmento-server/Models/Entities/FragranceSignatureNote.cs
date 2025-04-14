using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class FragranceSignatureNote
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FragranceSignatureId { get; set; }

        [ForeignKey("FragranceSignatureId")]
        public virtual FragranceSignature FragranceSignature { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        // Optional category for organizing notes (top, middle, base)
        [StringLength(20)]
        public string Category { get; set; }

        // Ordering within the notes collection
        public int Order { get; set; }
    }
}
