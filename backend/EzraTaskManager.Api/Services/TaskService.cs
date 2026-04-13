using EzraTaskManager.Api.DTOs;
using EzraTaskManager.Api.Models;
using EzraTaskManager.Api.Repositories;

namespace EzraTaskManager.Api.Services;

// Business logic lives here — controllers just delegate, repository just persists
public class TaskService : ITaskService
{
    private readonly ITaskRepository _repo;
    private readonly ILogger<TaskService> _logger;

    public TaskService(ITaskRepository repo, ILogger<TaskService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskResponse>> GetAllAsync(TodoStatus? status, TaskPriority? priority, string? search)
    {
        var tasks = await _repo.GetAllAsync(status, priority, search);
        return tasks.Select(ToResponse);
    }

    public async Task<TaskResponse?> GetByIdAsync(int id)
    {
        var task = await _repo.GetByIdAsync(id);
        return task is null ? null : ToResponse(task);
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Priority = request.Priority,
            DueDate = request.DueDate,
            Status = TodoStatus.Todo
        };
        var created = await _repo.CreateAsync(task);
        _logger.LogInformation("Task {Id} created: {Title}", created.Id, created.Title);
        return ToResponse(created);
    }

    public async Task<TaskResponse?> UpdateAsync(int id, UpdateTaskRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Title = request.Title.Trim();
        existing.Description = request.Description?.Trim();
        existing.Priority = request.Priority;
        existing.DueDate = request.DueDate;
        existing.Status = request.Status;

        var updated = await _repo.UpdateAsync(existing);
        _logger.LogInformation("Task {Id} updated", id);
        return ToResponse(updated);
    }

    public async Task<TaskResponse?> UpdateStatusAsync(int id, Models.TodoStatus status)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Status = status;
        var updated = await _repo.UpdateAsync(existing);
        _logger.LogInformation("Task {Id} status changed to {Status}", id, status);
        return ToResponse(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var deleted = await _repo.DeleteAsync(id);
        if (deleted)
            _logger.LogInformation("Task {Id} deleted", id);
        return deleted;
    }

    // Maps entity → DTO
    private static TaskResponse ToResponse(TaskItem t) => new(
        t.Id,
        t.Title,
        t.Description,
        t.Status.ToString(),
        t.Priority.ToString(),
        t.DueDate,
        t.CreatedAt,
        t.UpdatedAt
    );
}
