using Microsoft.AspNetCore.Mvc;
using EzraTaskManager.Api.DTOs;
using EzraTaskManager.Api.Models;
using EzraTaskManager.Api.Services;

namespace EzraTaskManager.Api.Controllers;

// Thin controller — no business logic, just HTTP in/out
// Like a Spring @RestController
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service) => _service = service;

    // GET /api/tasks?status=Todo&priority=High&search=fix
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] TodoStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] string? search)
    {
        var tasks = await _service.GetAllAsync(status, priority, search);
        return Ok(tasks);
    }

    // GET /api/tasks/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _service.GetByIdAsync(id);
        return task is null ? NotFound() : Ok(task);
    }

    // POST /api/tasks
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var updated = await _service.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    // PATCH /api/tasks/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var updated = await _service.UpdateStatusAsync(id, request.Status);
        return updated is null ? NotFound() : Ok(updated);
    }

    // DELETE /api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
