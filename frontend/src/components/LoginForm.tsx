import { useState, type FormEvent } from 'react';

interface LoginFormProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void onLogin({ username, password });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-form__title">Ezra Task Manager</h1>
        <p className="login-form__hint">Demo credentials: demo / Password123!</p>
        {error && <p className="login-form__error" role="alert">{error}</p>}
        <label className="login-form__field">
          Username
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="login-form__field">
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="login-form__submit" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
