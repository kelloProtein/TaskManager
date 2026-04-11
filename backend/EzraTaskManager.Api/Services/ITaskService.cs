using EzraTaskManager.Api.DTOs;
using EzraTaskManager.Api.Models;

namespace EzraTaskManager.Api.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskResponse>> GetAllAsync(TodoStatus? status, TaskPriority? priority, string? search);
    Task<TaskResponse?> GetByIdAsync(int id);
    Task<TaskResponse> CreateAsync(CreateTaskRequest request);
    Task<TaskResponse?> UpdateAsync(int id, UpdateTaskRequest request);
    Task<TaskResponse?> UpdateStatusAsync(int id, Models.TodoStatus status);
    Task<bool> DeleteAsync(int id);
}
