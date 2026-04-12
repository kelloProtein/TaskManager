import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { FilterBar } from './components/FilterBar';
import { EditTaskDialog } from './components/EditTaskDialog';
import type { Task } from './types/task';
import './App.css';

interface KanbanColumnProps {
  title: string;
  accent: string;
  tasks: Task[];
  loading: boolean;
  emptyText: string;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onStatusToggle: (id: number, newStatus: 0 | 1 | 2) => void;
}

function KanbanColumn({
  title,
  accent,
  tasks,
  loading,
  emptyText,
  onDelete,
  onEdit,
  onStatusToggle,
}: KanbanColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column__header" style={{ borderTopColor: accent }}>
        <span className="kanban-column__title">{title}</span>
        <span className="kanban-column__count">{tasks.length}</span>
      </div>
      <ul className="task-list">
        {loading ? (
          <p className="task-list__empty">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="task-list__empty">{emptyText}</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onEdit={onEdit}
              onStatusToggle={onStatusToggle}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function App() {
  const {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todoTasks = tasks.filter(t => t.status === 'Todo');
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <h1 className="app__title">Ezra Task Manager</h1>
          <FilterBar filters={filters} onChange={setFilters} showStatus={false} />
        </div>
      </header>

      {error && <p className="app__error" role="alert">{error}</p>}

      <main className="app__board">
        {/* Column 1 — New Task form */}
        <div className="kanban-column kanban-column--form">
          <div className="kanban-column__header" style={{ borderTopColor: '#6366f1' }}>
            <span className="kanban-column__title">New Task</span>
          </div>
          <TaskForm onSubmit={createTask} />
        </div>

        {/* Column 2 — Todo */}
        <KanbanColumn
          title="Todo"
          accent="#94a3b8"
          tasks={todoTasks}
          loading={loading}
          emptyText="No todo tasks"
          onDelete={deleteTask}
          onEdit={setEditingTask}
          onStatusToggle={updateStatus}
        />

        {/* Column 3 — In Progress */}
        <KanbanColumn
          title="In Progress"
          accent="#3b82f6"
          tasks={inProgressTasks}
          loading={loading}
          emptyText="No tasks in progress"
          onDelete={deleteTask}
          onEdit={setEditingTask}
          onStatusToggle={updateStatus}
        />

        {/* Column 4 — Done */}
        <KanbanColumn
          title="Done"
          accent="#22c55e"
          tasks={doneTasks}
          loading={loading}
          emptyText="No completed tasks"
          onDelete={deleteTask}
          onEdit={setEditingTask}
          onStatusToggle={updateStatus}
        />
      </main>

      <EditTaskDialog
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
      />
    </div>
  );
}

export default App;
