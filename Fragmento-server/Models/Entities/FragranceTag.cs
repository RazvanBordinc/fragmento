using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.Entities
{
    public class FragranceTag
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FragranceId { get; set; }

        [ForeignKey("FragranceId")]
        public virtual Fragrance Fragrance { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }
    }
}
