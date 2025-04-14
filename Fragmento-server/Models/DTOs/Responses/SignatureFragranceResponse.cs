namespace Fragmento_server.Models.DTOs.Responses
{
    public class SignatureFragranceResponse
    {
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public List<NoteResponse> Notes { get; set; }
    }
}
