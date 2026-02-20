import React, { useState, useEffect } from 'react';
import { PRECISION_PRESETS, PRODUCT_PRESETS, FILTERS, ECOMMERCE_PROMPTS, PRESETS_PROMPTS } from '../src/prompts';
import { IconSparkles, IconZap, IconFilter, IconBrain, IconTrash, IconEdit, IconPlus, IconX, IconSave, IconCheckCircle } from './Icons';
import { Toast, ToastType } from './Toast';

interface LibraryPromptsProps {
  onUsePrompt: (prompt: string, category: string) => void;
}

interface PromptItem {
  id: string;
  name: string;
  description: string;
  category: string; // 'precision', 'product', 'filters', 'ecommerce', 'custom'
  prompt: string;
  icon?: any;
  color?: string;
  isDynamic?: boolean;
}

// Helper para converter os dados importados para o formato unificado
const normalizePrompts = (): PromptItem[] => {
  const all: PromptItem[] = [];

  // Precision (Dynamic)
  PRECISION_PRESETS.forEach((p: any) => {
    all.push({
      id: p.id,
      name: p.name,
      description: p.description,
      category: 'precision',
      prompt: p.buildPrompt ? "Este é um prompt dinâmico que depende da análise da imagem." : p.prompt || "",
      icon: p.icon,
      color: p.color,
      isDynamic: true
    });
  });

  // Product
  PRODUCT_PRESETS.forEach((p: any, i) => {
    all.push({
      id: `prod-${i}`,
      name: p.name,
      description: p.description,
      category: 'product',
      prompt: p.prompt,
      icon: p.icon,
      color: p.color,
      isDynamic: false
    });
  });

  // Filters
  FILTERS.forEach((p: any, i) => {
    all.push({
      id: `filter-${i}`,
      name: p.name,
      description: p.description || p.name,
      category: 'filters',
      prompt: p.prompt,
      icon: IconFilter,
      color: p.color,
      isDynamic: false
    });
  });

  // Ecommerce & Presets (Merged as 'ecommerce')
  [...ECOMMERCE_PROMPTS, ...PRESETS_PROMPTS].forEach((p: any, i) => {
    all.push({
      id: `ecom-${i}`,
      name: p.name,
      description: p.category || "Geral",
      category: 'ecommerce',
      prompt: p.prompt || "",
      icon: IconBrain,
      color: p.gradient || "from-zinc-700 to-zinc-900",
      isDynamic: false
    });
  });

  return all;
};

