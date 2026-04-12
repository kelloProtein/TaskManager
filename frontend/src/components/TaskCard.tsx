import type { Task } from '../types/task';
import { nextStatus } from '../services/taskApi';

// Presentational component — no state, just props in, JSX out.
// Renders one task with status toggle, edit, and delete actions.
interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onStatusToggle: (id: number, newStatus: 0 | 1 | 2) => void;
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'Done') return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function TaskCard({ task, onDelete, onEdit, onStatusToggle }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <li
      className={`task-card ${overdue ? 'task-card--overdue' : ''}`}
      data-testid={`task-${task.id}`}
    >
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
        <div className="task-card__meta">
          <button
            type="button"
            className={`badge badge--status-${task.status.toLowerCase()} badge--clickable`}
            onClick={() => onStatusToggle(task.id, nextStatus(task.status))}
            aria-label={`Change status from ${task.status}`}
            title="Click to cycle status"
          >
            {task.status}
          </button>
          <span className={`badge badge--priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span
              className={`badge badge--due ${overdue ? 'badge--overdue' : ''}`}
              data-testid={`due-${task.id}`}
            >
              {overdue ? 'Overdue: ' : 'Due: '}
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="task-card__actions">
        <button
          type="button"
          className="task-card__edit"
          onClick={() => onEdit(task)}
          aria-label={`Edit task ${task.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="task-card__delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task ${task.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
