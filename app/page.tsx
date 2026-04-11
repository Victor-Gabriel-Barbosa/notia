"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Bot, Send, Square } from 'lucide-react';
import { Chat, Message } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("openrouter/free");
  const [chats, setChats] = useState<Chat[]>([{ id: 1, title: 'Novo Chat', messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Efeitos de LocalStorage (mantidos iguais)
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_key');
    if (savedKey) setApiKey(savedKey);

    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) setSelectedModel(savedModel);

    try {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats) as Chat[];
        setChats(parsedChats);
        setCurrentChatId(parsedChats[0]?.id || Date.now());
      } else {
        const initialId = Date.now();
        setChats([{ id: initialId, title: 'Novo Chat', messages: [] }]);
        setCurrentChatId(initialId);
      }
    } catch (e) {
      console.error("Failed to parse chats from local storage", e);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats, isMounted]);
  
  useEffect(() => {
    if (isMounted) localStorage.setItem('openrouter_key', apiKey);
  }, [apiKey, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('selected_model', selectedModel);
  }, [selectedModel, isMounted]);

  if (!isMounted) return <div className="flex h-screen w-full bg-gray-900" />;

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];

  const createNewChat = () => {
    const newChat: Chat = { id: Date.now(), title: 'Novo Chat', messages: [] };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
    setInput('');
  };

  const deleteChat = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    const newChats = chats.filter(c => c.id !== id);
    if (newChats.length === 0) {
      const newChat: Chat = { id: Date.now(), title: 'Novo Chat', messages: [] };
      setChats([newChat]);
      setCurrentChatId(newChat.id);
    } else {
      setChats(newChats);
      if (currentChatId === id) setCurrentChatId(newChats[0].id);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...currentChat.messages, userMessage];
    
    let title = currentChat.title;
    if (currentChat.messages.length === 0) {
      title = input.length > 35 ? input.substring(0, 35) + '...' : input;
    }

    setChats(chats.map(c => c.id === currentChatId ? { ...c, title, messages: updatedMessages } : c));
    setInput('');
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location?.href || '',
          'X-Title': 'NextJS Chatbot',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.choices[0].message.content };

      setChats(prevChats => prevChats.map(c => 
        c.id === currentChatId ? { ...c, messages: [...c.messages, assistantMessage] } : c
      ));
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Geração de resposta cancelada pelo usuário');
        return;
      }

      console.error(error);
      const errorMsg = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `**Erro:**\n\`\`\`\n${errorMsg}\n\`\`\`\n\nPor favor, verifique sua conexão com a internet e a chave da API em Configurações.` 
      };
      
      setChats(prevChats => prevChats.map(c => 
        c.id === currentChatId ? { ...c, messages: [...c.messages, errorMessage] } : c
      ));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (content: string, messageIndex: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageIndex(messageIndex);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => console.error('Copy failed', err));
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        setSettingsOpen={setSettingsOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-900 h-screen">
        <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <Menu size={20} />
          </button>
          <span className="font-medium truncate max-w-50 text-gray-200">{currentChat.title}</span>
          <button onClick={createNewChat} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-6 pb-4 max-w-5xl mx-auto w-full min-h-full flex flex-col justify-top">
            {currentChat.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-20">
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6 shadow-lg shadow-white/5">
                  <Bot size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Como posso te ajudar hoje?</h2>
                <p className="text-gray-400 text-sm">Powered by OpenRouter</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentChat.messages.map((msg, i) => (
                  <ChatMessage 
                    key={i} 
                    msg={msg} 
                    index={i} 
                    copiedMessageIndex={copiedMessageIndex} 
                    handleCopyMessage={handleCopyMessage} 
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-4 w-full justify-start">
                    <div className="w-8 h-8 rounded-full border border-gray-700 bg-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot size={18} className="text-gray-200" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-4">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 bg-gray-900 pt-2 pb-4 px-4 z-10 border-t border-gray-800 md:border-transparent md:bg-linear-to-t md:from-gray-900 md:via-gray-900 md:to-transparent">
          <div className="max-w-3xl mx-auto relative flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-xl focus-within:ring-1 focus-within:ring-sky-500 transition-shadow">
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Mensagem..."
              className="w-full max-h-50 min-h-14 py-4 pl-4 pr-14 bg-transparent text-white resize-none focus:outline-none overflow-y-auto"
              rows={1}
            />
            <button
              onClick={isLoading ? handleStop : handleSend}
              disabled={!isLoading && !input.trim()}
              className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all ${
                isLoading 
                  ? 'bg-sky-600 text-white hover:bg-sky-700' 
                  : input.trim() ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              title={isLoading ? "Parar geração" : "Enviar mensagem"}
            >
              {isLoading ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
            </button>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              Powered by OpenRouter. A IA pode cometer erros. Considere verificar informações importantes.
            </p>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal 
          apiKey={apiKey} 
          setApiKey={setApiKey} 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
          onClose={() => setSettingsOpen(false)} 
        />
      )}
    </div>
  );
}