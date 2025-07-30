using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class LocationDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class LocationFilterRequest
{
    public string? locationType { get; set; }
    public Guid? parentLocationId { get; set; }
    public string? countryCode { get; set; }
}