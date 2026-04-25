import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/layout/Logo';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { getAssistantResponse, SUGGESTED_PROMPTS } from '../../data/assistantResponses';
import { generateId } from '../../utils/storage';
import { formatDate } from '../../utils/formatting';
import type { ChatMessage } from '../../types/assistant';

export default function AssistantPage() {
  const { activeProfile } = useDogProfiles();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('assistant-messages', []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getAssistantResponse(text.trim(), {
        dogName: activeProfile?.name,
        dogWeightLbs: activeProfile?.weightLbs,
      });
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <>
      <Header title="Ask Chef Doggo" />
      <PageWrapper noPadding>
        <div className="flex flex-col min-h-[calc(100svh-3.5rem-5rem)]">
          {/* Disclaimer */}
          <div className="px-4 pt-4">
            <Disclaimer variant="info">
              Chef Doggo provides general educational guidance about homemade dog food. Not a substitute for veterinary advice.
            </Disclaimer>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Logo size="lg" showText={false} />
                <div className="text-center">
                  <h2 className="font-bold text-[#1C1917] text-lg">Hi! I'm Chef Doggo 🐾</h2>
                  <p className="text-sm text-[#78716C] mt-1 max-w-xs">
                    {activeProfile
                      ? `I'm ready to help with ${activeProfile.name}'s diet, recipes, and more!`
                      : 'Ask me anything about homemade dog food, recipes, ingredients, and more.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                  {SUGGESTED_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      className="text-left px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white hover:border-[#F97316] hover:bg-orange-50 transition-colors text-sm text-[#78716C] hover:text-[#1C1917]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : ''].join(' ')}>
                <div className={['w-8 h-8 rounded-full flex items-center justify-center shrink-0', msg.role === 'assistant' ? 'bg-[#F97316]' : 'bg-[#E7E5E4]'].join(' ')}>
                  {msg.role === 'assistant'
                    ? <span className="text-white text-sm">🐾</span>
                    : <User size={14} className="text-[#78716C]" />}
                </div>
                <div className={['max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed', msg.role === 'assistant' ? 'bg-white border border-[#E7E5E4] text-[#1C1917] rounded-tl-sm' : 'bg-[#F97316] text-white rounded-tr-sm'].join(' ')}>
                  {msg.content}
                  <p className={['text-xs mt-1 opacity-60', msg.role === 'user' ? 'text-right' : ''].join(' ')}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm">🐾</span>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full bg-[#A8A29E] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="sticky bottom-20 bg-[#FFFBF5] border-t border-[#E7E5E4] px-4 py-3">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="text-xs text-[#A8A29E] hover:text-[#78716C] mb-2 block"
              >
                Clear conversation
              </button>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeProfile ? `Ask about ${activeProfile.name}'s diet…` : 'Ask Chef Doggo anything…'}
                className="flex-1 rounded-xl border border-[#E7E5E4] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-white"
              />
              <Button
                icon={<Send size={16} />}
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
