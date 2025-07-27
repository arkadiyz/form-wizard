namespace Server.Models.DTOs;

public class LocationFilterRequest
{
    public string? country { get; set; }
    public string? region { get; set; }
    public string? city { get; set; }
    public string? searchTerm { get; set; }
    public bool includeRemote { get; set; } = true;
    public int? limit { get; set; }
    public int? offset { get; set; }
}