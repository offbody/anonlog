
import React from 'react';
import { SearchBarProps } from '../types';

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, t }) => {
  return (
    <div className="w-full border-b border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white focus-within:border-black dark:focus-within:border-white transition-colors duration-300 pb-4 flex items-center gap-4">
      <label htmlFor="search" className="text-sm font-bold uppercase tracking-widest whitespace-nowrap text-black dark:text-white">
        {t.search_label}
      </label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.search_placeholder}
        className="w-full bg-transparent font-mono text-sm uppercase tracking-widest placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white focus:outline-none"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="text-xs font-bold uppercase text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400"
        >
          {t.search_clear}
        </button>
      )}
    </div>
  );
};
