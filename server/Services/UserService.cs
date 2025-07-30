using Dapper;
using Microsoft.Data.SqlClient;
using Server.Models.DTOs;

public class UserService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public UserService(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    public async Task<IEnumerable<UserDto>> getAllUsersAsync()
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT id, firstName, lastName, phone, email, createdAt, updatedAt FROM Users";

        var result = await connection.QueryAsync<UserDto>(sql);

        return result;
    }

    public async Task<UserDto?> getUserByIdAsync(Guid userId)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT id, firstName, lastName, phone, email, createdAt, updatedAt FROM Users WHERE id = @Id";

        var result = await connection.QuerySingleOrDefaultAsync<UserDto>(sql, new { Id = userId });

        return result;
    }

    public async Task<UserDto?> getUserByEmailAsync(string email)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT id, firstName, lastName, phone, email, createdAt, updatedAt FROM Users WHERE email = @Email";

        var result = await connection.QuerySingleOrDefaultAsync<UserDto>(sql, new { Email = email });

        return result;
    }

    public async Task<UserDto?> getUserByPhoneAsync(string phone)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT id, firstName, lastName, phone, email, createdAt, updatedAt FROM Users WHERE phone = @Phone";

        var result = await connection.QuerySingleOrDefaultAsync<UserDto>(sql, new { Phone = phone });

        return result;
    }

    public async Task<Guid> createUserAsync(PersonalInfoDto personalInfo)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = @"
            INSERT INTO Users (firstName, lastName, phone, email, createdAt, updatedAt)
            OUTPUT INSERTED.id
            VALUES (@FirstName, @LastName, @Phone, @Email, GETUTCDATE(), GETUTCDATE())";

        var userId = await connection.QuerySingleAsync<Guid>(sql, new
        {
            FirstName = personalInfo.firstName,
            LastName = personalInfo.lastName,
            Phone = personalInfo.phone,
            Email = personalInfo.email
        });

        return userId;
    }

    public async Task<bool> updateUserAsync(Guid userId, PersonalInfoDto personalInfo)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = @"
            UPDATE Users 
            SET firstName = @FirstName, 
                lastName = @LastName, 
                phone = @Phone, 
                email = @Email, 
                updatedAt = GETUTCDATE()
            WHERE id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            Id = userId,
            FirstName = personalInfo.firstName,
            LastName = personalInfo.lastName,
            Phone = personalInfo.phone,
            Email = personalInfo.email
        });

        return rowsAffected > 0;
    }

    public async Task<bool> isEmailUniqueAsync(string email, Guid? excludeUserId = null)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT COUNT(*) FROM Users WHERE email = @Email";

        if (excludeUserId.HasValue)
        {
            sql += " AND id != @ExcludeId";
        }

        var count = await connection.QuerySingleAsync<int>(sql, new
        {
            Email = email,
            ExcludeId = excludeUserId
        });

        return count == 0;
    }

    public async Task<bool> isPhoneUniqueAsync(string phone, Guid? excludeUserId = null)
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT COUNT(*) FROM Users WHERE phone = @Phone";

        if (excludeUserId.HasValue)
        {
            sql += " AND id != @ExcludeId";
        }

        var count = await connection.QuerySingleAsync<int>(sql, new
        {
            Phone = phone,
            ExcludeId = excludeUserId
        });

        return count == 0;
    }
    
    public async Task<bool> isEmailAvailableAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT COUNT(1) FROM Users WHERE Email = @email";
        var count = await connection.QuerySingleAsync<int>(sql, new { email = email.ToLowerInvariant() });
        return count == 0;
    }
}
