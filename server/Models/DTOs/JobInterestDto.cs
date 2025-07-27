namespace Server.Models.DTOs;

public class JobInterestDto
{
    public string CategoryId { get; set; } = string.Empty;
    public List<string> RoleIds { get; set; } = new();
    public string LocationId { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public string? ExperienceLevel { get; set; }
    public decimal? SalaryExpectation { get; set; }
}