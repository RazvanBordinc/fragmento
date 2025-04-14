namespace Fragmento_server.Models.DTOs.Responses
{
    public class NotificationResponse
    {
        public string Id { get; set; }
        public string Type { get; set; }  // "follow", "like", "comment", "mention"
        public UserBriefResponse Actor { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public NotificationContentResponse Content { get; set; }
        public string PostId { get; set; }
        public string CommentId { get; set; }
    }
}
