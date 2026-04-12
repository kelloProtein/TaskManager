import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { FilterBar } from './components/FilterBar';
import { EditTaskDialog } from './components/EditTaskDialog';
import type { Task } from './types/task';
import './App.css';

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

  // The task currently being edited (null = dialog closed)
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Ezra Task Manager</h1>
      </header>

      <main className="app__main">
        <TaskForm onSubmit={createTask} />

        <section className="app__tasks">
          <h2>Tasks</h2>
          <FilterBar filters={filters} onChange={setFilters} />
          {error && <p className="app__error" role="alert">{error}</p>}
          {loading ? (
            <p>Loading tasks…</p>
          ) : (
            <TaskList
              tasks={tasks}
              onDelete={deleteTask}
              onEdit={setEditingTask}
              onStatusToggle={updateStatus}
            />
          )}
        </section>
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
