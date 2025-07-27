namespace Server.Models.DTOs;

public class NotificationDto
{
    public bool Email { get; set; } = false;
    public bool Phone { get; set; } = false;
    public bool Call { get; set; } = false;
    public bool SMS { get; set; } = false;
    public bool WhatsApp { get; set; } = false;
}