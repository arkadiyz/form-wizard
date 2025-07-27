using Server.Models.DTOs;

namespace Server.Services.Interfaces;

/// <summary>
/// Interface for FormState service that handles XML-based persistent storage
/// </summary>
public interface IFormStateService
{
    /// <summary>
    /// Get form state by session ID
    /// </summary>
    /// <param name="sessionId">Unique session identifier</param>
    /// <returns>FormStateDto if found, null if not found</returns>
    Task<FormStateDto?> GetFormStateAsync(string sessionId);

    /// <summary>
    /// Save or update form state with XML serialization
    /// </summary>
    /// <param name="request">Form state data to save</param>
    /// <returns>Saved FormStateDto</returns>
    Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request);

    /// <summary>
    /// Update current step only (for step navigation)
    /// </summary>
    /// <param name="sessionId">Session identifier</param>
    /// <param name="currentStep">Step number to update to</param>
    /// <returns>True if updated successfully</returns>
    Task<bool> UpdateCurrentStepAsync(string sessionId, int currentStep);

    /// <summary>
    /// Mark form as completed (final submission)
    /// </summary>
    /// <param name="sessionId">Session identifier</param>
    /// <returns>True if marked as completed successfully</returns>
    Task<bool> MarkCompletedAsync(string sessionId);

    /// <summary>
    /// Delete form state (for cleanup or reset)
    /// </summary>
    /// <param name="sessionId">Session identifier</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteFormStateAsync(string sessionId);
}