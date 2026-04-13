import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../../components/LoginForm';

describe('LoginForm', () => {
  const defaultProps = {
    onLogin: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null,
  };

  it('renders username and password fields', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls onLogin with credentials on submit', () => {
    render(<LoginForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(defaultProps.onLogin).toHaveBeenCalledWith({
      username: 'demo',
      password: 'Password123!',
    });
  });

  it('disables submit button when loading', () => {
    render(<LoginForm {...defaultProps} loading={true} />);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays error message', () => {
    render(<LoginForm {...defaultProps} error="Invalid username or password" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password');
  });
});
