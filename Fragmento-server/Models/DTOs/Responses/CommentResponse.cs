namespace Fragmento_server.Models.DTOs.Responses
{
public class CommentResponse
    {
        public string Id { get; set; }
        public UserBriefResponse User { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int LikesCount { get; set; }
        public int RepliesCount { get; set; }
        public bool IsLiked { get; set; }
        public bool IsOwner { get; set; }
        public List<CommentResponse> Replies { get; set; }
    }
}
