import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, EllipsisVertical, Settings, PanelLeftClose, PanelLeft, Pencil, Trash2, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { Chat } from '../types/chat';
import Image from 'next/image';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chats: Chat[];
  currentChatId: number;
  setCurrentChatId: (id: number) => void;
  createNewChat: () => void;
  deleteChat: (e: React.MouseEvent<HTMLButtonElement>, id: number) => void;
  renameChat: (id: number, newTitle: string) => void;
  setSettingsOpen: (open: boolean) => void;
  theme?: string;
  setTheme?: (theme: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen, setSidebarOpen, chats, currentChatId, setCurrentChatId, createNewChat, deleteChat, renameChat, setSettingsOpen, theme = 'system', setTheme = () => {}
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-trigger]')) setOpenMenuId(null);
      if (!target.closest('[data-theme-trigger]')) setThemeMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingChatId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  const handleSaveRename = (chatId: number) => {
    if (editingName.trim()) renameChat(chatId, editingName.trim());
    setEditingChatId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: number) => {
    if (e.key === 'Enter') handleSaveRename(chatId);
    else if (e.key === 'Escape') handleCancelRename();
  };

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-16'} 
        fixed md:relative inset-y-0 left-0 z-40 
        bg-slate-100 dark:bg-slate-950 flex flex-col transition-all duration-75 ease-in-out
        shrink-0 border-r border-slate-200 dark:border-slate-800
      `}>
        <div className={`p-2 md:pt-4 flex flex-col ${!sidebarOpen ? 'items-center' : ''}`}>
          <div className={`flex items-center w-full ${sidebarOpen ? 'justify-between px-2' : 'justify-center'} mb-4`}>
            {sidebarOpen && (
              <Link href="/" className="flex items-center gap-3 text-slate-900 dark:text-white transition-colors">
                <Image src="/favicon/favicon.ico" className="border border-sky-500 rounded-full" alt="Notia" width={32} height={32} />
                <span className="font-semibold">Notia</span>
              </Link>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 p-1.5 rounded-lg transition-colors"
              title={sidebarOpen ? "Minimizar" : "Expandir"}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
          </div>

          <button 
            onClick={createNewChat}
            className={`flex items-center ${sidebarOpen ? 'justify-start px-3 w-full py-2.5' : 'justify-center w-10 h-10'} bg-transparent hover:bg-slate-200 text-slate-900 border border-slate-200 dark:hover:bg-slate-900 dark:text-white dark:border-slate-800 rounded-xl transition-colors`}
            title={!sidebarOpen ? "Novo Chat" : undefined}
          >
            <div className="w-6 h-6 bg-slate-900 text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center shrink-0 transition-colors">
              <Plus size={16} strokeWidth={2.5} />
            </div>
            {sidebarOpen && <span className="font-medium text-sm ml-3">Novo Chat</span>}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${sidebarOpen ? 'p-3' : 'p-2 flex flex-col items-center'} space-y-1 scrollbar-none`}>
          {sidebarOpen && <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-500 mb-2 mt-2">Recentes</p>}
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => {
                if (editingChatId === null) {
                  setCurrentChatId(chat.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                }
              }}
              className={`group flex items-center ${sidebarOpen ? 'justify-between px-3 w-full py-2.5' : 'justify-center w-10 h-10 mt-1'} rounded-lg cursor-pointer transition-all ${
                currentChatId === chat.id 
                  ? 'bg-slate-300/60 text-slate-900 dark:bg-slate-800/80 dark:text-white' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
              }`}
              title={!sidebarOpen ? chat.title : undefined}
            >
              <div className={`flex items-center ${sidebarOpen ? 'gap-3 overflow-hidden flex-1' : ''}`}>
                <MessageSquare size={16} className="shrink-0 opacity-80" />
                {sidebarOpen && (
                  editingChatId === chat.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, chat.id)}
                      onBlur={() => handleSaveRename(chat.id)}
                      className="truncate text-sm font-medium bg-white text-slate-900 border border-slate-300 dark:border-transparent dark:bg-slate-800 dark:text-white px-2 py-1 rounded outline-none flex-1 focus:ring-1 focus:ring-sky-500"
                    />
                  ) : (
                    <span className="truncate text-sm font-medium">{chat.title}</span>
                  )
                )}
              </div>
              {sidebarOpen && editingChatId === null && (
                <div className="relative" data-menu-trigger>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                    className={`shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-md opacity-0 max-sm:opacity-100 group-hover:opacity-100 transition-opacity ${
                      currentChatId === chat.id ? 'opacity-100' : ''
                    }`}
                  >
                    <EllipsisVertical size={14} />
                  </button>
                  {openMenuId === chat.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-lg z-50 min-w-32 transition-colors">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat.id);
                          setEditingName(chat.title);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-t-lg transition-colors"
                      >
                        <Pencil size={14} />
                        Renomear
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(e, chat.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-slate-800 rounded-b-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`p-2 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-1 ${sidebarOpen ? '' : 'items-center'} transition-colors`}>
          <div className="relative w-full" data-theme-trigger>
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className={`flex items-center ${sidebarOpen ? 'justify-start px-3 w-full py-3' : 'justify-center w-10 h-10 mx-auto'} hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors`}
              title={!sidebarOpen ? "Tema" : undefined}
            >
              {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
              {sidebarOpen && <span className="text-sm font-medium ml-3 flex-1 text-left">Tema</span>}
            </button>

            {themeMenuOpen && (
              <div className={`absolute bottom-full mb-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-1 flex flex-col gap-0.5 transition-colors ${sidebarOpen ? 'left-0 w-full' : 'left-full ml-2 w-36'}`}>
                <button
                  onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Sun size={14} /> Claro
                </button>
                <button
                  onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Moon size={14} /> Escuro
                </button>
                <button
                  onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${theme === 'system' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Monitor size={14} /> Sistema
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center ${sidebarOpen ? 'justify-start px-3 w-full py-3' : 'justify-center w-10 h-10'} hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors`}
            title={!sidebarOpen ? "Configurações" : undefined}
          >
            <Settings size={18} />
            {sidebarOpen && <span className="text-sm font-medium ml-3">Configurações</span>}
          </button>
        </div>
      </div>
    </>
  );
};