namespace Server.Models.DTOs;

public class UserDto
{
    public Guid id { get; set; }
    public string firstName { get; set; } = string.Empty;
    public string lastName { get; set; } = string.Empty;
    public string phone { get; set; } = string.Empty;
    public string email { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
    public DateTime updatedAt { get; set; }
}