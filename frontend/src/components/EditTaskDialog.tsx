import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Task, UpdateTaskInput } from '../types/task';
import { TaskPriorityValue } from '../types/task';

// Modal dialog for editing an existing task.
// Uses the native <dialog> element — accessible and keyboard-friendly out of the box.
interface EditTaskDialogProps {
  task: Task | null;                   // null = closed
  onClose: () => void;
  onSave: (id: number, input: UpdateTaskInput) => void | Promise<void>;
}

// Convert ISO datetime back to the YYYY-MM-DD format <input type="date"> expects
function isoToDateInput(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

const priorityTextToInt = (p: Task['priority']): 0 | 1 | 2 =>
  p === 'Low' ? 0 : p === 'High' ? 2 : 1;

export function EditTaskDialog({ task, onClose, onSave }: EditTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<0 | 1 | 2>(TaskPriorityValue.Medium);
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync form fields when a new task is passed in and open/close the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(priorityTextToInt(task.priority));
      setDueDate(isoToDateInput(task.dueDate));
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [task]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;

    setSubmitting(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="edit-dialog"
      onClose={onClose}
      aria-labelledby="edit-dialog-title"
    >
      <form className="edit-dialog__form" onSubmit={handleSubmit}>
        <h2 id="edit-dialog-title">Edit Task</h2>

        <label className="task-form__field">
          <span>Title *</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </label>

        <label className="task-form__field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
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

        <div className="edit-dialog__actions">
          <button type="button" onClick={onClose} className="edit-dialog__cancel">
            Cancel
          </button>
          <button
            type="submit"
            className="task-form__submit"
            disabled={submitting || !title.trim()}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
