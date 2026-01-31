'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'left',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string, disabled?: boolean) => {
    if (disabled) return;
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <Card
          className={`
            absolute z-50 mt-1 min-w-[160px] py-1 shadow-lg
            animate-in fade-in zoom-in-95 duration-100
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              onClick={() => handleSelect(item.value, item.disabled)}
              disabled={item.disabled}
              className={`
                w-full px-4 py-2 text-left text-sm flex items-center gap-2
                transition-colors
                ${item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}

// Menu button preset
export function MenuButton({
  items,
  onSelect,
}: {
  items: DropdownItem[];
  onSelect: (value: string) => void;
}) {
  return (
    <Dropdown
      trigger={
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      }
      items={items}
      onSelect={onSelect}
      align="right"
    />
  );
}

// Sort dropdown preset
export function SortDropdown({
  value,
  onChange,
  options = [
    { label: 'Newest', value: 'new' },
    { label: 'Top', value: 'top' },
    { label: 'Hot', value: 'hot' },
  ],
}: {
  value: string;
  onChange: (value: string) => void;
  options?: DropdownItem[];
}) {
  const currentLabel = options.find(o => o.value === value)?.label || 'Sort';

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          {currentLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
      items={options}
      onSelect={onChange}
    />
  );
}
