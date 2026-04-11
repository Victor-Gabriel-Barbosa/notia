import React, { useState } from 'react';
import { Settings, X, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onClose: () => void;
}

const PREDEFINED_MODELS = [
  { id: "openrouter/free", name: "Free Models Router" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Google: Gemma 4 26B A4B (free)" },
  { id: "google/gemma-4-31b-it:free", name: "Google: Gemma 4 31B (free)" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "NVIDIA: Nemotron 3 Super (free)" },
  { id: "z-ai/glm-4.5-air:free", name: "Z.ai: GLM 4.5 Air (free)" },
  { id: "minimax/minimax-m2.5:free", name: "MiniMax: MiniMax M2.5 (free)" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  apiKey, setApiKey, selectedModel, setSelectedModel, onClose
}) => {
  const isPredefined = PREDEFINED_MODELS.some(m => m.id === selectedModel);
  
  const [selectMode, setSelectMode] = useState<string>(isPredefined ? selectedModel : 'other');
  const [manualModel, setManualModel] = useState<string>(isPredefined ? '' : selectedModel);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectMode(value);
    
    setSelectedModel((value !== 'other') ? value : manualModel);
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualModel(value);
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
            <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
            <input 
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
              value={selectMode}
              onChange={handleSelectChange}
              className="w-full bg-[#171717] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none"
            >
              {PREDEFINED_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
              <option value="other">Outro (Inserir manualmente)</option>
            </select>

            {selectMode === 'other' && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input 
                  type="text" 
                  value={manualModel} 
                  onChange={handleManualInputChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: anthropic/claude-3-opus"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Digite o ID exato do modelo conforme a documentação do OpenRouter.
                </p>
              </div>
            )}

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