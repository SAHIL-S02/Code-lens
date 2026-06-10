'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const optimistic: ChatMessage = {
      id: 'temp',
      role: 'user',
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const { data } = await api.chat.send(projectId, {
        message: userMsg,
        sessionId,
      });
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'temp'),
        ...data.messages,
      ]);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== 'temp'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Ask questions about your uploaded code
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id + msg.createdAt}
            className={`rounded-lg p-3 text-sm ${
              msg.role === 'user'
                ? 'ml-8 bg-indigo-500/20 text-indigo-100'
                : 'mr-8 bg-slate-800 text-slate-300'
            }`}
          >
            <p className="mb-1 text-xs font-medium capitalize text-slate-500">
              {msg.role}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Explain how authentication works..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
