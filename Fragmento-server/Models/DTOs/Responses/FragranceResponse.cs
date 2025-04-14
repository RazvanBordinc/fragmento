namespace Fragmento_server.Models.DTOs.Responses
{
    public class FragranceResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string Occasion { get; set; }
        public string PhotoUrl { get; set; }
        public int DayNightPreference { get; set; }
        public List<string> Tags { get; set; }
        public List<NoteResponse> Notes { get; set; }
        public List<string> Accords { get; set; }
        public RatingsResponse Ratings { get; set; }
        public SeasonsResponse Seasons { get; set; }
    }
}
