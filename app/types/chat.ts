export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
}

export interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

export interface CodeBlockProps {
  language: string;
  code: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
}