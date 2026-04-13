using Microsoft.Extensions.Logging;
using Moq;
using EzraTaskManager.Api.DTOs;
using EzraTaskManager.Api.Models;
using EzraTaskManager.Api.Repositories;
using EzraTaskManager.Api.Services;

namespace EzraTaskManager.Tests;

// Tests for TaskService — the business logic layer.
// ITaskRepository is mocked so no database is needed.
public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _repoMock;
    private readonly TaskService _service;

    public TaskServiceTests()
    {
        _repoMock = new Mock<ITaskRepository>();
        var loggerMock = new Mock<ILogger<TaskService>>();
        _service = new TaskService(_repoMock.Object, loggerMock.Object);
    }

    // --- CreateAsync ---

    [Fact]
    public async Task CreateAsync_SetsStatusToTodo()
    {
        // Arrange — capture the TaskItem that gets passed to the repo
        TaskItem? captured = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .Callback<TaskItem>(t => captured = t)
            .ReturnsAsync((TaskItem t) => t);

        // Act
        await _service.CreateAsync(new CreateTaskRequest("Buy milk", null));

        // Assert — status must always be Todo on creation regardless of input
        Assert.NotNull(captured);
        Assert.Equal(TodoStatus.Todo, captured!.Status);
    }

    [Fact]
    public async Task CreateAsync_TrimsTitleWhitespace()
    {
        TaskItem? captured = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .Callback<TaskItem>(t => captured = t)
            .ReturnsAsync((TaskItem t) => t);

        await _service.CreateAsync(new CreateTaskRequest("  Buy milk  ", null));

        Assert.Equal("Buy milk", captured!.Title);
    }

    [Fact]
    public async Task CreateAsync_ReturnsTaskResponse_WithCorrectFields()
    {
        var request = new CreateTaskRequest("Fix bug", "Crash on login", TaskPriority.High, null);
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => t);

        var result = await _service.CreateAsync(request);

        Assert.Equal("Fix bug", result.Title);
        Assert.Equal("Crash on login", result.Description);
        Assert.Equal("High", result.Priority);
        Assert.Equal("Todo", result.Status);
    }

    // --- GetByIdAsync ---

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenTaskNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((TaskItem?)null);

        var result = await _service.GetByIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsTaskResponse_WhenFound()
    {
        var task = new TaskItem { Id = 1, Title = "Test task", Status = TodoStatus.InProgress };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(task);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
        Assert.Equal("Test task", result.Title);
        Assert.Equal("InProgress", result.Status);
    }

    // --- UpdateAsync ---

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenTaskNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((TaskItem?)null);

        var result = await _service.UpdateAsync(99, new UpdateTaskRequest("New title", null, TaskPriority.Low, null, TodoStatus.Todo));

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFields_WhenTaskExists()
    {
        var existing = new TaskItem { Id = 1, Title = "Old title", Priority = TaskPriority.Low };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);

        var result = await _service.UpdateAsync(1, new UpdateTaskRequest("New title", "desc", TaskPriority.High, null, TodoStatus.InProgress));

        Assert.NotNull(result);
        Assert.Equal("New title", result!.Title);
        Assert.Equal("High", result.Priority);
    }

    [Fact]
    public async Task UpdateAsync_AppliesStatusFromRequest()
    {
        var existing = new TaskItem { Id = 1, Title = "Task", Status = TodoStatus.Todo };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);

        var result = await _service.UpdateAsync(1, new UpdateTaskRequest("Task", null, TaskPriority.Medium, null, TodoStatus.Done));

        Assert.NotNull(result);
        Assert.Equal("Done", result!.Status);
    }

    // --- UpdateStatusAsync ---

    [Fact]
    public async Task UpdateStatusAsync_ReturnsNull_WhenTaskNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((TaskItem?)null);

        var result = await _service.UpdateStatusAsync(5, TodoStatus.Done);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateStatusAsync_ChangesStatus_WhenTaskExists()
    {
        var existing = new TaskItem { Id = 2, Title = "Do thing", Status = TodoStatus.Todo };
        _repoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);

        var result = await _service.UpdateStatusAsync(2, TodoStatus.Done);

        Assert.NotNull(result);
        Assert.Equal("Done", result!.Status);
    }

    // --- DeleteAsync ---

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenTaskNotFound()
    {
        _repoMock.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _service.DeleteAsync(99);

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenTaskDeleted()
    {
        _repoMock.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _service.DeleteAsync(1);

        Assert.True(result);
    }
}
