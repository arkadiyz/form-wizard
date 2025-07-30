namespace Server.Models.DTOs;

public class JobInterestDto
{
    public Guid? categoryId { get; set; }
    public List<Guid> roleIds { get; set; } = new();
    public Guid? locationId { get; set; }
    public List<Guid> skillIds { get; set; } = new();
    public string? experienceLevel { get; set; }
    public decimal? salaryExpectation { get; set; }
}