'use client';

import { useState, createContext, useContext } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
}

interface TabsProps {
  defaultTab?: string;
  tabs: Tab[];
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Tabs({
  defaultTab,
  tabs,
  onChange,
  variant = 'default',
  fullWidth = false,
  children,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  const variantStyles = {
    default: {
      container: 'border-b',
      tab: 'pb-3 border-b-2 -mb-px',
      active: 'border-orange-500 text-orange-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'py-2 px-4 rounded-md',
      active: 'bg-white text-orange-600 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-800',
    },
    underline: {
      container: '',
      tab: 'py-2 border-b-2',
      active: 'border-orange-500 text-orange-600',
      inactive: 'border-transparent text-gray-500 hover:text-orange-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div>
        <div className={`flex ${fullWidth ? '' : 'gap-1'} ${styles.container}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                flex items-center gap-2 font-medium text-sm transition-all
                ${fullWidth ? 'flex-1 justify-center' : 'px-4'}
                ${styles.tab}
                ${activeTab === tab.id ? styles.active : styles.inactive}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </TabsContext.Provider>
  );
}

export function TabPanel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { activeTab } = useTabs();

  if (activeTab !== id) return null;

  return <div>{children}</div>;
}

// Simple tab buttons (no panel management)
export function TabButtons({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
}: {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills';
}) {
  return (
    <div className={`flex gap-2 ${variant === 'pills' ? 'bg-gray-100 p-1 rounded-lg' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-all
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${activeTab === tab.id
              ? variant === 'pills'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'bg-orange-500 text-white'
              : 'text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
