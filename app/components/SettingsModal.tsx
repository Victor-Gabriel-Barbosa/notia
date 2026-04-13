import React, { useState } from 'react';
import { Settings, X, ExternalLink } from 'lucide-react';
import { OpenRouterModel } from '../types/chat';

interface SettingsModalProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onClose: () => void;
  availableModels: OpenRouterModel[];
  isLoadingModels: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  apiKey, setApiKey, selectedModel, setSelectedModel, onClose, availableModels, isLoadingModels
}) => {
  const [selectMode, setSelectMode] = useState<string>(selectedModel);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {value} = e.target;
    setSelectMode(value);
    
    setSelectedModel(value);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-2xl relative transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
          <Settings size={20} />
          Configurações
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              OpenRouter API Key
            </label>
            <input 
              id="api-key-input"
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="sk-or-v1-..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Armazenada apenas no navegador.
              </p>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 transition-colors group"
              >
                Obter API Key 
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
              Modelo OpenRouter
            </label>
            <select
              name={"model-select"}
              value={selectMode}
              onChange={handleSelectChange}
              className="w-full bg-white text-slate-900 border border-slate-300 dark:bg-slate-700/50 dark:text-white dark:border-slate-600/50 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer appearance-none"
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
              <option value="other" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">
                Outro (Inserir manualmente)
              </option>
            </select>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Armazenada apenas no navegador.
              </p>
              <a 
                href="https://openrouter.ai/models" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 transition-colors group"
              >
                Explorar Modelos
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black font-medium rounded-md dark:hover:bg-slate-200 transition-colors"
          >
            Salvar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};