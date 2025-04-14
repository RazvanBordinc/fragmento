using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class MarkNotificationsReadRequest
    {
        [Required]
        public List<string> NotificationIds { get; set; }
    }
}
