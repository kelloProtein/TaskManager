import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import type { Task } from '../types/task';

const makeTask = (id: number, title: string): Task => ({
  id,
  title,
  description: null,
  status: 'Todo',
  priority: 'Medium',
  dueDate: null,
  createdAt: '2026-04-11T00:00:00Z',
  updatedAt: '2026-04-11T00:00:00Z',
});

describe('TaskList', () => {
  it('renders an empty-state message when there are no tasks', () => {
    render(<TaskList tasks={[]} onDelete={() => {}} />);

    expect(screen.getByTestId('task-list-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('task-list')).not.toBeInTheDocument();
  });

  it('renders one TaskCard per task in the array', () => {
    const tasks = [makeTask(1, 'First'), makeTask(2, 'Second'), makeTask(3, 'Third')];

    render(<TaskList tasks={tasks} onDelete={() => {}} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3);
  });
});
