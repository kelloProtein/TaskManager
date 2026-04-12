import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import type { Task } from '../types/task';

const sampleTask: Task = {
  id: 7,
  title: 'Write tests',
  description: 'Cover the card component',
  status: 'InProgress',
  priority: 'High',
  dueDate: null,
  createdAt: '2026-04-11T00:00:00Z',
  updatedAt: '2026-04-11T00:00:00Z',
};

describe('TaskCard', () => {
  it('renders task title, description, status, and priority', () => {
    render(<TaskCard task={sampleTask} onDelete={() => {}} />);

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Cover the card component')).toBeInTheDocument();
    expect(screen.getByText('InProgress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls onDelete with the task id when the delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(<TaskCard task={sampleTask} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith(7);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not render the description paragraph when description is null', () => {
    const task = { ...sampleTask, description: null };
    render(<TaskCard task={task} onDelete={() => {}} />);

    expect(screen.queryByText('Cover the card component')).not.toBeInTheDocument();
  });
});
