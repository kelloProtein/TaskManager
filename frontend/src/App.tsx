import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import './App.css';

function App() {
  const { tasks, loading, error, createTask, deleteTask } = useTasks();

  return (
    <div className="app">
      <header className="app__header">
        <h1>Ezra Task Manager</h1>
      </header>

      <main className="app__main">
        <TaskForm onSubmit={createTask} />

        <section className="app__tasks">
          <h2>Tasks</h2>
          {error && <p className="app__error" role="alert">{error}</p>}
          {loading ? (
            <p>Loading tasks…</p>
          ) : (
            <TaskList tasks={tasks} onDelete={deleteTask} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
