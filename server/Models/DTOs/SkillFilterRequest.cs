namespace Server.Models.DTOs;

public class SkillFilterRequest
{
    public Guid? categoryId { get; set; }
    public string? skillType { get; set; }
    public string? proficiencyLevel { get; set; }
    public bool? isPopular { get; set; }
    public string? searchTerm { get; set; }
    public int? limit { get; set; }
    public int? offset { get; set; }
}