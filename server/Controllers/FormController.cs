using Microsoft.AspNetCore.Mvc;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormController : ControllerBase
    {
        private readonly IFormStateService _formStateService;

        public FormController(IFormStateService formStateService)
        {
            _formStateService = formStateService;
        }

        /// <summary>
        /// Save or update form state with XML persistence
        /// </summary>
        [HttpPost("save-state")]
        public async Task<ActionResult<ApiResponse<FormStateDto>>> SaveState([FromBody] SaveFormStateRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.SessionId))
                {
                    return BadRequest(new ApiResponse<FormStateDto>
                    {
                        Success = false,
                        Message = "SessionId is required",
                        Errors = ["SessionId cannot be empty"]
                    });
                }

                var result = await _formStateService.SaveFormStateAsync(request);
                
                return Ok(new ApiResponse<FormStateDto>
                {
                    Success = true,
                    Message = "Form state saved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<FormStateDto>
                {
                    Success = false,
                    Message = "Internal server error",
                    Errors = [ex.Message]
                });
            }
        }

        /// <summary>
        /// Load form state by session ID
        /// </summary>
        [HttpGet("load-state/{sessionId}")]
        public async Task<ActionResult<ApiResponse<FormStateDto>>> LoadState(string sessionId)
        {
            try
            {
                if (string.IsNullOrEmpty(sessionId))
                {
                    return BadRequest(new ApiResponse<FormStateDto>
                    {
                        Success = false,
                        Message = "SessionId is required",
                        Errors = ["SessionId cannot be empty"]
                    });
                }

                var result = await _formStateService.GetFormStateAsync(sessionId);
                
                if (result == null)
                {
                    return NotFound(new ApiResponse<FormStateDto>
                    {
                        Success = false,
                        Message = "Form state not found",
                        Errors = [$"No form state found for session: {sessionId}"]
                    });
                }

                return Ok(new ApiResponse<FormStateDto>
                {
                    Success = true,
                    Message = "Form state loaded successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<FormStateDto>
                {
                    Success = false,
                    Message = "Internal server error",
                    Errors = [ex.Message]
                });
            }
        }

        /// <summary>
        /// Update current step only (for navigation)
        /// </summary>
        [HttpPut("update-step")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStep([FromBody] UpdateStepRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.SessionId))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "SessionId is required",
                        Errors = ["SessionId cannot be empty"]
                    });
                }

                var result = await _formStateService.UpdateCurrentStepAsync(request.SessionId, request.CurrentStep);
                
                if (!result)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Form state not found",
                        Errors = [$"No form state found for session: {request.SessionId}"]
                    });
                }

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Step updated successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Internal server error",
                    Errors = [ex.Message]
                });
            }
        }

        /// <summary>
        /// Submit final form (mark as completed)
        /// </summary>
        [HttpPost("submit-final")]
        public async Task<ActionResult<ApiResponse<bool>>> SubmitFinal([FromBody] SubmitFormRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.SessionId))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "SessionId is required",
                        Errors = ["SessionId cannot be empty"]
                    });
                }

                var result = await _formStateService.MarkCompletedAsync(request.SessionId);
                
                if (!result)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Form state not found",
                        Errors = [$"No form state found for session: {request.SessionId}"]
                    });
                }

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Form submitted successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Internal server error",
                    Errors = [ex.Message]
                });
            }
        }

        [HttpGet]
        public IActionResult GetForms()
        {
            var forms = new[]
            {
                new { Id = 1, Name = "Contact Form" },
                new { Id = 2, Name = "Registration Form" }
            };

            return Ok(forms);
        }
    }
}
