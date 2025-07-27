namespace Server.Models.DTOs;

public class RoleDto
{
    public int id { get; set; }
    public int categoryId { get; set; }
    public string name { get; set; } = string.Empty;
    public string displayNameEn { get; set; } = string.Empty;
    public string displayNameHe { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class RoleFilterRequest
{
    public int? categoryId { get; set; }
}