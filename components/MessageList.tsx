
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MessageListProps, Message } from '../types';
import { MessageItem } from './MessageItem';

type SortOrder = 'newest' | 'oldest' | 'best';

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, onReply, onTagClick, onFlashMessage, onDeleteMessage, onBlockUser, onVote, highlightedMessageId, allMessagesRaw, isAdmin, t, locale }) => {
  // Default sort order changed to 'best'
  const [sortOrder, setSortOrder] = useState<SortOrder>('best');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  
  // Refs to track if user is currently near the edge of the screen
  const isNearBottomRef = useRef(false);
  const isNearTopRef = useRef(true);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // User is near bottom if distance to bottom is less than 200px
      isNearBottomRef.current = (scrollTop + windowHeight) >= (fullHeight - 200);
      
      // User is near top if scrollTop is less than 200px
      isNearTopRef.current = scrollTop < 200;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
            setIsSortDropdownOpen(false);
        }
    };
    if (isSortDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  useEffect(() => {
    if (sortOrder === 'oldest' && isNearBottomRef.current && bottomRef.current) {
         bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sortOrder]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];

    return result.sort((a, b) => {
        if (sortOrder === 'newest') {
            return b.timestamp - a.timestamp;
        } else if (sortOrder === 'oldest') {
            return a.timestamp - b.timestamp;
        } else {
            // BEST (Sort by score)
            const getScore = (msg: Message) => {
                const votes = msg.votes || {};
                return (Object.values(votes) as number[]).reduce((acc, curr) => acc + curr, 0);
            };
            
            const scoreA = getScore(a);
            const scoreB = getScore(b);
            
            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Higher score first
            }
            // If scores equal, newest first
            return b.timestamp - a.timestamp;
        }
    });
  }, [messages, sortOrder]);

  const getParentInfo = (parentId?: string | null) => {
      if (!parentId || !allMessagesRaw) return { seq: undefined, senderId: undefined };
      const parent = allMessagesRaw.find(m => m.id === parentId);
      return { 
          seq: parent ? parent.sequenceNumber : undefined,
          senderId: parent ? parent.senderId : undefined
      };
  };

  const getSortLabel = (order: SortOrder) => {
      switch(order) {
          case 'newest': return t.sort_newest;
          case 'oldest': return t.sort_oldest;
          case 'best': return t.sort_best;
      }
  };

  return (
    <div className="w-full">
      {/* Header: Sort Dropdown Only (Left Aligned) */}
      <div className="mb-8 flex items-center justify-start border-b border-[#1D2025]/10 dark:border-white/10 pb-4">
         
         <div className="relative" ref={sortRef}>
             <button 
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 h-10 px-4 border border-[#1D2025]/10 dark:border-white/10 hover:border-[#1D2025] dark:hover:border-white transition-colors bg-transparent text-black dark:text-white"
             >
                 <span className="text-xs font-bold uppercase tracking-widest">{getSortLabel(sortOrder)}</span>
                 <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
             </button>

             {isSortDropdownOpen && (
                 <div className="absolute top-full left-0 mt-2 w-48 bg-[#FAF9F6] dark:bg-[#1D2025] border border-black/10 dark:border-white/10 shadow-xl z-50 animate-fade-in flex flex-col py-1">
                     <button 
                        onClick={() => { setSortOrder('best'); setIsSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase transition-colors text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 ${
                            sortOrder === 'best' 
                            ? 'bg-black/5 dark:bg-white/10' 
                            : ''
                        }`}
                     >
                         {t.sort_best}
                     </button>
                     <button 
                        onClick={() => { setSortOrder('newest'); setIsSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase transition-colors text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 ${
                            sortOrder === 'newest' 
                            ? 'bg-black/5 dark:bg-white/10' 
                            : ''
                        }`}
                     >
                         {t.sort_newest}
                     </button>
                     <button 
                        onClick={() => { setSortOrder('oldest'); setIsSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase transition-colors text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 ${
                            sortOrder === 'oldest' 
                            ? 'bg-black/5 dark:bg-white/10' 
                            : ''
                        }`}
                     >
                         {t.sort_oldest}
                     </button>
                 </div>
             )}
         </div>

      </div>
      
      {filteredMessages.length === 0 ? (
        <div className="w-full flex justify-center py-24 opacity-30">
            <p className="uppercase tracking-widest text-sm font-bold border-b border-[#1D2025] dark:border-white pb-1 text-black dark:text-white">
                {t.no_entries}
            </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
            {/* Anchor for Newest/Best Sort */}
            <div ref={topRef} />
            
            {filteredMessages.map((msg) => {
                const { seq, senderId } = getParentInfo(msg.parentId);
                return (
                    <MessageItem 
                        key={msg.id} 
                        message={msg} 
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onTagClick={onTagClick}
                        onFlashMessage={onFlashMessage}
                        onDeleteMessage={onDeleteMessage}
                        onBlockUser={onBlockUser}
                        onVote={onVote}
                        parentSequenceNumber={seq}
                        parentSenderId={senderId}
                        allMessages={allMessagesRaw || messages}
                        isFlashHighlighted={highlightedMessageId === msg.id}
                        isAdmin={isAdmin}
                        t={t}
                        locale={locale}
                    />
                );
            })}
            
            {/* Anchor for Oldest Sort */}
            <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
