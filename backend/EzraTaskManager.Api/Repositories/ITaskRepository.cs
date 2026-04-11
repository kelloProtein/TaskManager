using EzraTaskManager.Api.Models;

namespace EzraTaskManager.Api.Repositories;

// Interface like a Java Repository interface — allows swapping implementations
public interface ITaskRepository
{
    Task<IEnumerable<TaskItem>> GetAllAsync(TodoStatus? status, TaskPriority? priority, string? search);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem?> UpdateAsync(TaskItem task);
    Task<bool> DeleteAsync(int id);
}
