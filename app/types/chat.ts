export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
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