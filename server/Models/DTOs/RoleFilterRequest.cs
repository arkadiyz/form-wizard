namespace Server.Models.DTOs;

public class RoleFilterRequest
{
    public Guid? categoryId { get; set; }
    public string? experienceLevel { get; set; }
    public decimal? minSalary { get; set; }
    public decimal? maxSalary { get; set; }
    public List<Guid>? requiredSkillIds { get; set; }
    public bool includeSkills { get; set; } = false;
    public string? searchTerm { get; set; }
    public int? limit { get; set; }
    public int? offset { get; set; }
}