import React, { useState, useRef, useEffect } from 'react';
import { startChat, fastQuery, searchWithGrounding } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { IconBrain, IconZap, IconRocket, IconX, IconArrowDown, IconSparkles } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
  sources?: any[];
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'standard' | 'fast' | 'search'>('standard');
  const chatRef = useRef<any>(null);
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

    try {
      if (mode === 'fast') {
        const response = await fastQuery(currentInput);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      } else if (mode === 'search') {
        const { text, sources } = await searchWithGrounding(currentInput);
        setMessages(prev => [...prev, { role: 'model', text, isSearch: true, sources }]);
      } else {
        if (!chatRef.current) {
          chatRef.current = startChat("Você é o Assistente da Vitrine de Imagens, um studio avançado de IA. Ajude o usuário com dicas de prompts, análise de estilos e informações técnicas sobre geração de imagens.");
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

  return (
    <div className="fixed bottom-6 left-6 z-[110]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 group border border-white/20"
        >
          <IconBrain />
          <span className="font-bold text-sm pr-1">Dúvidas?</span>
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-700 w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <IconBrain />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Gemini Assistant</h4>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setMode('standard')} 
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${mode === 'standard' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Pro
                  </button>
                  <button 
                    onClick={() => setMode('fast')} 
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${mode === 'fast' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Flash Lite
                  </button>
                  <button 
                    onClick={() => setMode('search')} 
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${mode === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Google Search
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <IconX />
            </button>
          </div>

          {/* Messages container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconSparkles />
                </div>
                <p className="text-sm text-gray-400 px-8">Como posso ajudar você no Studio hoje? Peça dicas de prompts ou pesquise novidades.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                  {m.isSearch && m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Fontes:</p>
                      <div className="flex flex-col gap-1">
                        {m.sources.map((s: any, idx: number) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline truncate">
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
                <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700 rounded-tl-none">
                  <LoadingSpinner />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'search' ? 'Pesquisar no Google...' : 'Pergunte qualquer coisa...'}
                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
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
