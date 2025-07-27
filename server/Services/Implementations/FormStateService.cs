using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Xml.Linq;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class FormStateService : IFormStateService
{
    private readonly string _connectionString;

    public FormStateService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<FormStateDto?> GetFormStateAsync(string sessionId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT id, sessionId, formDataXml, currentStep, isCompleted, createdAt, updatedAt
            FROM FormState
            WHERE sessionId = @SessionId";

        var result = await connection.QueryFirstOrDefaultAsync(sql, new { SessionId = sessionId });

        if (result == null) return null;

        // Convert XML to FormDataDto
        var formData = ConvertXmlToFormData(result.formDataXml);

        return new FormStateDto
        {
            Id = result.id,
            SessionId = result.sessionId,
            FormData = formData,
            CurrentStep = result.currentStep,
            IsCompleted = result.isCompleted,
            CreatedAt = result.createdAt,
            UpdatedAt = result.updatedAt
        };
    }

    public async Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request)
    {
        using var connection = new SqlConnection(_connectionString);

        var xml = ConvertFormDataToXml(request.FormData);

        const string sql = @"
            MERGE FormState AS target
            USING (SELECT @SessionId as sessionId) AS source
            ON target.sessionId = source.sessionId
            WHEN MATCHED THEN
                UPDATE SET
                    formDataXml = @FormDataXml,
                    currentStep = @CurrentStep,
                    updatedAt = GETUTCDATE()
            WHEN NOT MATCHED THEN
                INSERT (sessionId, formDataXml, currentStep)
                VALUES (@SessionId, @FormDataXml, @CurrentStep);

            SELECT id, sessionId, formDataXml, currentStep, isCompleted, createdAt, updatedAt
            FROM FormState
            WHERE sessionId = @SessionId";

        var result = await connection.QueryFirstAsync(sql, new
        {
            SessionId = request.SessionId,
            FormDataXml = xml,
            CurrentStep = request.CurrentStep
        });

        return new FormStateDto
        {
            Id = result.id,
            SessionId = result.sessionId,
            FormData = request.FormData,
            CurrentStep = result.currentStep,
            IsCompleted = result.isCompleted,
            CreatedAt = result.createdAt,
            UpdatedAt = result.updatedAt
        };
    }

    public async Task<bool> UpdateCurrentStepAsync(string sessionId, int currentStep)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE FormState
            SET currentStep = @CurrentStep, updatedAt = GETUTCDATE()
            WHERE sessionId = @SessionId";

        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            SessionId = sessionId,
            CurrentStep = currentStep
        });

        return rowsAffected > 0;
    }

    public async Task<bool> MarkCompletedAsync(string sessionId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE FormState
            SET isCompleted = 1, updatedAt = GETUTCDATE()
            WHERE sessionId = @SessionId";

        var rowsAffected = await connection.ExecuteAsync(sql, new { SessionId = sessionId });
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteFormStateAsync(string sessionId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = "DELETE FROM FormState WHERE sessionId = @SessionId";
        var rowsAffected = await connection.ExecuteAsync(sql, new { SessionId = sessionId });

        return rowsAffected > 0;
    }

    #region XML Conversion Methods

    /// <summary>
    /// Convert FormDataDto to XML string for database storage
    /// </summary>
    private string ConvertFormDataToXml(FormDataDto formData)
    {
        var doc = new XDocument(
            new XElement("FormData",
                new XElement("PersonalInfo",
                    new XElement("FirstName", formData.PersonalInfo.FirstName),
                    new XElement("LastName", formData.PersonalInfo.LastName),
                    new XElement("Phone", formData.PersonalInfo.Phone),
                    new XElement("Email", formData.PersonalInfo.Email)
                ),
                new XElement("JobInterest",
                    new XElement("CategoryId", formData.JobInterest.CategoryId),
                    new XElement("RoleIds",
                        formData.JobInterest.RoleIds.Select(id => new XElement("RoleId", id))
                    ),
                    new XElement("LocationId", formData.JobInterest.LocationId),
                    new XElement("Skills",
                        formData.JobInterest.Skills.Select(skill => new XElement("Skill", skill))
                    ),
                    new XElement("ExperienceLevel", formData.JobInterest.ExperienceLevel ?? ""),
                    new XElement("SalaryExpectation", formData.JobInterest.SalaryExpectation?.ToString() ?? "")
                ),
                new XElement("Notifications",
                    new XElement("Email", formData.Notifications.Email),
                    new XElement("Phone", formData.Notifications.Phone),
                    new XElement("Call", formData.Notifications.Call),
                    new XElement("SMS", formData.Notifications.SMS),
                    new XElement("WhatsApp", formData.Notifications.WhatsApp)
                )
            )
        );

        return doc.ToString();
    }

    /// <summary>
    /// Convert XML string from database back to FormDataDto
    /// </summary>
    private FormDataDto ConvertXmlToFormData(string xmlString)
    {
        var doc = XDocument.Parse(xmlString);
        var root = doc.Root!;

        var personalInfo = root.Element("PersonalInfo");
        var jobInterest = root.Element("JobInterest");
        var notifications = root.Element("Notifications");

        return new FormDataDto
        {
            PersonalInfo = new PersonalInfoDto
            {
                FirstName = personalInfo?.Element("FirstName")?.Value ?? "",
                LastName = personalInfo?.Element("LastName")?.Value ?? "",
                Phone = personalInfo?.Element("Phone")?.Value ?? "",
                Email = personalInfo?.Element("Email")?.Value ?? ""
            },
            JobInterest = new JobInterestDto
            {
                CategoryId = jobInterest?.Element("CategoryId")?.Value ?? "",
                RoleIds = jobInterest?.Element("RoleIds")?.Elements("RoleId")
                    .Select(e => e.Value).ToList() ?? new List<string>(),
                LocationId = jobInterest?.Element("LocationId")?.Value ?? "",
                Skills = jobInterest?.Element("Skills")?.Elements("Skill")
                    .Select(e => e.Value).ToList() ?? new List<string>(),
                ExperienceLevel = jobInterest?.Element("ExperienceLevel")?.Value,
                SalaryExpectation = decimal.TryParse(jobInterest?.Element("SalaryExpectation")?.Value, out var salary) ? salary : null
            },
            Notifications = new NotificationDto
            {
                Email = bool.TryParse(notifications?.Element("Email")?.Value, out var email) && email,
                Phone = bool.TryParse(notifications?.Element("Phone")?.Value, out var phone) && phone,
                Call = bool.TryParse(notifications?.Element("Call")?.Value, out var call) && call,
                SMS = bool.TryParse(notifications?.Element("SMS")?.Value, out var sms) && sms,
                WhatsApp = bool.TryParse(notifications?.Element("WhatsApp")?.Value, out var whatsapp) && whatsapp
            }
        };
    }

    #endregion
}