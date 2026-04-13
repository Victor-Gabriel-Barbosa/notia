"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Bot, BotMessageSquare, Send, Square, Lightbulb, LightbulbOff, Menu } from 'lucide-react';
import { Chat, Message, OpenRouterModel } from './types/chat';
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
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(true);
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>('system');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_key');
    if (savedKey) setApiKey(savedKey);

    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) setSelectedModel(savedModel);

    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) setTheme(savedTheme);

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

  // Lógica de alteração do tema
  useEffect(() => {
    if (!isMounted) return;
    
    localStorage.setItem('app_theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, isMounted]);

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

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        if (!response.ok) throw new Error('Erro ao buscar modelos');
        
        const data = await response.json();
        
        const models = data.data.map((m: OpenRouterModel) => ({
          id: m.id,
          name: m.name
        }));

        models.sort((a: {name: string}, b: {name: string}) => a.name.localeCompare(b.name));
        
        setAvailableModels(models);
      } catch (error) {
        console.error("Falha ao carregar modelos da OpenRouter:", error);
        setAvailableModels([
          { id: "openrouter/free", name: "OpenRouter Free (Fallback)" },
          { id: "google/gemini-pro", name: "Gemini Pro (Fallback)" }
        ]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  if (!isMounted) return <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900" />;

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

  const renameChat = (id: number, newTitle: string) => {
    setChats(chats.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...currentChat.messages, userMessage];

    let { title } = currentChat;
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
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ...(reasoningEnabled && { reasoning: { type: "enabled" } })
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const messageData = data.choices[0].message;
      const assistantMessage: Message = {
        role: 'assistant',
        content: messageData.content,
        reasoning: messageData.reasoning || undefined
      };

      setChats(prevChats => prevChats.map(c =>
        c.id === currentChatId ? { ...c, messages: [...c.messages, assistantMessage] } : c
      ));
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
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
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        renameChat={renameChat}
        setSettingsOpen={setSettingsOpen}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 h-screen transition-colors duration-200">
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 transition-colors duration-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-medium truncate max-w-50 text-slate-800 dark:text-slate-200">{currentChat.title}</span>
          <button onClick={createNewChat} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-6 pb-4 max-w-5xl mx-auto w-full min-h-full flex flex-col justify-top">
            {currentChat.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-20">
                <div className="w-16 h-16 bg-slate-900 text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/5 dark:shadow-white/5 transition-colors duration-200">
                  <Bot size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 transition-colors">Como posso te ajudar hoje?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Powered by OpenRouter</p>
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
                    <div className="w-8 h-8 rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-black flex items-center justify-center shrink-0 mt-1 shadow-sm transition-colors duration-200">
                      <BotMessageSquare size={18} className="text-slate-700 dark:text-slate-200" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-4">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 bg-white dark:bg-slate-900 pb-4 px-4 z-10 md:bg-linear-to-t md:from-white md:via-white dark:md:from-slate-900 dark:md:via-slate-900 md:to-transparent transition-colors duration-200">
          <div className="max-w-3xl mx-auto relative flex flex-col bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl focus-within:ring-1 focus-within:ring-sky-500 transition-all duration-200">
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
              className="w-full max-h-50 min-h-14 py-4 pl-4 pr-4 bg-transparent text-slate-900 dark:text-white resize-none focus:outline-none overflow-y-auto placeholder:text-slate-500 dark:placeholder:text-slate-400"
              rows={1}
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-2 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReasoningEnabled(!reasoningEnabled)}
                  title={reasoningEnabled ? "Desabilitar reasoning" : "Habilitar reasoning"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${reasoningEnabled
                      ? 'bg-sky-100 text-sky-600 border border-sky-300 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30 dark:border-sky-500/50'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-600/50 dark:border-slate-600/50'
                    }`}
                >
                  {reasoningEnabled ? <Lightbulb size={14} /> : <LightbulbOff size={14} />}
                  <span>Reasoning</span>
                </button>

                <select
                  name={"model-select"}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 dark:bg-slate-700/50 dark:text-white dark:border-slate-600/50 text-xs font-medium rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all cursor-pointer appearance-none"
                  title="Selecionar modelo"
                >
                  {isLoadingModels ? (
                    <option value="loading">Carregando modelos...</option>
                  ) : (
                    availableModels.map((model) => (
                      <option 
                        key={model.id} 
                        value={model.id}
                        className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200" 
                      >
                        {model.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={isLoading ? handleStop : handleSend}
                disabled={!isLoading && !input.trim()}
                className={`p-2 rounded-xl transition-all ${isLoading
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : input.trim() 
                      ? 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600' 
                      : 'bg-slate-300 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                  }`}
                title={isLoading ? "Parar geração" : "Enviar mensagem"}
              >
                {isLoading ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              O Notia é uma IA e pode cometer erros.
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
          availableModels={availableModels}
          isLoadingModels={isLoadingModels}
        />
      )}
    </div>
  );
}