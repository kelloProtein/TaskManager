import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('calls onSubmit with the typed values and clears the form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;

    await user.type(titleInput, 'Buy milk');
    await user.type(descInput, 'Whole milk');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'Whole milk',
      priority: 1, // Medium is the default
      dueDate: null,
    });

    // Form resets after successful submit
    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
  });

  it('does not submit when title is empty or whitespace', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    // Submit button is disabled with empty title
    const submit = screen.getByRole('button', { name: /create task/i });
    expect(submit).toBeDisabled();

    // Typing only spaces keeps it disabled
    await user.type(screen.getByLabelText(/title/i), '   ');
    expect(submit).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('passes the selected priority value to onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Urgent');
    await user.selectOptions(screen.getByLabelText(/priority/i), '2');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 2 })
    );
  });

  it('passes the selected due date as an ISO string', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'With deadline');
    // <input type="date"> takes YYYY-MM-DD; user.type works fine for it.
    const dueInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    await user.type(dueInput, '2026-05-01');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.dueDate).toBeTruthy();
    expect(payload.dueDate).toMatch(/2026-05-01/);
  });
});
