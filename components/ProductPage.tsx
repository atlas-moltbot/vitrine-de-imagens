import React, { useRef, useState } from 'react';
import { 
  IconZap, IconArrowDown, IconFileText, IconMagic, IconUpload, 
  IconTrash, IconPlus, IconLibrary, IconImage, IconCheckCircle, 
  IconBrain, IconDownload, IconSparkles, IconX, IconLayers 
} from './Icons';
import { PromptMenu } from './PromptMenu';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageComparison } from './ImageComparison';
import { ImageRegionSelector } from './ImageRegionSelector';
import { translateToPortuguese } from '../services/geminiService';
import { Toast, ToastType } from './Toast';

interface ProductPageProps {
  editPrompt: string;
  setEditPrompt: (value: string) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  editedImageUrl: string | null;
  setEditedImageUrl: (url: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleEdit: (maskCoords?: number[] | null) => void;
  onUploadClick: () => void;
  onClear: () => void;
  addToLibrary: (url: string, type: 'generated' | 'edited' | 'uploaded', prompt?: string) => void;
  history: string[];
}

export const ProductPage: React.FC<ProductPageProps> = ({
  editPrompt,
  setEditPrompt,
  previewUrl,
  setPreviewUrl,
  editedImageUrl,
  setEditedImageUrl,
  loading,
  setLoading,
  handleEdit,
  onUploadClick,
  onClear,
  addToLibrary,
  history,
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<number[] | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  
  const localInputRef = useRef<HTMLInputElement>(null);

  const handleProductPromptImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setEditPrompt(text);
          setToast({ message: "Prompt importado!", type: 'success' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    if (editedImageUrl) {
        addToLibrary(editedImageUrl, 'edited', editPrompt);
        setToast({ message: "Salvo na biblioteca!", type: 'success' });
    }
  };

  const onApplyEdit = () => {
    handleEdit(selectedRegion);
    // Auto-disable selection mode after applying
    setIsSelectionMode(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in h-[calc(100vh-140px)]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* LEFT PANEL - CONTROLS */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Card de Edição */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><IconZap /></div>
                  Edição de Produto
                </h3>
            </div>

            <div className="space-y-5">
                {/* Style Selector */}
                <div>
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                     Estilo Base
                   </label>
                   <PromptMenu 
                     value={editPrompt} 
                     onChange={(val) => setEditPrompt(val)} 
                     className="w-full"
                   />
                </div>

                {/* Regional Editing Toggle */}
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <IconLayers className="text-indigo-400 w-4 h-4" />
                         <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Área Específica</span>
                      </div>
                      <button 
                        onClick={() => {
                          setIsSelectionMode(!isSelectionMode);
                          if (isSelectionMode) setSelectedRegion(null);
                        }}
                        className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${isSelectionMode ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        {isSelectionMode ? 'ATIVADO' : 'DESATIVADO'}
                      </button>
                   </div>
                   <p className="text-[10px] text-zinc-500 leading-tight">
                     Ative para selecionar uma área específica na imagem para a IA editar (Inpainting).
                   </p>
                   {selectedRegion && isSelectionMode && (
                      <div className="flex items-center justify-between bg-zinc-900 px-2 py-1.5 rounded border border-indigo-500/20">
                         <span className="text-[9px] font-mono text-indigo-300">Região: {selectedRegion.join(', ')}</span>
                         <button 
                            onClick={() => setSelectedRegion(null)} 
                            aria-label="Limpar região"
                            title="Limpar região"
                         >
                            <IconX size={10} className="text-zinc-500 hover:text-white"/>
                         </button>
                      </div>
                   )}
                </div>

                {/* Prompt Editor */}
                <div className="flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                       Prompt de Edição
                     </label> 
                     
                     <div className="flex gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(editPrompt);
                            setToast({ message: "Copiado!", type: 'success' });
                          }}
                          disabled={!editPrompt}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all disabled:opacity-30"
                          title="Copiar"
                        >
                          <IconFileText />
                        </button>
                        <button
                          onClick={async () => {
                            if (!editPrompt) return;
                            setLoading(true);
                            try {
                                const translated = await translateToPortuguese(editPrompt);
                                setEditPrompt(translated);
                            } catch(e) { console.error(e); }
                            setLoading(false);
                          }}
                          disabled={!editPrompt || loading}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-all disabled:opacity-30"
                          title="Traduzir para PT"
                        >
                          <IconMagic />
                        </button>
                        <button
                          onClick={() => localInputRef.current?.click()}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-md transition-all"
                          title="Importar .txt"
                        >
                          <IconUpload />
                        </button>
                     </div>
                   </div>
                   
                   <textarea
                     value={editPrompt}
                     onChange={(e) => setEditPrompt(e.target.value)}
                     placeholder={isSelectionMode ? "Descreva o que mudar na área selecionada..." : "Descreva as alterações desejadas..."}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all resize-none min-h-[160px] font-medium leading-relaxed"
                   />
                   <input
                      ref={localInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleProductPromptImport}
                      className="hidden"
                      aria-label="Importar prompt de arquivo"
                      title="Importar prompt de arquivo"
                   />
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-800">
                <button
                  onClick={onApplyEdit}
                  disabled={loading || !editPrompt || !previewUrl}
                  className="group w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {loading ? (
                      <>
                        <LoadingSpinner />
                        <span className="animate-pulse">Processando...</span>
                      </>
                  ) : (
                      <>
                        <IconSparkles className="group-hover:rotate-12 transition-transform" /> 
                        {isSelectionMode ? 'Editar Região' : 'Aplicar Edição'}
                      </>
                  )}
                </button>
            </div>
        </div>
      </div>

      {/* RIGHT PANEL - PREVIEW */}
      <div className="lg:col-span-8 flex flex-col h-full gap-4">
          <div className="flex-1 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl relative overflow-hidden group flex items-center justify-center transition-all hover:border-zinc-700">
              
              {!previewUrl ? (
                  <div 
                    className="text-center cursor-pointer p-12 w-full h-full flex flex-col items-center justify-center"
                    onClick={onUploadClick}
                  >
                      <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-zinc-500">
                          <IconUpload />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-300 mb-2">Faça upload do seu produto</h3>
                      <p className="text-zinc-500 max-w-sm mx-auto">
                          Arraste e solte sua imagem aqui ou clique para buscar nos seus arquivos.
                      </p>
                  </div>
              ) : (
                <div className="relative w-full h-full p-4 flex items-center justify-center bg-zinc-950/30">
                    {/* Main Image Display */}
                    <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl">
                         {editedImageUrl ? (
                             history.length > 0 ? (
                                <ImageComparison
                                    before={history[0]} // Original
                                    after={editedImageUrl} // Edited
                                    beforeLabel="Original"
                                    afterLabel="Editado"
                                />
                             ) : (
                                <img src={editedImageUrl} alt="Resultado" className="max-h-[70vh] object-contain" />
                             )
                         ) : (
                             isSelectionMode ? (
                                <ImageRegionSelector 
                                    imageSrc={previewUrl}
                                    onRegionChange={(coords) => setSelectedRegion(coords)}
                                    enabled={isSelectionMode}
                                />
                             ) : (
                                <img src={previewUrl} alt="Original" className="max-h-[70vh] object-contain" />
                             )
                         )}
                    </div>

                    {/* Floating Actions */}
                    <div className="absolute top-6 right-6 flex gap-2">
                        {editedImageUrl ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:shadow-emerald-900/20 transition-all flex items-center gap-2 font-bold text-sm"
                                    title="Salvar na Biblioteca"
                                >
                                    <IconCheckCircle /> Salvar
                                </button>
                                <button
                                    onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = editedImageUrl;
                                        link.download = `lumina-edit-${Date.now()}.png`;
                                        link.click();
                                    }}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded-xl shadow-lg transition-all"
                                    title="Baixar"
                                >
                                    <IconDownload />
                                </button>
                                <button
                                    onClick={() => setEditedImageUrl(null)} // Undo to original preview
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded-xl shadow-lg transition-all"
                                    title="Desfazer"
                                >
                                    <IconX />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClear}
                                className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transition-all backdrop-blur-sm"
                                title="Remover imagem"
                            >
                                <IconTrash />
                            </button>
                        )}
                        {!editedImageUrl && (
                             <button
                                onClick={onUploadClick}
                                className="bg-indigo-600/80 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg transition-all backdrop-blur-sm"
                                title="Trocar imagem"
                             >
                                <IconPlus />
                             </button>
                        )}
                    </div>
                </div>
              )}
          </div>
          
          {/* Bottom Info / History (Optional) */}
          {history.length > 0 && !editedImageUrl && (
             <div className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 overflow-x-auto">
                 <span className="text-xs font-bold text-zinc-500 uppercase shrink-0">Histórico de Sessão</span>
                 {history.map((url, i) => (
                     <img 
                        key={i} 
                        src={url} 
                        alt={`Histórico ${i + 1}`}
                        className="h-16 w-16 rounded-lg object-cover border border-zinc-700 cursor-pointer hover:border-indigo-500 transition-colors" 
                        onClick={() => setPreviewUrl(url)}
                     />
                 ))}
             </div>
          )}
      </div>
    </div>
  );
};
