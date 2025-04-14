namespace Fragmento_server.Models.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Text.Json;

    namespace Fragmento_server.Models.Entities
    {
        public class Notification
        {
            [Key]
            public Guid Id { get; set; }

            [Required]
            public Guid UserId { get; set; }

            [ForeignKey("UserId")]
            public virtual User User { get; set; }

            [Required]
            public Guid ActorId { get; set; }

            [ForeignKey("ActorId")]
            public virtual User Actor { get; set; }

            [Required]
            [StringLength(20)]
            public string Type { get; set; }  // "follow", "like", "comment", "mention"

            // Foreign keys to related entities based on notification type
            public Guid? PostId { get; set; }

            [ForeignKey("PostId")]
            public virtual Post Post { get; set; }

            public Guid? CommentId { get; set; }

            [ForeignKey("CommentId")]
            public virtual Comment Comment { get; set; }

            // Extra data as JSON string
            [Column(TypeName = "nvarchar(max)")]
            public string ContentJson { get; set; }

            [NotMapped]
            public NotificationContent Content
            {
                get => string.IsNullOrEmpty(ContentJson)
                    ? new NotificationContent()
                    : JsonSerializer.Deserialize<NotificationContent>(ContentJson);
                set => ContentJson = JsonSerializer.Serialize(value);
            }

            public bool IsRead { get; set; } = false;

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        }

        // This class will be serialized to JSON and stored in the ContentJson field
        public class NotificationContent
        {
            public string Action { get; set; }
            public string PostTitle { get; set; }
            public string CommentText { get; set; }
        }
    }
}
