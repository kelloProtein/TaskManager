import { useState, type FormEvent } from 'react';
import type { CreateTaskInput } from '../types/task';
import { TaskPriorityValue } from '../types/task';

// Controlled form for creating tasks.
interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => void | Promise<void>;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<0 | 1 | 2>(TaskPriorityValue.Medium);
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        // <input type="date"> returns "YYYY-MM-DD". Convert to ISO datetime (start of day UTC).
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      // Reset form on success
      setTitle('');
      setDescription('');
      setPriority(TaskPriorityValue.Medium);
      setDueDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="task-form__heading">New Task</h2>

      <label className="task-form__field">
        <span>Title *</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          required
        />
      </label>

      <label className="task-form__field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional details"
          maxLength={2000}
          rows={2}
        />
      </label>

      <div className="task-form__row">
        <label className="task-form__field">
          <span>Priority</span>
          <select
            value={priority}
            onChange={e => setPriority(Number(e.target.value) as 0 | 1 | 2)}
          >
            <option value={TaskPriorityValue.Low}>Low</option>
            <option value={TaskPriorityValue.Medium}>Medium</option>
            <option value={TaskPriorityValue.High}>High</option>
          </select>
        </label>

        <label className="task-form__field">
          <span>Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        className="task-form__submit"
        disabled={submitting || !title.trim()}
      >
        {submitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
