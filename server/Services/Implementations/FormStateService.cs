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
            id = result.id,
            sessionId = result.sessionId,
            formData = formData,
            currentStep = result.currentStep,
            isCompleted = result.isCompleted,
            createdAt = result.createdAt,
            updatedAt = result.updatedAt
        };
    }

    public async Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request)
    {
        using var connection = new SqlConnection(_connectionString);

        var xml = ConvertFormDataToXml(request.formData);

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
            SessionId = request.sessionId,
            FormDataXml = xml,
            CurrentStep = request.currentStep
        });

        return new FormStateDto
        {
            id = result.id,
            sessionId = result.sessionId,
            formData = request.formData,
            currentStep = result.currentStep,
            isCompleted = result.isCompleted,
            createdAt = result.createdAt,
            updatedAt = result.updatedAt
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
                    new XElement("FirstName", formData.personalInfo.firstName),
                    new XElement("LastName", formData.personalInfo.lastName),
                    new XElement("Phone", formData.personalInfo.phone),
                    new XElement("Email", formData.personalInfo.email)
                ),
                new XElement("JobInterest",
                    new XElement("CategoryIds",
                        formData.jobInterest.categoryIds?.Select(id => new XElement("CategoryId", id)) ?? Enumerable.Empty<XElement>()
                    ),
                    new XElement("RoleIds",
                        formData.jobInterest.roleIds?.Select(id => new XElement("RoleId", id)) ?? Enumerable.Empty<XElement>()
                    ),
                    new XElement("LocationId", formData.jobInterest.locationId?.ToString() ?? ""),
                    new XElement("MandatorySkills",
                        formData.jobInterest.mandatorySkills?.Select(skill => new XElement("SkillId", skill)) ?? Enumerable.Empty<XElement>()
                    ),
                    new XElement("AdvantageSkills",
                        formData.jobInterest.advantageSkills?.Select(skill => new XElement("SkillId", skill)) ?? Enumerable.Empty<XElement>()
                    ),
                    new XElement("SkillIds",
                        formData.jobInterest.skillIds?.Select(skill => new XElement("SkillId", skill)) ?? Enumerable.Empty<XElement>()
                    ),
                    new XElement("ExperienceLevel", formData.jobInterest.experienceLevel ?? ""),
                    new XElement("SalaryExpectation", formData.jobInterest.salaryExpectation?.ToString() ?? "")
                ),
                new XElement("Notifications",
                    new XElement("IsEmailEnabled", formData.notifications.isEmailEnabled),
                    new XElement("IsPhoneEnabled", formData.notifications.isPhoneEnabled),
                    new XElement("IsCallEnabled", formData.notifications.isCallEnabled),
                    new XElement("IsSmsEnabled", formData.notifications.isSmsEnabled),
                    new XElement("IsWhatsappEnabled", formData.notifications.isWhatsappEnabled)
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
            personalInfo = new PersonalInfoDto
            {
                firstName = personalInfo?.Element("FirstName")?.Value ?? "",
                lastName = personalInfo?.Element("LastName")?.Value ?? "",
                phone = personalInfo?.Element("Phone")?.Value ?? "",
                email = personalInfo?.Element("Email")?.Value ?? ""
            },
            jobInterest = new JobInterestDto
            {
                categoryIds = jobInterest?.Element("CategoryIds")?.Elements("CategoryId")
                    .Select(e => Guid.TryParse(e.Value, out var categoryId) ? categoryId : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList() ?? new List<Guid>(),
                roleIds = jobInterest?.Element("RoleIds")?.Elements("RoleId")
                    .Select(e => Guid.TryParse(e.Value, out var roleId) ? roleId : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList() ?? new List<Guid>(),
                locationId = Guid.TryParse(jobInterest?.Element("LocationId")?.Value, out var locId) && locId != Guid.Empty ? locId : null,
                mandatorySkills = jobInterest?.Element("MandatorySkills")?.Elements("SkillId")
                    .Select(e => Guid.TryParse(e.Value, out var skillId) ? skillId : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList() ?? new List<Guid>(),
                advantageSkills = jobInterest?.Element("AdvantageSkills")?.Elements("SkillId")
                    .Select(e => Guid.TryParse(e.Value, out var skillId) ? skillId : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList() ?? new List<Guid>(),
                skillIds = jobInterest?.Element("SkillIds")?.Elements("SkillId")
                    .Select(e => Guid.TryParse(e.Value, out var skillId) ? skillId : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList() ?? new List<Guid>(),
                experienceLevel = jobInterest?.Element("ExperienceLevel")?.Value,
                salaryExpectation = decimal.TryParse(jobInterest?.Element("SalaryExpectation")?.Value, out var salary) ? salary : null
            },
            notifications = new NotificationDto
            {
                id = Guid.NewGuid(),
                userId = Guid.Empty, // יעודכן בהמשך
                isEmailEnabled = bool.TryParse(notifications?.Element("IsEmailEnabled")?.Value, out var email) && email,
                isPhoneEnabled = bool.TryParse(notifications?.Element("IsPhoneEnabled")?.Value, out var phone) && phone,
                isCallEnabled = bool.TryParse(notifications?.Element("IsCallEnabled")?.Value, out var call) && call,
                isSmsEnabled = bool.TryParse(notifications?.Element("IsSmsEnabled")?.Value, out var sms) && sms,
                isWhatsappEnabled = bool.TryParse(notifications?.Element("IsWhatsappEnabled")?.Value, out var whatsapp) && whatsapp,
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow
            }
        };
    }

    #endregion
}