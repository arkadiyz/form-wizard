using Dapper;
using Microsoft.Data.SqlClient;

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

    public async Task<IEnumerable<string>> GetUserNamesAsync()
    {
        using var connection = new SqlConnection(_connectionString);

        string sql = "SELECT Name FROM dbo.Users";

        var result = await connection.QueryAsync<string>(sql);

        return result;
    }
}
