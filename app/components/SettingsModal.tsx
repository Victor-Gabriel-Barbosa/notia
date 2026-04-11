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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          <Settings size={20} />
          Configurações
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
            <input 
              id="api-key-input"
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="sk-or-v1-..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Armazenada apenas no navegador.
              </p>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group"
              >
                Obter API Key 
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Modelo OpenRouter</label>
            <select
              name={"model-select"}
              value={selectMode}
              onChange={handleSelectChange}
              className="w-full bg-[#171717] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none"
            >
              {isLoadingModels ? (
                <option value="loading">Carregando modelos...</option>
              ) : (
                availableModels.map((model) => (
                  <option 
                    key={model.id} 
                    value={model.id}
                    className="bg-gray-800 text-gray-200" 
                  >
                    {model.name}
                  </option>
                ))
              )}
              <option value="other">Outro (Inserir manualmente)</option>
            </select>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Armazenada apenas no navegador.
              </p>
              <a 
                href="https://openrouter.ai/models" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group"
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
            className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Salvar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};