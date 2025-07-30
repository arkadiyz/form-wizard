namespace Server.Models.DTOs;

public class NotificationDto
{
    public Guid id { get; set; }
    public Guid userId { get; set; }
    public bool isEmailEnabled { get; set; } = true;
    public bool isPhoneEnabled { get; set; } = false;
    public bool isCallEnabled { get; set; } = false;
    public bool isSmsEnabled { get; set; } = false;
    public bool isWhatsappEnabled { get; set; } = false;
    public DateTime createdAt { get; set; }
    public DateTime updatedAt { get; set; }
}