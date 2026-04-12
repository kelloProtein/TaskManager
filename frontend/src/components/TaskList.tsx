import type { Task } from '../types/task';
import { TaskCard } from './TaskCard';

// Container for rendering multiple task cards.
// Delegates individual rendering to TaskCard — single responsibility.
interface TaskListProps {
  tasks: Task[];
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="task-list__empty" data-testid="task-list-empty">
        No tasks yet. Create one above.
      </p>
    );
  }

  return (
    <ul className="task-list" data-testid="task-list">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onDelete={onDelete} />
      ))}
    </ul>
  );
}
