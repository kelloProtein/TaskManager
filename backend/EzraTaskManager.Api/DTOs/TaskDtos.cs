using System.ComponentModel.DataAnnotations;
using EzraTaskManager.Api.Models;

namespace EzraTaskManager.Api.DTOs;

// What the API returns — never exposes the entity directly
public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// What the client sends to create a task
public record CreateTaskRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    TaskPriority Priority = TaskPriority.Medium,
    DateTime? DueDate = null
);

// What the client sends to fully update a task
public record UpdateTaskRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    [Required] TodoStatus Status
);

// For the PATCH /status endpoint — just toggle status
public record UpdateStatusRequest([Required] Models.TodoStatus Status);
