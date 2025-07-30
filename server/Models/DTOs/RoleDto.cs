namespace Server.Models.DTOs;

public class RoleDto
{
    public Guid id { get; set; }
    public Guid categoryId { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class RoleFilterRequest
{
    public Guid? categoryId { get; set; }
    public string? experienceLevel { get; set; }
    public decimal? minSalary { get; set; }
    public decimal? maxSalary { get; set; }
}

public class RoleSearchRequest
{
    public List<string> categoryIds { get; set; } = new();
    public string searchText { get; set; } = string.Empty;
}