export const LibraryPrompts: React.FC<LibraryPromptsProps> = ({ onUsePrompt }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('view');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  // Load prompts
  useEffect(() => {
    const stored = localStorage.getItem('lumina_custom_prompts');
    const defaults = normalizePrompts();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge: defaults + custom. 
      // Note: If user deleted a default, it might reappear here unless we track deletions.
      // For simplicity in this iteration: We append custom ones.
      // Ideally we would have a robust sync, but let's stick to "Defaults are always present, Custom are added".
      // Unless user wants to edit defaults? 
      // Strategy: Load defaults. Rehydrating edited defaults from storage is complex without IDs.
      // Let's allow editing "Defaults" by saving a copy if "Save" is clicked? Or allow overriding?
      // User asked "edit prompt", let's assume direct editing.
      // To keep it simple: We load defaults. We check storage for *overrides* or *new* ones.
      // Let's simplify: State = Defaults + Custom. If user edits a default, we update state and save *everything* to LS?
      // Saving everything to LS duplicates defaults. 
      // Better: Load Defaults. Load Custom list. Merge.
      
      // Let's just try to load EVERYTHING from LS if exists, else load defaults and Save to LS.
      // This way user has full control.
      
      // Check if we have a "version" or "init" flag.
      if (parsed && parsed.length > 0) {
          setPrompts(parsed);
      } else {
          setPrompts(defaults);
      }
    } else {
      setPrompts(defaults);
    }
  }, []);

  // Save to LS whenever prompts change
  useEffect(() => {
    if (prompts.length > 0) {
      localStorage.setItem('lumina_custom_prompts', JSON.stringify(prompts));
    }
  }, [prompts]);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'precision', label: 'Precision', icon: <IconSparkles /> },
    { id: 'product', label: 'Product AI', icon: <IconZap /> },
    { id: 'filters', label: 'Filtros', icon: <IconFilter /> },
    { id: 'ecommerce', label: 'E-commerce', icon: <IconBrain /> },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({ message: "Prompt copiado!", type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = (item: PromptItem) => {
    setEditingPrompt(item);
    setViewMode('view');
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPrompt({
       id: `custom-${Date.now()}`,
       name: "",
       description: "",
       category: activeCategory === 'todos' ? 'ecommerce' : activeCategory,
       prompt: "",
       color: "from-indigo-900 to-indigo-600",
       isDynamic: false
    });
    setViewMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Atenção: Tem certeza que deseja excluir este prompt?")) {
        setPrompts(prev => prev.filter(p => p.id !== id));
        setIsModalOpen(false);
    }
  };

  const handleSave = () => {
    if (!editingPrompt) return;
    if (!editingPrompt.name || !editingPrompt.prompt) {
        setToast({ message: "Preencha nome e prompt.", type: 'error' });
        return;
    }

    if (viewMode === 'create') {
        setPrompts(prev => [editingPrompt, ...prev]);
    } else {
        setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? editingPrompt : p));
    }
    setToast({ message: "Prompt salvo com sucesso!", type: 'success' });
    setIsModalOpen(false);
  };


  const renderSection = (title: string, type: string) => {
    const items = prompts.filter(p => {
        if (activeCategory === 'todos') return true;
        // Mapeamento de categorias
        if (activeCategory === 'ecommerce' && (p.category === 'ecommerce' || p.category === 'presets')) return true;
        return p.category === activeCategory;
    }).filter(p => {
        // Filter by section type for "Todos" view or specific view
        if (activeCategory !== 'todos') return true; // Already filtered above
        // If todos, we group by headers as before? 
        // The previous code had `renderSection` called multiple times with explicit items.
        // With unified state, we should probably just render a grid if specific category, 
        // OR render grouped sections if 'todos'.
        if (type === 'precision' && p.category === 'precision') return true;
        if (type === 'product' && p.category === 'product') return true;
        if (type === 'filters' && p.category === 'filters') return true;
        if (type === 'ecommerce' && p.category === 'ecommerce') return true;
        return false;
    });

    if (items.length === 0) return null;

    return (
      <div className="mb-8 animate-fade-in">
        <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2 capitalize">
          {type === 'precision' && <IconSparkles className="text-indigo-400" />}
          {type === 'product' && <IconZap className="text-amber-400" />}
          {type === 'filters' && <IconFilter className="text-gray-400" />}
          {type === 'ecommerce' && <IconBrain className="text-emerald-400" />}
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleCardClick(item)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all group relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl bg-zinc-950/50 border-l border-b border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity`}>
                   <div className={`w-2 h-2 rounded-full bg-linear-to-r ${item.color}`}></div>
                </div>

                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">
                        {item.icon && typeof item.icon === 'string' ? item.icon : (React.isValidElement(item.icon) ? item.icon : <IconSparkles />)}
                    </div>
                    {/* Botão de exclusão rápida no hover (opcional, ou manter só no modal) */}
                </div>

                <h4 className="font-bold text-zinc-200 mb-1 leading-tight">{item.name}</h4>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-2 h-8 leading-relaxed">{item.description}</p>

                <div className="flex gap-2 mt-auto">
                   <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Se for dinâmico, ação diferente?
                        if (item.isDynamic) {
                             onUsePrompt("", "analyze");
                        } else {
                             onUsePrompt(item.prompt, item.category);
                        }
                    }}
                    className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <IconBrain className="w-3 h-3" /> Usar
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Categories Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
            <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
            >
                {cat.icon}
                {cat.label}
            </button>
            ))}
        </div>
        <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20"
        >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Importar / Novo</span>
            <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeCategory === 'todos' ? (
            <>
                {renderSection("Precision Presets (Requer Análise)", 'precision')}
                {renderSection("Product AI (Geração)", 'product')}
                {renderSection("Filtros & Estilos", 'filters')}
                {renderSection("E-commerce & Criativo", 'ecommerce')}
            </>
        ) : (
            renderSection(categories.find(c => c.id === activeCategory)?.label || "Prompts", activeCategory)
        )}
      </div>

      {/* MODAL VIEW / EDIT */}
      {isModalOpen && editingPrompt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                          {viewMode === 'create' ? "Novo Prompt" : (viewMode === 'edit' ? "Editar Prompt" : "Detalhes do Prompt")}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Fechar" title="Fechar">
                          <IconX className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                      {viewMode === 'view' ? (
                          <>
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700`}>
                                     {editingPrompt.icon && typeof editingPrompt.icon === 'string' ? <span className="text-2xl">{editingPrompt.icon}</span> : <IconBrain />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{editingPrompt.name}</h2>
                                    <p className="text-zinc-400 text-sm mt-0.5">{editingPrompt.description}</p>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-wider">Prompt</label>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                                    {editingPrompt.prompt}
                                </p>
                            </div>

                            <div className="flex gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                <span className="bg-zinc-800 px-2 py-1 rounded">Categoria: {editingPrompt.category}</span>
                                {editingPrompt.isDynamic && <span className="bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">Dinâmico</span>}
                            </div>
                          </>
                      ) : (
                          // Form Edit/Create
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-zinc-400 mb-1.5 block">Nome do Prompt</label>
                                  <input 
                                    type="text" 
                                    value={editingPrompt.name}
                                    onChange={e => setEditingPrompt({...editingPrompt, name: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-600"
                                    placeholder="Ex: Cenario Futurista..."
                                  />
                              </div>

                              <div>
                                  <label className="text-xs font-bold text-zinc-400 mb-1.5 block">Descrição Curta</label>
                                  <input 
                                    type="text" 
                                    value={editingPrompt.description}
                                    onChange={e => setEditingPrompt({...editingPrompt, description: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-600"
                                    placeholder="Breve descrição do que este prompt faz..."
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">Categoria</label>
                                    <select 
                                        aria-label="Selecionar Categoria"
                                        title="Selecionar Categoria"
                                        value={editingPrompt.category}
                                        onChange={e => setEditingPrompt({...editingPrompt, category: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    >
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="product">Product AI</option>
                                        <option value="filters">Filtros</option>
                                        <option value="precision">Precision (Dinâmico)</option>
                                    </select>
                                  </div>
                              </div>

                              <div>
                                  <label className="text-xs font-bold text-zinc-400 mb-1.5 block">Conteúdo do Prompt</label>
                                  <textarea 
                                    value={editingPrompt.prompt}
                                    onChange={e => setEditingPrompt({...editingPrompt, prompt: e.target.value})}
                                    className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-600 font-mono leading-relaxed resize-none"
                                    placeholder="Digite o comando detalhado do prompt aqui..."
                                    disabled={editingPrompt.isDynamic && viewMode === 'edit'} // Lock dynamic prompt editing unless specific logic
                                  />
                                  {editingPrompt.isDynamic && viewMode === 'edit' && <p className="text-[10px] text-amber-500 mt-1">⚠️ Prompts dinâmicos possuem lógica interna e podem não ser totalmente editáveis aqui.</p>}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 pt-0 flex items-center justify-between gap-3">
                      {viewMode === 'view' ? (
                          <>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => handleDelete(editingPrompt.id)}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                >
                                    <IconTrash className="w-4 h-4" /> Excluir
                                </button>
                                <button 
                                    onClick={() => setViewMode('edit')}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                >
                                    <IconEdit className="w-4 h-4" /> Editar
                                </button>
                             </div>
                             
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => handleCopy(editingPrompt.prompt, editingPrompt.id)}
                                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-lg transition-colors border border-zinc-700"
                                >
                                    {copiedId === editingPrompt.id ? "Copiado!" : "Copiar Texto"}
                                </button>
                                <button 
                                    onClick={() => {
                                        if (editingPrompt.isDynamic) onUsePrompt("", "analyze");
                                        else onUsePrompt(editingPrompt.prompt, editingPrompt.category);
                                        setIsModalOpen(false);
                                    }}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                >
                                    <IconBrain className="w-4 h-4" /> Usar Prompt
                                </button>
                             </div>
                          </>
                      ) : (
                          // Edit/Create Footer
                          <>
                            <button 
                                onClick={() => viewMode === 'create' ? setIsModalOpen(false) : setViewMode('view')}
                                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold text-xs rounded-lg transition-colors border border-zinc-700"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-lg shadow-green-500/20 flex items-center gap-2"
                            >
                                <IconSave className="w-4 h-4" /> Salvar Alterações
                            </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
