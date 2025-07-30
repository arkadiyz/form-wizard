using Microsoft.AspNetCore.Mvc;
using Server.Models.DTOs;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> getAllUsers()
    {
        try
        {
            var users = await _userService.getAllUsersAsync();
            return Ok(new ApiResponse<IEnumerable<UserDto>>
            {
                success = true,
                message = "Users retrieved successfully",
                data = users
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<IEnumerable<UserDto>>
            {
                success = false,
                message = "Failed to retrieve users",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> getUserById(Guid id)
    {
        try
        {
            var user = await _userService.getUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new ApiResponse<UserDto>
                {
                    success = false,
                    message = "User not found"
                });
            }

            return Ok(new ApiResponse<UserDto>
            {
                success = true,
                message = "User retrieved successfully",
                data = user
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<UserDto>
            {
                success = false,
                message = "Failed to retrieve user",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> getUserByEmail(string email)
    {
        try
        {
            var user = await _userService.getUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new ApiResponse<UserDto>
                {
                    success = false,
                    message = "User not found"
                });
            }

            return Ok(new ApiResponse<UserDto>
            {
                success = true,
                message = "User retrieved successfully",
                data = user
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<UserDto>
            {
                success = false,
                message = "Failed to retrieve user",
                errors = [ex.Message]
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> createUser([FromBody] PersonalInfoDto personalInfo)
    {
        try
        {
            // Check if email is unique
            var isEmailUnique = await _userService.isEmailUniqueAsync(personalInfo.email);
            if (!isEmailUnique)
            {
                return BadRequest(new ApiResponse<Guid>
                {
                    success = false,
                    message = "Email already exists"
                });
            }

            // Check if phone is unique
            var isPhoneUnique = await _userService.isPhoneUniqueAsync(personalInfo.phone);
            if (!isPhoneUnique)
            {
                return BadRequest(new ApiResponse<Guid>
                {
                    success = false,
                    message = "Phone number already exists"
                });
            }

            var userId = await _userService.createUserAsync(personalInfo);
            return Ok(new ApiResponse<Guid>
            {
                success = true,
                message = "User created successfully",
                data = userId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<Guid>
            {
                success = false,
                message = "Failed to create user",
                errors = [ex.Message]
            });
        }
    }
    [HttpGet("check-email/{email}")]
    public async Task<IActionResult> CheckEmailAvailability(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        try
        {
            var isAvailable = await _userService.isEmailAvailableAsync(email);
            return Ok(new
            {
                email = email,
                isAvailable = isAvailable,
                message = isAvailable ? "Email is available" : "Email is already taken"
            });
        }
        catch (Exception ex)
        { 
            return StatusCode(500, new ApiResponse<Guid>
            {
                success = false,
                message = "Failed to check email",
                errors = [ex.Message]
            });
        }
    
    }
}

