import React, { useState } from 'react';
import { IconLibrary, IconUpload, IconDownload, IconTrash, IconEdit, IconSearch, IconFilter } from './Icons';
import { LibraryItem } from '../types';
import { LibraryPrompts } from './LibraryPrompts';

interface LibraryPageProps {
  items: LibraryItem[];
  onImport: () => void;
  onSelect: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onUsePrompt: (prompt: string, category: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ items, onImport, onSelect, onDelete, onUsePrompt }) => {
  const [filter, setFilter] = useState<'all' | 'generated' | 'edited' | 'uploaded' | 'prompts'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = (item.prompt || item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
            <IconLibrary /> Minha Biblioteca
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Gerencie suas criações e uploads.</p>
        </div>
        <button
          onClick={onImport}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          <IconUpload />
          <span>Upload Imagem</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 border-b border-zinc-800 pb-6">
        {/* Tabs */}
        <div className="flex p-1 bg-zinc-900/50 rounded-lg border border-zinc-800 self-start">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'generated', label: 'Geradas' },
            { id: 'edited', label: 'Editadas' },
            { id: 'uploaded', label: 'Uploads' },
            { id: 'prompts', label: 'Prompts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === tab.id
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-auto">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 hover:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {filter === 'prompts' ? (
        <LibraryPrompts onUsePrompt={onUsePrompt} />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg hover:shadow-black/50 flex flex-col"
            >
              {/* Image Aspect Ratio Container */}
              <div className="aspect-4/5 overflow-hidden bg-zinc-950 relative">
                <img
                  src={item.url}
                  alt={item.prompt || "Sem descrição"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                  <button
                    onClick={() => onSelect(item)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <IconEdit className="w-4 h-4" /> Editar
                  </button>
                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.download = `atlas-${item.id}.png`;
                        link.click();
                      }}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600 flex items-center justify-center gap-2"
                    >
                      <IconDownload className="w-4 h-4" /> Baixar
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                      title="Excluir"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badge Type */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider shadow-sm">
                  {item.type === 'generated' ? 'IA' : item.type === 'edited' ? 'Edit' : 'Upload'}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-4 border-t border-zinc-800/50 flex-1 flex flex-col justify-between bg-zinc-900">
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 line-clamp-1 mb-1" title={item.prompt || item.title}>
                    {item.title || (item.prompt ? "Prompt Personalizado" : "Imagem Sem Título")}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed h-8">
                    {item.prompt || "Sem descrição disponível."}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {formatDate(item.timestamp)}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-zinc-900/20 animate-pulse-slow">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-zinc-800">
            <IconFilter className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-300 mb-2">
            {searchTerm ? 'Nenhum resultado encontrado' : filter === 'all' ? 'Sua biblioteca está vazia' : `Nenhuma imagem em "${filter}"`}
          </h3>
          <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
            {searchTerm
              ? `Não encontramos nada para "${searchTerm}". Tente outro termo.`
              : "Explore o poder da IA gerativa criando novas imagens ou faça upload das suas próprias fotos."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onImport}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors border border-zinc-700"
            >
              Fazer Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
