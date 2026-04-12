import type { Task } from '../types/task';

// Presentational component — no state, just props in, JSX out.
// Renders one task + a delete button.
interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  return (
    <li className="task-card" data-testid={`task-${task.id}`}>
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
        <div className="task-card__meta">
          <span className={`badge badge--status-${task.status.toLowerCase()}`}>
            {task.status}
          </span>
          <span className={`badge badge--priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="task-card__delete"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task ${task.title}`}
      >
        Delete
      </button>
    </li>
  );
}
