import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../../components/TaskCard';
import type { Task } from '../../types/task';

const baseTask: Task = {
  id: 7,
  title: 'Write tests',
  description: 'Cover the card component',
  status: 'InProgress',
  priority: 'High',
  dueDate: null,
  createdAt: '2026-04-11T00:00:00Z',
  updatedAt: '2026-04-11T00:00:00Z',
};

const noop = () => {};

describe('TaskCard', () => {
  it('renders task title, description, status, and priority', () => {
    render(
      <TaskCard task={baseTask} onDelete={noop} onEdit={noop} onStatusToggle={noop} />
    );

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Cover the card component')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls onDelete with the task id when Delete is clicked and confirmed', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <TaskCard task={baseTask} onDelete={onDelete} onEdit={noop} onStatusToggle={noop} />
    );
    await user.click(screen.getByRole('button', { name: /delete task/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('does not call onDelete when Delete is clicked but cancelled', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <TaskCard task={baseTask} onDelete={onDelete} onEdit={noop} onStatusToggle={noop} />
    );
    await user.click(screen.getByRole('button', { name: /delete task/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('calls onEdit with the task when Edit is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskCard task={baseTask} onDelete={noop} onEdit={onEdit} onStatusToggle={noop} />
    );
    await user.click(screen.getByRole('button', { name: /edit task/i }));

    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  it('calls onStatusToggle with the next status when status badge is clicked', async () => {
    const onStatusToggle = vi.fn();
    const user = userEvent.setup();

    // InProgress → Done (status int 2)
    render(
      <TaskCard
        task={baseTask}
        onDelete={noop}
        onEdit={noop}
        onStatusToggle={onStatusToggle}
      />
    );
    await user.click(screen.getByRole('button', { name: /change status from in progress/i }));

    expect(onStatusToggle).toHaveBeenCalledWith(7, 2);
  });

  it('does not render the description paragraph when description is null', () => {
    const task = { ...baseTask, description: null };
    render(
      <TaskCard task={task} onDelete={noop} onEdit={noop} onStatusToggle={noop} />
    );

    expect(screen.queryByText('Cover the card component')).not.toBeInTheDocument();
  });

  // Overdue tests use fake timers for deterministic date comparisons
  describe('due date display', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows "Overdue:" when due date is past and status is not Done', () => {
      const task: Task = { ...baseTask, dueDate: '2026-04-10T00:00:00Z' };
      render(
        <TaskCard task={task} onDelete={noop} onEdit={noop} onStatusToggle={noop} />
      );

      expect(screen.getByTestId('due-7').textContent).toMatch(/Overdue:/);
    });

    it('does not mark a past due date as overdue when status is Done', () => {
      const task: Task = {
        ...baseTask,
        dueDate: '2026-04-10T00:00:00Z',
        status: 'Done',
      };
      render(
        <TaskCard task={task} onDelete={noop} onEdit={noop} onStatusToggle={noop} />
      );

      expect(screen.getByTestId('due-7').textContent).toMatch(/^Due:/);
    });

    it('shows "Due:" for a future date', () => {
      const task: Task = { ...baseTask, dueDate: '2026-04-20T00:00:00Z' };
      render(
        <TaskCard task={task} onDelete={noop} onEdit={noop} onStatusToggle={noop} />
      );

      expect(screen.getByTestId('due-7').textContent).toMatch(/^Due:/);
    });
  });
});
