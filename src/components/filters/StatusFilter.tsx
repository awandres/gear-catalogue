'use client';

import { GearStatus } from '@/lib/types';

interface StatusFilterProps {
  selected: GearStatus[];
  onChange: (statuses: GearStatus[]) => void;
}

const statusOptions: Array<{ value: GearStatus; label: string; color: string }> = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'in-use', label: 'In Use', color: 'bg-orange-100 text-orange-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-blue-100 text-blue-800' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' },
  { value: 'broken', label: 'Broken', color: 'bg-red-100 text-red-800' },
];

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const handleToggle = (status: GearStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter(s => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Status</h3>
      <div className="space-y-2">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm px-2 py-0.5 rounded-full ${option.color}`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
