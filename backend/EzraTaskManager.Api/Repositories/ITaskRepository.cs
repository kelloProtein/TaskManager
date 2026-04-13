using EzraTaskManager.Api.Models;

namespace EzraTaskManager.Api.Repositories;

// Repository contract — allows swapping implementations (e.g., for testing)
public interface ITaskRepository
{
    Task<IEnumerable<TaskItem>> GetAllAsync(TodoStatus? status, TaskPriority? priority, string? search);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem?> UpdateAsync(TaskItem task);
    Task<bool> DeleteAsync(int id);
}
