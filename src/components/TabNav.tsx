import React from 'react';

interface TabNavProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={[
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              active === tab
                ? 'text-white border-b-2 border-[#E9FF5F]'
                : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent hover:border-gray-500',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
