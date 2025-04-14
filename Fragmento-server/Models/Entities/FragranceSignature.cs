using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fragmento_server.Models.Entities
{
    public class FragranceSignature
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string Brand { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        [StringLength(500)]
        public string PhotoUrl { get; set; }

        // Navigation property for notes
        public virtual ICollection<FragranceSignatureNote> Notes { get; set; } = new List<FragranceSignatureNote>();
    }

 
}