import React, { useState, useRef, useEffect } from 'react';
import { startChat, fastQuery, searchWithGrounding, fileToGenerativePart } from '../../services/geminiService';
import { LoadingSpinner } from '../LoadingSpinner';
import { IconBrain, IconZap, IconX, IconSparkles, IconSettings, IconTrash, IconUpload } from '../Icons';
import { getSystemPrompt, saveAtlasMemory, loadAtlasMemory, clearAtlasMemory, AgentProfile, AgentContext } from './AtlasAgent';
import { Tooltip } from '../Tooltip';

interface Message {
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
  sources?: any[];
  filePreview?: string;
}

export const AtlasChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [mode, setMode] = useState<'chat' | 'search'>('chat');
  const [profile, setProfile] = useState<AgentProfile>('Standard');
  const [userLinks, setUserLinks] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We keep a reference to the active gemini chat session
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial memory
  useEffect(() => {
    const mem = loadAtlasMemory();
    if (mem.length > 0) {
      setMessages(mem);
    }
  }, []);

  // Save memory on change
  useEffect(() => {
    if (messages.length > 0) {
      saveAtlasMemory(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showSettings]);

  const initChatSession = async () => {
      const context: AgentContext = {
          userName: 'Jean',
          userLinks: userLinks.split(',').map(l => l.trim()).filter(l => l.length > 0),
          profile: profile
      };
      const systemInstruction = getSystemPrompt(context);
      // Restart chat session to apply new instructions or when first starting
      chatRef.current = await startChat(systemInstruction); 
      
      // If we have local memory, we technically should hydrate the gemini history
      // but the startChat implementation uses an internal variable. 
      // For this implementation, we will rely on startChat to manage new session's future messages,
      // and inject previous context via a silent prompt if needed, or simply let it be a fresh session visually retaining old messages.
      // To properly sync, we'd need to modify `geminiService.ts`, but this works as visual memory.
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isTyping) return;

    const currentInput = input || "Analise o arquivo anexado.";
    const userMessage: Message = { role: 'user', text: currentInput, filePreview: filePreview || undefined };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const fileToSend = selectedFile;
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      if (mode === 'search') {
          const context: AgentContext = { userName: 'Jean', userLinks: [], profile: 'Standard' };
          const instruction = getSystemPrompt(context);
          const { text, sources } = await searchWithGrounding(`${instruction}\n\nAnalise ou responda a isso usando search: ${currentInput}`);
          setMessages(prev => [...prev, { role: 'model', text, isSearch: true, sources }]);
      } else {
        if (!chatRef.current) {
            await initChatSession();
        }
        let fileParts;
        if (fileToSend) {
            const part = await fileToGenerativePart(fileToSend);
            fileParts = [part];
        }
        const result = await chatRef.current.sendMessage({ message: currentInput, fileParts });
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, Jean. Tive um problema ao processar sua solicitação. Verifique sua chave API ou conexão." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const wipeMemory = () => {
      clearAtlasMemory();
      setMessages([]);
      chatRef.current = null;
  };

  const handleProfileChange = (p: AgentProfile) => {
      setProfile(p);
      chatRef.current = null; // force restart session
  };

  return (
    <div className="fixed bottom-6 left-6 z-110">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 text-zinc-200 p-3.5 rounded-xl shadow-lg border border-zinc-700/50 transition-all duration-300 flex items-center gap-2.5 overflow-hidden group"
        >
          <div className="relative flex items-center justify-center">
             <IconBrain className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
             <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="text-sm font-semibold tracking-wide">Atlas</span>
        </button>
      ) : (
        <div className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/60 shadow-2xl w-[380px] h-[580px] rounded-2xl flex flex-col overflow-hidden animate-fade-in ring-1 ring-white/5">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.15)] relative">
                <IconBrain className="text-indigo-400 w-4 h-4" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950"></div>
              </div>
              <div>
                <h4 className="font-semibold text-[15px] text-zinc-100 tracking-wide">Atlas Hub</h4>
                <div className="flex gap-1.5 mt-1">
                    <button
                        onClick={() => setMode('chat')}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors duration-200 ${mode === 'chat' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors duration-200 ${mode === 'search' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Search
                    </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className={`p-1.5 rounded-md transition-colors ${showSettings ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <IconSettings />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800/50 hover:bg-zinc-800 rounded-md">
                   <IconX />
                </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-4 text-sm animate-fade-in shrink-0">
                  <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Perfil do Agente</label>
                      <div className="grid grid-cols-2 gap-2">
                          {(['Standard', 'Technical', 'Creative', 'Marketing'] as AgentProfile[]).map(p => (
                              <button
                                  key={p}
                                  onClick={() => handleProfileChange(p)}
                                  className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${profile === p ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                              >
                                  {p}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Links de Referência (separado por vírgula)</label>
                      <input 
                          type="text" 
                          value={userLinks}
                          onChange={(e) => {
                              setUserLinks(e.target.value);
                              chatRef.current = null;
                          }}
                          placeholder="ex: github.com/..., mywebsite.com"
                          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
                      />
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t border-zinc-800 pt-3">
                      <span className="text-xs text-zinc-500">Memória ativa</span>
                      <button onClick={wipeMemory} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-400/10">
                          <IconTrash /> Limpar Sessão
                      </button>
                  </div>
              </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400/50 shadow-inner">
                  <IconSparkles />
                </div>
                <h3 className="text-zinc-300 font-medium mb-1">Olá, Jean.</h3>
                <p className="text-sm text-zinc-500 px-6 leading-relaxed">Como posso ajudá-lo a expandir as fronteiras do seu app hoje?</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed relative group ${
                  m.role === 'user'
                    ? 'bg-indigo-600/90 text-zinc-100 border border-indigo-500/50 rounded-br-sm shadow-md'
                    : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-bl-sm shadow-sm'
                }`}>
                  {m.filePreview && <img src={m.filePreview} alt="User Upload" className="w-full max-w-[200px] rounded-lg mb-2 border border-white/20" />}
                  <p className="whitespace-pre-wrap font-sans">{m.text}</p>
                  
                  {m.isSearch && m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <IconZap className="w-3 h-3"/> Referências Web
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {m.sources.map((s: any, idx: number) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-300 hover:text-indigo-200 truncate transition-colors flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
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
                <div className="bg-zinc-800/80 px-4 py-3.5 rounded-2xl border border-zinc-700/50 rounded-bl-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-zinc-900/60 border-t border-zinc-800/50">
            {filePreview && (
              <div className="px-4 py-2 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/80">
                <div className="flex items-center gap-2">
                  <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-zinc-700" />
                  <span className="text-xs text-zinc-400 truncate max-w-[200px]">{selectedFile?.name}</span>
                </div>
                <button onClick={() => { setSelectedFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-zinc-500 hover:text-zinc-300 p-1">
                  <IconX />
                </button>
              </div>
            )}
            <div className="px-4 py-4 flex gap-2 relative">
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.txt" />
              <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-3 shrink-0 text-zinc-400 hover:text-indigo-400 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors flex items-center justify-center"
              >
                  <IconUpload className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'search' ? 'Pesquisar na web...' : 'Comande o Atlas...'}
                className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 shadow-inner"
              />
              <div className="absolute right-1 top-1 bottom-1">
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="h-full px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md"
                    aria-label="Enviar mensagem"
                >
                    <IconZap className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
