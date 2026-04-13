import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditTaskDialog } from '../../components/EditTaskDialog';
import type { Task } from '../../types/task';

// HTMLDialogElement.showModal() / .close() are not implemented in jsdom,
// so we stub them to prevent errors and let the component render normally.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const sampleTask: Task = {
  id: 42,
  title: 'Fix login bug',
  description: 'Users cannot log in with SSO',
  status: 'InProgress',
  priority: 'High',
  dueDate: '2026-06-01T00:00:00.000Z',
  createdAt: '2026-04-01T10:00:00.000Z',
  updatedAt: '2026-04-10T14:30:00.000Z',
};

describe('EditTaskDialog', () => {
  it('populates form fields from the task prop', () => {
    render(
      <EditTaskDialog task={sampleTask} onClose={vi.fn()} onSave={vi.fn()} />
    );

    expect(screen.getByDisplayValue('Fix login bug')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Users cannot log in with SSO')
    ).toBeInTheDocument();
    // Priority "High" = value 2
    expect(screen.getByDisplayValue('High')).toBeInTheDocument();
    // Due date converted to YYYY-MM-DD
    expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument();
  });

  it('calls onSave with the edited values on submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditTaskDialog task={sampleTask} onClose={onClose} onSave={onSave} />
    );

    const titleInput = screen.getByDisplayValue('Fix login bug');
    await user.clear(titleInput);
    await user.type(titleInput, 'Fix SSO login');

    // Dialog content is hidden in jsdom (showModal is stubbed), so use hidden: true
    await user.click(
      screen.getByRole('button', { name: /save changes/i, hidden: true })
    );

    expect(onSave).toHaveBeenCalledWith(42, {
      title: 'Fix SSO login',
      description: 'Users cannot log in with SSO',
      priority: 2,
      status: 1, // InProgress
      dueDate: expect.stringContaining('2026-06-01'),
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditTaskDialog task={sampleTask} onClose={onClose} onSave={vi.fn()} />
    );

    await user.click(
      screen.getByRole('button', { name: /cancel/i, hidden: true })
    );

    expect(onClose).toHaveBeenCalled();
  });

  it('saves the newly selected status when the dropdown is changed', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <EditTaskDialog task={sampleTask} onClose={vi.fn()} onSave={onSave} />
    );

    // sampleTask starts as InProgress (1); change to Done (2)
    await user.selectOptions(
      screen.getByRole('combobox', { name: /status/i, hidden: true }),
      '2'
    );

    await user.click(
      screen.getByRole('button', { name: /save changes/i, hidden: true })
    );

    expect(onSave).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ status: 2 })
    );
  });

  it('does not call showModal when task is null', () => {
    render(
      <EditTaskDialog task={null} onClose={vi.fn()} onSave={vi.fn()} />
    );

    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });
});
