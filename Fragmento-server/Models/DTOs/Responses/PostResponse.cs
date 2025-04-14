namespace Fragmento_server.Models.DTOs.Responses
{
    public class PostResponse
    {
        public string Id { get; set; }
        public UserBriefResponse User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public FragranceResponse Fragrance { get; set; }
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public bool IsLiked { get; set; }
        public bool IsSaved { get; set; }
        public List<CommentResponse> Comments { get; set; }
    }

}
