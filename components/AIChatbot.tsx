import React, { useState, useRef, useEffect } from 'react';
import { startChat, fastQuery, searchWithGrounding } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { IconBrain, IconZap, IconX, IconSparkles } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
  sources?: any[];
}

interface Source {
  web?: {
    uri: string;
    title: string;
  };
}

interface ChatSession {
  sendMessage: (params: { message: string }) => Promise<{ text: string }>;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'standard' | 'fast' | 'search'>('standard');
  const chatRef = useRef<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const systemContext = `
      Você é o Atlas Command Center, a inteligência central do aplicativo Vitrine de Imagens. 
      Seu objetivo é ser um copiloto técnico e criativo para o Jean.

      CAPACIDADES DO APP:
      - ANALYZE_EDIT: Upload de imagens para análise (objetos, clima, cores) e edição generativa.
      - GENERATE: Geração de imagens do zero (1K a 4K) com diversos estilos e aspect ratios.
      - LIBRARY: Repositório de criações anteriores.
      - PROMPT HUB: Acesso a prompts de elite (1950s High-Fashion, Editorial Doll-style, Urban Fashion).

      PERSONALIDADE:
      Seja objetivo, técnico (como um Arquiteto de Sistemas) mas proativo. Use o nome "Atlas".
      Oriente o usuário sobre qual aba usar para cada tarefa.
    `;

    try {
      if (mode === 'fast') {
        const response = await fastQuery(`${systemContext}\n\nUsuário: ${currentInput}`);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      } else if (mode === 'search') {
        const { text, sources } = await searchWithGrounding(`${systemContext}\n\nUsuário: ${currentInput}`);
        setMessages(prev => [...prev, { role: 'model', text, isSearch: true, sources }]);
      } else {
        if (!chatRef.current) {
          chatRef.current = await startChat(systemContext); 
        }
        const result = await chatRef.current.sendMessage({ message: currentInput });
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema ao processar sua solicitação. Verifique sua chave API." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const modeLabel = (m: string) => m === 'standard' ? 'Pro' : m === 'fast' ? 'Flash' : 'Search';

  return (
    <div className="fixed bottom-6 left-6 z-110">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-3 rounded-lg border border-zinc-700 transition-colors duration-150 flex items-center gap-2 text-sm font-medium"
        >
          <IconBrain />
          <span>Assistente</span>
        </button>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 w-[360px] h-[480px] rounded-xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-400">
                <IconBrain />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-200">Atlas</h4>
                <div className="flex gap-1 mt-0.5">
                  {(['standard', 'fast', 'search'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors duration-150 ${mode === m ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                      {modeLabel(m)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors duration-150" aria-label="Fechar chat">
              <IconX />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3 text-zinc-500">
                  <IconSparkles />
                </div>
                <p className="text-xs text-zinc-500 px-6 leading-relaxed">Como posso ajudar você no Studio hoje?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-lg text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600/15 text-zinc-200 border border-indigo-500/20'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {m.text}
                  {m.isSearch && m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Fontes</p>
                      <div className="flex flex-col gap-1">
                        {m.sources.map((s: Source, idx: number) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 truncate transition-colors">
                            {s.web?.title || s.web?.uri}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-3 py-2.5 rounded-lg border border-zinc-700">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'search' ? 'Pesquisar...' : 'Pergunte algo...'}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500/40 focus:outline-none transition-colors duration-150"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2 rounded-lg transition-colors duration-150"
                aria-label="Enviar mensagem"
              >
                <IconZap />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
