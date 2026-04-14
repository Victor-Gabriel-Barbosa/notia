import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy, Lightbulb, ChevronDown, Pencil } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { Message } from '../types/chat';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  msg: Message;
  index: number;
  copiedMessageIndex: number | null;
  handleCopyMessage: (content: string, index: number) => void;
  handleSubmitEdit?: (newContent: string, index: number) => void;
}

const preprocessLaTeX = (content: string) => {
  if (!content) return '';
  return content
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');
};

const reasoningComponents: Components = {
  pre: ({ children }) => <div className="w-full overflow-x-auto">{children}</div>,
  code(props) {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <CodeBlock
        language={match[1]}
        code={String(children).replace(/\n$/, '')}
      />
    ) : (
      <code className="bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-100 px-1.5 py-0.5 rounded text-xs font-mono wrap-break-word transition-colors" {...rest}>
        {children}
      </code>
    );
  },
  strong: ({ children }) => <strong className="font-semibold text-sky-950 dark:text-sky-100 transition-colors">{children}</strong>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:underline break-all transition-colors">{children}</a>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
};

const messageComponents: Components = {
  pre: ({ children }) => <div className="w-full overflow-x-auto">{children}</div>,
  code(props) {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <CodeBlock
        language={match[1]}
        code={String(children).replace(/\n$/, '')}
      />
    ) : (
      <code className="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono wrap-break-word transition-colors" {...rest}>
        {children}
      </code>
    );
  },
  h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 ml-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 ml-2">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white transition-colors">{children}</strong>,
  hr: () => <hr className="border-slate-300 dark:border-slate-700 my-4 transition-colors" />,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400 break-all transition-colors">{children}</a>,
  p: ({ children }) => <p className="mb-2 last:mb-0 max-w-full">{children}</p>
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, index, copiedMessageIndex, handleCopyMessage, handleSubmitEdit }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      el.style.overflow = 'hidden';
      el.focus();
    }
  }, [isEditing, editValue]);

  const onSaveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== msg.content && handleSubmitEdit) handleSubmitEdit(trimmedValue, index);
    setIsEditing(false);
  };

  const onCancelEdit = () => {
    setEditValue(msg.content);
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}>
      <div className={`group relative max-w-full sm:max-w-[80%] rounded-3xl px-4 py-2.5 transition-colors ${msg.role === 'user'
          ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          : 'text-slate-900 dark:text-slate-100 bg-transparent px-0'
        }`}>
        {msg.reasoning && (
          <div className="mb-3 pb-3 border-b border-slate-300 dark:border-slate-700 transition-colors">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
            >
              <Lightbulb size={14} />
              Mostrar raciocínio
              <ChevronDown size={14} className={`transition-transform ${showReasoning ? 'rotate-180' : ''}`} />
            </button>
            {showReasoning && (
              <div className="mt-2 p-3 bg-sky-50 border border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-900/50 rounded-lg text-xs dark:text-sky-100/90 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200 transition-colors">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={reasoningComponents} // <-- Usando a referência estável aqui
                >
                  {preprocessLaTeX(msg.reasoning)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="whitespace-pre-wrap wrap-break-word leading-relaxed space-y-2 w-full max-w-full">
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full min-w-62.5 sm:min-w-100">
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 resize-none rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 border border-slate-300 dark:border-slate-600 text-sm"
                rows={1}
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSaveEdit}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors ${editValue.trim() === '' || editValue.trim() === msg.content
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                    }`}
                >
                  Atualizar
                </button>
              </div>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={messageComponents} // <-- Usando a referência estável aqui
            >
              {preprocessLaTeX(msg.content)}
            </ReactMarkdown>
          )}
        </div>

        {!isEditing && (
          <div className={`absolute flex items-center gap-1 ${msg.role === 'user' ? 'opacity-0 max-md:opacity-100 group-hover:opacity-100' : ''} left-0 -bottom-7 transition-all`}>
            <button
              onClick={() => handleCopyMessage(msg.content, index)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Copiar mensagem"
            >
              {copiedMessageIndex === index ? <Check size={16} /> : <Copy size={16} />}
            </button>

            {msg.role === 'user' && handleSubmitEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Editar mensagem"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};