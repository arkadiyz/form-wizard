using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class LocationDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public string displayNameEn { get; set; } = string.Empty;
    public string displayNameHe { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class LocationFilterRequest
{
    // Simple filter for locations
}