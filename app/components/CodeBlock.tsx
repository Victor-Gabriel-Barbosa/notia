import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeBlockProps } from '../types/chat';

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Copy failed', err);
    });
  };

  const validLanguage = language ? language.toLowerCase() : 'typescript';

  return (
    <div className="my-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm w-full">
      <div className="bg-gray-200/50 dark:bg-gray-800/80 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <span className="font-sans lowercase">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-sans"
          title="Copiar código"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      
      <div className="text-sm font-mono max-w-full overflow-x-auto">
        <div className="block dark:hidden">
          <SyntaxHighlighter
            language={validLanguage}
            style={vs}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            PreTag="div"
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>

        <div className="hidden dark:block">
          <SyntaxHighlighter
            language={validLanguage}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            PreTag="div"
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};