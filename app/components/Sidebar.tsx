import React from 'react';
import { MessageSquare, Plus, Trash2, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
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
  setSettingsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen, setSidebarOpen, chats, currentChatId, setCurrentChatId, createNewChat, deleteChat, setSettingsOpen
}) => {
  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-16'} 
        fixed md:relative inset-y-0 left-0 z-40 
        bg-gray-950 flex flex-col transition-all duration-0 ease-in-out
        shrink-0 border-r border-gray-800
      `}>
        <div className={`p-2 md:pt-4 flex flex-col ${!sidebarOpen ? 'items-center' : ''}`}>
          <div className={`flex items-center w-full ${sidebarOpen ? 'justify-between px-2' : 'justify-center'} mb-4`}>
            {sidebarOpen && (
              <Link href="/" className="flex items-center gap-3 text-white">
                <Image src="/favicon/favicon.ico" className="border border-sky-500 rounded-full" alt="Notia" width={32} height={32} />
                <span className="font-semibold">Notia</span>
              </Link>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-900 p-1.5 rounded-lg transition-colors"
              title={sidebarOpen ? "Minimizar" : "Expandir"}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
          </div>

          <button 
            onClick={createNewChat}
            className={`flex items-center ${sidebarOpen ? 'justify-start px-3 w-full py-2.5' : 'justify-center w-10 h-10'} hover:bg-gray-900 text-white rounded-xl transition-colors border border-gray-800`}
            title={!sidebarOpen ? "Novo Chat" : undefined}
          >
            <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center shrink-0">
              <Plus size={16} strokeWidth={2.5} />
            </div>
            {sidebarOpen && <span className="font-medium text-sm ml-3">Novo Chat</span>}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${sidebarOpen ? 'p-3' : 'p-2 flex flex-col items-center'} space-y-1 scrollbar-none`}>
          {sidebarOpen && <p className="px-3 text-xs font-semibold text-gray-500 mb-2 mt-2">Recent</p>}
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`group flex items-center ${sidebarOpen ? 'justify-between px-3 w-full py-2.5' : 'justify-center w-10 h-10 mt-1'} rounded-lg cursor-pointer transition-all ${
                currentChatId === chat.id ? 'bg-gray-800/80 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
              title={!sidebarOpen ? chat.title : undefined}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0 opacity-80" />
                {sidebarOpen && <span className="truncate text-sm font-medium">{chat.title}</span>}
              </div>
              {sidebarOpen && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(e, chat.id);
                  }}
                  className={`shrink-0 text-gray-500 hover:text-red-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                    currentChatId === chat.id ? 'opacity-100' : ''
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={`p-3 border-t border-gray-800/50 flex ${!sidebarOpen ? 'justify-center' : ''}`}>
          <button 
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center ${sidebarOpen ? 'justify-start px-3 w-full py-3' : 'justify-center w-10 h-10'} hover:bg-gray-900 text-gray-400 hover:text-white rounded-lg transition-colors`}
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