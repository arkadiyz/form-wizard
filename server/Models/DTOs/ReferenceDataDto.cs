namespace Server.Models.DTOs;

public class SkillsCategoryDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

// Combined response DTOs
public class ReferenceDataResponse
{
    public List<CategoryDto> categories { get; set; } = new();
    public List<RoleDto> roles { get; set; } = new();
    public List<LocationDto> locations { get; set; } = new();
    public List<SkillDto> skills { get; set; } = new();
    public List<SkillsCategoryDto> skillsCategories { get; set; } = new();
    public DateTime lastUpdated { get; set; } = DateTime.UtcNow;
}

public class ReferenceDataRequest
{
    public bool includeCategories { get; set; } = true;
    public bool includeRoles { get; set; } = true;
    public bool includeLocations { get; set; } = true;
    public bool includeSkills { get; set; } = true;
    public bool includeSkillsCategories { get; set; } = true;
}