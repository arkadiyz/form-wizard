using Dapper;
using Microsoft.Data.SqlClient;
using Server.Models.DTOs;

namespace Server.Services;

public class FormService
{
    private readonly string _connectionString;

    public FormService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<FormDataDto> SubmitFormAsync(FormDataDto formData)
    {
        using var connection = new SqlConnection(_connectionString);

        // פתיחת טרנזקציה
        using var transaction = connection.BeginTransaction();

        try
        {
            // יצירת משתמש חדש
            var userId = await CreateUserAsync(connection, transaction, formData.personalInfo);

            // שמירת העדפות התראות
            await SaveNotificationsAsync(connection, transaction, userId, formData.notifications);

            // שמירת רישום עבודה
            await SaveJobRegistrationAsync(connection, transaction, userId, formData.jobInterest);

            transaction.Commit();

            // החזרת הנתונים המעודכנים עם ה-userId
            formData.notifications.userId = userId;
            return formData;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private async Task<Guid> CreateUserAsync(SqlConnection connection, System.Data.IDbTransaction transaction, PersonalInfoDto personalInfo)
    {
        const string sql = @"
            INSERT INTO Users (firstName, lastName, phone, email, createdAt, updatedAt)
            OUTPUT INSERTED.id
            VALUES (@FirstName, @LastName, @Phone, @Email, GETUTCDATE(), GETUTCDATE())";

        var userId = await connection.QuerySingleAsync<Guid>(sql, new
        {
            FirstName = personalInfo.firstName,
            LastName = personalInfo.lastName,
            Phone = personalInfo.phone,
            Email = personalInfo.email
        }, transaction);

        return userId;
    }

    private async Task SaveNotificationsAsync(SqlConnection connection, System.Data.IDbTransaction transaction, Guid userId, NotificationDto notifications)
    {
        const string sql = @"
            INSERT INTO Notifications (id, userId, isEmailEnabled, isPhoneEnabled, isCallEnabled, isSmsEnabled, isWhatsappEnabled, createdAt, updatedAt)
            VALUES (@Id, @UserId, @IsEmailEnabled, @IsPhoneEnabled, @IsCallEnabled, @IsSmsEnabled, @IsWhatsappEnabled, GETUTCDATE(), GETUTCDATE())";

        await connection.ExecuteAsync(sql, new
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            IsEmailEnabled = notifications.isEmailEnabled,
            IsPhoneEnabled = notifications.isPhoneEnabled,
            IsCallEnabled = notifications.isCallEnabled,
            IsSmsEnabled = notifications.isSmsEnabled,
            IsWhatsappEnabled = notifications.isWhatsappEnabled
        }, transaction);
    }

    private async Task SaveJobRegistrationAsync(SqlConnection connection, System.Data.IDbTransaction transaction, Guid userId, JobInterestDto jobInterest)
    {
        // For now, we'll use the first category as the main category (for backward compatibility with existing DB structure)
        var primaryCategoryId = jobInterest.categoryIds?.FirstOrDefault();
        
        const string sql = @"
            INSERT INTO JobRegistrations (id, userId, categoryId, locationId, experienceLevel, salaryExpectation, createdAt, updatedAt)
            VALUES (@Id, @UserId, @CategoryId, @LocationId, @ExperienceLevel, @SalaryExpectation, GETUTCDATE(), GETUTCDATE())";

        var jobRegistrationId = Guid.NewGuid();

        await connection.ExecuteAsync(sql, new
        {
            Id = jobRegistrationId,
            UserId = userId,
            CategoryId = primaryCategoryId,
            LocationId = jobInterest.locationId,
            ExperienceLevel = jobInterest.experienceLevel,
            SalaryExpectation = jobInterest.salaryExpectation
        }, transaction);

        // שמירת התפקידים המבוקשים
        if (jobInterest.roleIds?.Any() == true)
        {
            await SaveJobRegistrationRolesAsync(connection, transaction, jobRegistrationId, jobInterest.roleIds);
        }

        // שמירת הכישורים החובה
        if (jobInterest.mandatorySkills?.Any() == true)
        {
            await SaveJobRegistrationSkillsAsync(connection, transaction, jobRegistrationId, jobInterest.mandatorySkills);
        }

        // שמירת כישורי היתרון
        if (jobInterest.advantageSkills?.Any() == true)
        {
            await SaveJobRegistrationSkillsAsync(connection, transaction, jobRegistrationId, jobInterest.advantageSkills);
        }

        // שמירת כישורים רגילים (לתאימות לאחור)
        if (jobInterest.skillIds?.Any() == true)
        {
            await SaveJobRegistrationSkillsAsync(connection, transaction, jobRegistrationId, jobInterest.skillIds);
        }
    }

    private async Task SaveJobRegistrationRolesAsync(SqlConnection connection, System.Data.IDbTransaction transaction, Guid jobRegistrationId, List<Guid> roleIds)
    {
        const string sql = @"
            INSERT INTO JobRegistrationRoles (id, jobRegistrationId, roleId, createdAt)
            VALUES (@Id, @JobRegistrationId, @RoleId, GETUTCDATE())";

        foreach (var roleId in roleIds)
        {
            await connection.ExecuteAsync(sql, new
            {
                Id = Guid.NewGuid(),
                JobRegistrationId = jobRegistrationId,
                RoleId = roleId
            }, transaction);
        }
    }

    private async Task SaveJobRegistrationSkillsAsync(SqlConnection connection, System.Data.IDbTransaction transaction, Guid jobRegistrationId, List<Guid> skillIds)
    {
        const string sql = @"
            INSERT INTO JobRegistrationSkills (id, jobRegistrationId, skillId, createdAt)
            VALUES (@Id, @JobRegistrationId, @SkillId, GETUTCDATE())";

        foreach (var skillId in skillIds)
        {
            await connection.ExecuteAsync(sql, new
            {
                Id = Guid.NewGuid(),
                JobRegistrationId = jobRegistrationId,
                SkillId = skillId
            }, transaction);
        }
    }
}