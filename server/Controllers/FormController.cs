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
                var result = await _formStateService.SaveFormStateAsync(request);
                return Ok(new ApiResponse<FormStateDto> 
                { 
                    success = true, 
                    message = "Form state saved successfully", 
                    data = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<FormStateDto> 
                { 
                    success = false, 
                    message = "Failed to save form state", 
                    errors = new List<string> { ex.Message } 
                });
            }
        }

        /// <summary>
        /// Get form state by session ID
        /// </summary>
        [HttpGet("state/{sessionId}")]
        public async Task<ActionResult<ApiResponse<FormStateDto>>> GetState(string sessionId)
        {
            try
            {
                var result = await _formStateService.GetFormStateAsync(sessionId);
                if (result == null)
                {
                    return NotFound(new ApiResponse<FormStateDto> 
                    { 
                        success = false, 
                        message = "Form state not found" 
                    });
                }

                return Ok(new ApiResponse<FormStateDto> 
                { 
                    success = true, 
                    message = "Form state retrieved successfully", 
                    data = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<FormStateDto> 
                { 
                    success = false, 
                    message = "Failed to retrieve form state", 
                    errors = new List<string> { ex.Message } 
                });
            }
        }

        /// <summary>
        /// Update current step
        /// </summary>
        [HttpPut("update-step")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStep([FromBody] UpdateStepRequest request)
        {
            try
            {
                var result = await _formStateService.UpdateCurrentStepAsync(request.sessionId, request.currentStep);
                return Ok(new ApiResponse<bool> 
                { 
                    success = true, 
                    message = "Step updated successfully", 
                    data = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<bool> 
                { 
                    success = false, 
                    message = "Failed to update step", 
                    errors = new List<string> { ex.Message } 
                });
            }
        }

        /// <summary>
        /// Submit final form
        /// </summary>
        [HttpPost("submit")]
        public async Task<ActionResult<ApiResponse<bool>>> SubmitForm([FromBody] SubmitFormRequest request)
        {
            try
            {
                var result = await _formStateService.MarkCompletedAsync(request.sessionId);
                return Ok(new ApiResponse<bool> 
                { 
                    success = true, 
                    message = "Form submitted successfully", 
                    data = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<bool> 
                { 
                    success = false, 
                    message = "Failed to submit form", 
                    errors = new List<string> { ex.Message } 
                });
            }
        }
    }
}
