import { useEffect, useState } from 'react';
import type { TaskFilters } from '../types/task';
import { TaskPriorityValue, TodoStatusValue } from '../types/task';

// Presentational component that owns the filter input state locally
// and debounces the search input so we don't hit the API on every keystroke.
interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

const ALL = '' as const;

export function FilterBar({ filters, onChange }: FilterBarProps) {
  // Local state for search — debounced before propagating to the parent
  const [searchText, setSearchText] = useState(filters.search ?? '');

  // Debounce: wait 300ms after the user stops typing, then propagate.
  // This is React's equivalent of a Java Timer/Debouncer pattern.
  useEffect(() => {
    const trimmed = searchText.trim();
    const current = filters.search ?? '';
    if (trimmed === current) return;

    const handle = setTimeout(() => {
      onChange({ ...filters, search: trimmed || undefined });
    }, 300);
    return () => clearTimeout(handle);
    // We only want this effect to run when searchText changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleStatusChange = (value: string) => {
    onChange({
      ...filters,
      status: value === ALL ? undefined : (Number(value) as 0 | 1 | 2),
    });
  };

  const handlePriorityChange = (value: string) => {
    onChange({
      ...filters,
      priority: value === ALL ? undefined : (Number(value) as 0 | 1 | 2),
    });
  };

  return (
    <div className="filter-bar">
      <label className="filter-bar__field">
        <span>Search</span>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search title or description..."
        />
      </label>

      <label className="filter-bar__field">
        <span>Status</span>
        <select
          value={filters.status ?? ALL}
          onChange={e => handleStatusChange(e.target.value)}
        >
          <option value={ALL}>All</option>
          <option value={TodoStatusValue.Todo}>Todo</option>
          <option value={TodoStatusValue.InProgress}>InProgress</option>
          <option value={TodoStatusValue.Done}>Done</option>
        </select>
      </label>

      <label className="filter-bar__field">
        <span>Priority</span>
        <select
          value={filters.priority ?? ALL}
          onChange={e => handlePriorityChange(e.target.value)}
        >
          <option value={ALL}>All</option>
          <option value={TaskPriorityValue.Low}>Low</option>
          <option value={TaskPriorityValue.Medium}>Medium</option>
          <option value={TaskPriorityValue.High}>High</option>
        </select>
      </label>
    </div>
  );
}
