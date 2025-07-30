namespace Server.Models.DTOs;

public class JobInterestDto
{
    public List<Guid> categoryIds { get; set; } = new(); // Changed from single to list
    public List<Guid> roleIds { get; set; } = new();
    public Guid? locationId { get; set; }
    public List<Guid> mandatorySkills { get; set; } = new(); // New field
    public List<Guid> advantageSkills { get; set; } = new(); // New field
    public List<Guid> skillIds { get; set; } = new(); // Keep for backward compatibility
    public string? experienceLevel { get; set; }
    public decimal? salaryExpectation { get; set; }
}