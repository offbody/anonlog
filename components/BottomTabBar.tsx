
import React from 'react';
import { Translations } from '../types';

interface BottomTabBarProps {
  isVisible: boolean;
  onCreateClick: () => void;
  onSearchClick: () => void;
  t: Translations;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ isVisible, onCreateClick, onSearchClick, t }) => {
  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-40 bg-r-light/95 dark:bg-r-dark/95 backdrop-blur-md border-t border-black/10 dark:border-white/10 transition-transform duration-300 ease-in-out md:hidden pb-safe ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* Search */}
        <button 
          onClick={onSearchClick}
          title={t.search_label}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full text-black dark:text-white hover:opacity-70 transition-opacity"
        >
           <span className="material-symbols-outlined text-[24px]">search</span>
           <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">ПОИСК</span>
        </button>

        {/* Notifications */}
        <button 
          title={t.my_dialogs_tab}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full text-black dark:text-white hover:opacity-70 transition-opacity"
        >
           <span className="material-symbols-outlined text-[24px]">notifications</span>
           <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">УВЕД.</span>
        </button>

        {/* Create */}
        <button 
          onClick={onCreateClick}
          title={t.action_create}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full text-black dark:text-white hover:opacity-70 transition-opacity"
        >
           <span className="material-symbols-outlined text-[24px]">add_circle</span>
           <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">СОЗДАТЬ</span>
        </button>

        {/* Feed */}
        <button 
          title={t.all_messages_tab}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full text-black dark:text-white hover:opacity-70 transition-opacity"
        >
           <span className="material-symbols-outlined text-[24px]">chat</span>
           <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">ЛЕНТА</span>
        </button>
      </div>
    </div>
  );
};
