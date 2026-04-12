import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('calls onChange immediately when status changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<FilterBar filters={{}} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/status/i), '1');

    expect(onChange).toHaveBeenCalledWith({ status: 1 });
  });

  it('calls onChange immediately when priority changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<FilterBar filters={{}} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/priority/i), '2');

    expect(onChange).toHaveBeenCalledWith({ priority: 2 });
  });

  it('resets status to undefined when "All" is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<FilterBar filters={{ status: 1 }} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/status/i), '');

    expect(onChange).toHaveBeenCalledWith({ status: undefined });
  });

  it('debounces search input before calling onChange', async () => {
    // Use real timers here — easier than faking them across userEvent
    vi.useRealTimers();
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<FilterBar filters={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText(/search/i), 'bug');

    // Not called yet — still within the debounce window
    expect(onChange).not.toHaveBeenCalled();

    // Wait for the debounce to elapse
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(onChange).toHaveBeenCalledWith({ search: 'bug' });
  });
});
