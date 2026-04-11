import React, { useState } from 'react';
import { Check, Copy, Lightbulb, ChevronDown } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  msg: Message;
  index: number;
  copiedMessageIndex: number | null;
  handleCopyMessage: (content: string, index: number) => void;
}

const preprocessLaTeX = (content: string) => {
  if (!content) return '';
  return content
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, index, copiedMessageIndex, handleCopyMessage }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  return (
    <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      
      <div className={`group relative max-w-[90%] sm:max-w-[80%] rounded-3xl px-5 py-3.5 ${
        msg.role === 'user' 
          ? 'bg-gray-700 text-white' 
          : 'text-gray-100 bg-transparent px-0'
      }`}>
        
        {msg.reasoning && (
          <div className="mb-3 pb-3 border-b border-gray-700">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Lightbulb size={14} />
              Mostrar raciocínio
              <ChevronDown size={14} className={`transition-transform ${showReasoning ? 'rotate-180' : ''}`} />
            </button>
            {showReasoning && (
              <div className="mt-2 p-3 bg-sky-950/30 border border-sky-900/50 rounded-lg text-xs text-sky-100/90 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre: ({children}) => <div className="w-full overflow-x-auto">{children}</div>,
                    code(props) {
                      const {children, className, ...rest} = props;
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <CodeBlock 
                          language={match[1]} 
                          code={String(children).replace(/\n$/, '')} 
                        />
                      ) : (
                        <code className="bg-sky-900/50 text-sky-100 px-1.5 py-0.5 rounded text-xs font-mono wrap-break-word" {...rest}>
                          {children}
                        </code>
                      );
                    },
                    strong: ({children}) => <strong className="font-semibold text-sky-100">{children}</strong>,
                    a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">{children}</a>,
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>
                  }}
                >
                  {preprocessLaTeX(msg.reasoning)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="whitespace-pre-wrap wrap-break-word leading-relaxed space-y-2 w-full max-w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              pre: ({children}) => <div className="w-full overflow-x-auto">{children}</div>,
              code(props) {
                const {children, className, ...rest} = props;
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <CodeBlock 
                    language={match[1]} 
                    code={String(children).replace(/\n$/, '')} 
                  />
                ) : (
                  <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono wrap-break-word" {...rest}>
                    {children}
                  </code>
                );
              },
              h1: ({children}) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
              ul: ({children}) => <ul className="list-disc list-inside my-2 space-y-1 ml-2">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-inside my-2 space-y-1 ml-2">{children}</ol>,
              strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
              hr: () => <hr className="border-gray-700 my-4" />,
              a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">{children}</a>,
              p: ({children}) => <p className="mb-2 last:mb-0 max-w-full">{children}</p>
            }}
          >
            {preprocessLaTeX(msg.content)}
          </ReactMarkdown>
        </div>

        <button
          onClick={() => handleCopyMessage(msg.content, index)}
          className={`absolute ${msg.role === 'user' ? '-left-10 opacity-0 group-hover:opacity-100' : '-right-10'} bottom-2 p-1.5 rounded-lg transition-all text-gray-400 hover:text-white`}
          title="Copiar mensagem"
        >
          {copiedMessageIndex === index ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};