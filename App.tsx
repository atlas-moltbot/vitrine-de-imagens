
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { analyzeImage, editImage, generateImage, base64ToFile } from './services/geminiService';
import { AnalysisResult, AppMode, AspectRatio, ImageSize, GenerationConfig, SavedConfig, PromptTemplate, LibraryItem } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  IconUpload, IconMagic, IconEdit, IconImage, IconSave, IconDownload, 
  IconLibrary, IconTrash, IconPlus, IconFileText, IconFilePdf, IconCamera, IconSettings,
  IconStack, IconCheckCircle, IconFilter, IconType, IconArrowUp, IconArrowDown, IconUndo, IconX, IconZap,
  IconBrain, IconSparkles
} from './components/Icons';
import { ImageComparison } from './components/ImageComparison';
import { ImageRegionSelector } from './components/ImageRegionSelector';
import { Tooltip } from './components/Tooltip';
import { LandingPage } from './components/LandingPage';
import { AtlasConnector } from './components/AtlasConnector';
import { AIChatbot } from './components/AIChatbot';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const TEMPLATES: PromptTemplate[] = [
  {
    name: 'Fantasia de Carnaval',
    product: 'Uma pessoa com fantasia luxuosa',
    scenario: 'Desfile de Carnaval em uma cidade flutuante mágica, confetes brilhantes',
    style: 'Fantasia Épica, Vibrante, RPG, Cinema 4D',
    lighting: 'Explosão de cores, fogos de artifício, luzes festivas',
    gradient: 'from-pink-600 via-yellow-500 to-purple-600'
  },
  {
    name: 'IA Futurista',
    product: 'Um processador quântico holográfico',
    scenario: 'Laboratório de robótica avançada com interfaces flutuantes',
    style: 'Sci-fi, High-tech, Minimalista, Unreal Engine 5',
    lighting: 'Neon azul, luzes LED frias, brilho volumétrico',
    gradient: 'from-blue-600 via-cyan-400 to-indigo-800'
  },
  {
    name: 'Estilo Praia',
    product: 'Um drink refrescante em coco',
    scenario: 'Praia tropical paradisíaca com areia branca e águas cristalinas',
    style: 'Fotorealista, 8k, Estilo Férias, Revista Travel',
    lighting: 'Luz solar dourada, sombras suaves de palmeiras',
    gradient: 'from-teal-400 via-blue-400 to-yellow-200'
  },
  {
    name: 'Estilo Anúncio',
    product: 'Um perfume de luxo em frasco de cristal',
    scenario: 'Display de design minimalista em pedestal de mármore',
    style: 'Comercial, Publicidade de Luxo, High-end Photography',
    lighting: 'Studio Lighting, Softbox lateral, reflexos elegantes',
    gradient: 'from-gray-700 via-gray-900 to-black'
  },
  {
    name: 'Remover Fundo (Isolado)',
    product: 'Um tênis esportivo moderno',
    scenario: 'Objeto central totalmente isolado sem distrações',
    style: 'Fundo branco puro #ffffff, E-commerce, Catálogo Clean',
    lighting: 'Iluminação global suave, sem sombras projetadas',
    gradient: 'from-slate-100 to-white'
  },
  {
    name: 'Aquarela Artística',
    product: 'Um gato curioso',
    scenario: 'Jardim de flores abstrato e colorido',
    style: 'Pintura em Aquarela, Artístico, Pinceladas Fluídas',
    lighting: 'Luz natural suave, cores pastel difusas',
    gradient: 'from-teal-300 via-purple-300 to-pink-300'
  }
];

const FILTERS = [
  { name: 'P&B', prompt: 'Converta para escala de cinza (preto e branco), mantendo alto contraste.', color: 'from-gray-700 to-black', description: 'Transforma a imagem em preto e branco clássico com alto contraste.' },
  { name: 'Sépia', prompt: 'Aplique tom sépia envelhecido, estética de fotografia antiga.', color: 'from-amber-700 to-orange-900', description: 'Aplica um tom marrom nostálgico evocando fotografias do século XIX.' },
  { name: 'Cyberpunk', prompt: 'Adicione iluminação neon (ciano/magenta) e contraste futurista.', color: 'from-purple-600 to-blue-800', description: 'Injeta cores neon vibrantes e uma atmosfera urbana futurista.' },
  { name: 'Cartoon', prompt: 'Transforme em arte estilo cartoon 2D, traços fortes e cores planas.', color: 'from-pink-500 to-rose-600', description: 'Simplifica a imagem em um estilo de desenho animado com contornos marcados.' },
  { name: 'Vibrante', prompt: 'Aumente drasticamente a saturação e vivacidade das cores.', color: 'from-green-500 to-emerald-700', description: 'Realça intensamente as cores para um visual energético e saturado.' },
  { name: 'Negativo', prompt: 'Inverta as cores para criar um efeito negativo de filme.', color: 'from-indigo-600 to-blue-900', description: 'Inverte as tonalidades criando o efeito visual de um negativo fotográfico.' },
  { name: 'Cinematográfico', prompt: 'Aplique color grading cinematográfico (teal & orange), iluminação dramática.', color: 'from-cyan-600 to-slate-800', description: 'Aplica o esquema de cores Teal & Orange típico de grandes produções de cinema.' },
  { name: 'Rascunho', prompt: 'Transforme a imagem em um esboço de lápis (sketch) sobre papel texturizado.', color: 'from-stone-500 to-stone-700', description: 'Converte a cena em um desenho artístico feito a lápis ou carvão.' },
];

interface FilterQueueItem {
  id: string;
  text: string;
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [atlasWebhookInput, setAtlasWebhookInput] = useState('https://lemon-flies-fall.loca.lt/webhook/atlas-site');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [editTab, setEditTab] = useState<'general' | 'text'>('general');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  
  const [activeSwapItem, setActiveSwapItem] = useState<{ type: string, value: string } | null>(null);
  const [swapReplacement, setSwapReplacement] = useState('');

  const [textToFind, setTextToFind] = useState('');
  const [textToReplace, setTextToReplace] = useState('');
  const [textRegion, setTextRegion] = useState<number[] | null>(null);

  const [genConfig, setGenConfig] = useState<GenerationConfig>({
    size: ImageSize.SIZE_1K,
    aspectRatio: AspectRatio.RATIO_16_9,
    prompt: '',
    product: '',
    scenarios: [''],
    styles: [''],
    lightings: ['']
  });
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [baseGeneratedImageUrl, setBaseGeneratedImageUrl] = useState<string | null>(null);
  const [genHistory, setGenHistory] = useState<string[]>([]);
  const [genHistoryIndex, setGenHistoryIndex] = useState(-1);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  
  const [genFilterPrompt, setGenFilterPrompt] = useState('');
  const [filterQueue, setFilterQueue] = useState<FilterQueueItem[]>([]);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingFilterText, setEditingFilterText] = useState('');

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_saved_configs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved configs", e);
      }
    }

    const storedKey = localStorage.getItem("lumina_api_key");
    if (storedKey) setApiKeyInput(storedKey);

    const storedWebhook = localStorage.getItem("lumina_atlas_webhook");
    if (storedWebhook) setAtlasWebhookInput(storedWebhook);
  }, []);

  const constructedPrompt = useMemo(() => {
    if (genConfig.prompt) return genConfig.prompt;
    
    const validScenarios = genConfig.scenarios.filter(s => s.trim());
    const validStyles = genConfig.styles.filter(s => s.trim());
    const validLightings = genConfig.lightings.filter(s => s.trim());
    const product = genConfig.product.trim();
    
    if (!product && validScenarios.length === 0 && validStyles.length === 0 && validLightings.length === 0) return "";
    
    let p = "Uma imagem ";
    if (product) {
      p += `de ${product} `;
    }
    if (validScenarios.length > 0) {
      p += `${product ? 'em um' : 'retratando:'} ${validScenarios.join(' combinada com ')}. `;
    }
    if (validStyles.length > 0) {
      p += `No estilo artístico de: ${validStyles.join(', ')}. `;
    }
    if (validLightings.length > 0) {
      p += `Com iluminação: ${validLightings.join(' mesclada com ')}.`;
    }
    
    return p;
  }, [genConfig]);

  useEffect(() => {
    if (activeSwapItem) {
      setEditTab('general');
    }
  }, [activeSwapItem]);

  useEffect(() => {
    if (editTab !== 'text') return;
    const regionString = textRegion ? ` na região delimitada pelas coordenadas [${textRegion.join(', ')}]` : '';
    const preservationString = " Mantenha o restante da imagem 100% inalterado, modificando APENAS a área dentro das coordenadas fornecidas.";

    if (textToReplace) {
      if (textToFind) {
         setEditPrompt(`Substitua o texto escrito "${textToFind}" por "${textToReplace}"${regionString}. Mantenha o mesmo estilo de fonte, cor, perspectiva e fundo do texto original.${preservationString}`);
      } else {
         setEditPrompt(`Adicione o texto "${textToReplace}"${regionString}. O texto deve parecer natural e integrar-se à cena.${preservationString}`);
      }
    } else if (textRegion) {
        setEditPrompt(`(Região selecionada: [${textRegion.join(', ')}]. Digite o texto para aplicar.)`);
    } else {
      setEditPrompt('');
    }
  }, [editTab, textToFind, textToReplace, textRegion]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("lumina_api_key", apiKeyInput.trim());
      alert("Chave API salva com sucesso!");
    }
  };

  const handleSaveWebhook = () => {
    if (atlasWebhookInput.trim()) {
      localStorage.setItem("lumina_atlas_webhook", atlasWebhookInput.trim());
      alert("Webhook do Atlas atualizado!");
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("lumina_api_key");
    setApiKeyInput('');
    alert("Chave API removida.");
  };

  const activateSwapItem = (type: string, value: string) => {
    setActiveSwapItem({ type, value });
    setSwapReplacement('');
    setEditTab('general');
    setEditPrompt(`Substitua o elemento '${value}' por... (Digite no campo de modificação)`);
  };

  const cancelSwap = () => {
    setActiveSwapItem(null);
    setSwapReplacement('');
    setEditPrompt('');
  };

  const addToLibrary = (url: string, type: LibraryItem['type']) => {
    const newItem: LibraryItem = {
      id: Date.now().toString() + Math.random(),
      url,
      type,
      timestamp: Date.now()
    };
    setLibrary(prev => [newItem, ...prev]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setEditedImageUrl(null);
      setActiveSwapItem(null);
      setTextToFind('');
      setTextToReplace('');
      setTextRegion(null);
      setEditTab('general');
      setEditPrompt('');
      setError(null);
      setHistory([url]);
      setHistoryIndex(0);
      const reader = new FileReader();
      reader.onloadend = () => addToLibrary(reader.result as string, 'uploaded');
      reader.readAsDataURL(file);
    }
  };

  const handleClearWorkspace = () => {
    if (window.confirm("Limpar a área de trabalho? Isso removerá a imagem atual e o histórico de edições.")) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setHistory([]);
      setHistoryIndex(-1);
      setAnalysisResult(null);
      setEditedImageUrl(null);
      setActiveSwapItem(null);
      setEditPrompt('');
      setTextRegion(null);
      setTextToFind('');
      setTextToReplace('');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPreviewUrl(history[newIndex]);
      setEditedImageUrl(null);
      setActiveSwapItem(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage(selectedFile);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na análise');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSwap = async () => {
    if (!activeSwapItem || !swapReplacement) return;
    const prompt = `Substitua o elemento '${activeSwapItem.value}' (${activeSwapItem.type}) por '${swapReplacement}'. Mantenha a coerência visual, iluminação e perspectiva da imagem original.`;
    setEditPrompt(prompt);
    await executeEdit(prompt);
  };

  const handleEdit = async () => {
    if (!editPrompt) return;
    await executeEdit(editPrompt);
  };

  const executeEdit = async (prompt: string) => {
    if (history.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      let fileToEdit: File | null = null;
      if (historyIndex === 0 && selectedFile) {
         fileToEdit = selectedFile;
      } else {
         fileToEdit = await base64ToFile(history[historyIndex], `edit-source-${Date.now()}.png`);
      }
      if (!fileToEdit) throw new Error("Imagem fonte inválida");
      const resultUrl = await editImage(fileToEdit, prompt);
      setEditedImageUrl(resultUrl);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(resultUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setPreviewUrl(resultUrl);
      addToLibrary(resultUrl, 'edited');
      setActiveSwapItem(null);
      setSwapReplacement('');
      if (editTab === 'text') {
        setTextRegion(null);
        setTextToReplace('');
        setTextToFind('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na edição');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalPrompt = constructedPrompt;
      if (!finalPrompt) throw new Error("O prompt não pode estar vazio.");
      
      const resultUrl = await generateImage(finalPrompt, genConfig.size, genConfig.aspectRatio);
      setGeneratedImageUrl(resultUrl);
      setBaseGeneratedImageUrl(resultUrl);
      
      const newGenHistory = genHistory.slice(0, genHistoryIndex + 1);
      newGenHistory.push(resultUrl);
      setGenHistory(newGenHistory);
      setGenHistoryIndex(newGenHistory.length - 1);
      
      addToLibrary(resultUrl, 'generated');
      setFilterQueue([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na geração');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoGen = () => {
    if (genHistoryIndex > 0) {
      const newIndex = genHistoryIndex - 1;
      setGenHistoryIndex(newIndex);
      setGeneratedImageUrl(genHistory[newIndex]);
    } else {
      handleClearGen();
    }
  };

  const handleClearGen = () => {
    setGeneratedImageUrl(null);
    setBaseGeneratedImageUrl(null);
    setGenHistory([]);
    setGenHistoryIndex(-1);
    setFilterQueue([]);
  };

  const handleApplyFilterQueue = async () => {
    if (!baseGeneratedImageUrl || filterQueue.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const instructions = filterQueue.map((item, idx) => `Passo ${idx + 1}: ${item.text}`).join('\n');
      const compositePrompt = `Atue como um editor experiente. Aplique estas transformações na ordem sequencial:\n${instructions}\nMantenha a composição da imagem original.`;
      const file = await base64ToFile(baseGeneratedImageUrl, 'gen-base-image.png');
      const newImageUrl = await editImage(file, compositePrompt);
      setGeneratedImageUrl(newImageUrl);
      
      const newGenHistory = genHistory.slice(0, genHistoryIndex + 1);
      newGenHistory.push(newImageUrl);
      setGenHistory(newGenHistory);
      setGenHistoryIndex(newGenHistory.length - 1);
      
      addToLibrary(newImageUrl, 'edited');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = (text: string) => {
    if (!text.trim()) return;
    setFilterQueue(prev => [...prev, { id: Date.now().toString() + Math.random(), text: text.trim() }]);
    setGenFilterPrompt('');
  };

  const handleRemoveFromQueue = (id: string) => {
    setFilterQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveFilter = (index: number, direction: 'up' | 'down') => {
    const newQueue = [...filterQueue];
    if (direction === 'up' && index > 0) {
      [newQueue[index], newQueue[index - 1]] = [newQueue[index - 1], newQueue[index]];
    } else if (direction === 'down' && index < newQueue.length - 1) {
      [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    }
    setFilterQueue(newQueue);
  };

  const startEditingFilter = (item: FilterQueueItem) => {
    setEditingFilterId(item.id);
    setEditingFilterText(item.text);
  };

  const saveFilterEdit = () => {
    if (!editingFilterId) return;
    setFilterQueue(prev => prev.map(item => item.id === editingFilterId ? { ...item, text: editingFilterText } : item));
    setEditingFilterId(null);
  };

  const handleApplyTemplate = (template: PromptTemplate) => {
    setGenConfig({ 
      ...genConfig, 
      product: template.product,
      scenarios: [template.scenario], 
      styles: [template.style], 
      lightings: [template.lighting], 
      prompt: '' 
    });
  };

  const handleSaveConfig = () => {
    const name = prompt("Nome para esta predefinição:");
    if (!name) return;
    const newConfig: SavedConfig = { ...genConfig, id: Date.now().toString(), name };
    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem('lumina_saved_configs', JSON.stringify(updated));
  };

  const handleLoadConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const config = savedConfigs.find(c => c.id === e.target.value);
    if (config) {
      const { id: _, name: __, ...rest } = config;
      setGenConfig(rest);
    }
  };

  const getCurrentPromptContext = () => {
    if (mode === AppMode.ANALYZE_EDIT) return editPrompt || "Editor de Imagem";
    if (mode === AppMode.GENERATE) return constructedPrompt || "Gerador de Imagem";
    return undefined;
  };

  const updateGenField = (field: 'scenarios' | 'styles' | 'lightings', index: number, value: string) => {
    setGenConfig(prev => {
      const newList = [...prev[field]];
      newList[index] = value;
      return { ...prev, [field]: newList, prompt: '' };
    });
  };

  const addGenField = (field: 'scenarios' | 'styles' | 'lightings') => {
    setGenConfig(prev => ({ ...prev, [field]: [...prev[field], ''], prompt: '' }));
  };

  const removeGenField = (field: 'scenarios' | 'styles' | 'lightings', index: number) => {
    setGenConfig(prev => {
      const newList = prev[field].filter((_, i) => i !== index);
      if (newList.length === 0) newList.push('');
      return { ...prev, [field]: newList, prompt: '' };
    });
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedLibraryItems([]);
  };

  const handleSelectLibraryItem = (id: string) => {
    setSelectedLibraryItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    if (selectedLibraryItems.length === 0) return;
    if (window.confirm(`Deseja excluir permanentemente ${selectedLibraryItems.length} item(ns)?`)) {
      setLibrary(prev => prev.filter(item => !selectedLibraryItems.includes(item.id)));
      setSelectedLibraryItems([]);
      setIsSelectionMode(false);
    }
  };

  const handleDownloadZip = async () => {
    if (selectedLibraryItems.length === 0) return;
    setLoading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("vitrine_colecao");
      if (!folder) throw new Error("Erro ZIP");
      await Promise.all(selectedLibraryItems.map(async (id) => {
        const item = library.find(i => i.id === id);
        if (item) {
          const response = await fetch(item.url);
          const blob = await response.blob();
          folder.file(`imagem_${item.id.slice(-6)}.png`, blob);
        }
      }));
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `vitrine_colecao_${Date.now()}.zip`;
      link.click();
      setIsSelectionMode(false);
      setSelectedLibraryItems([]);
    } catch (e) {
      alert("Erro ao gerar ZIP.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportToLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => addToLibrary(reader.result as string, 'uploaded');
      reader.readAsDataURL(file);
    }
  };

  const handleUseFromLibrary = async (item: LibraryItem) => {
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const file = new File([blob], `lib-${item.id}.png`, { type: "image/png" });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHistory([url]);
      setHistoryIndex(0);
      setAnalysisResult(null);
      setEditedImageUrl(null);
      setEditPrompt('');
      setMode(AppMode.ANALYZE_EDIT);
    } catch (e) {
      setError("Erro ao carregar da biblioteca.");
    }
  };

  const handleDeleteFromLibrary = (id: string) => {
    if(window.confirm('Excluir imagem permanentemente?')) setLibrary(prev => prev.filter(item => item.id !== id));
  };

  const NavigationButton = ({ targetMode, label, icon: Icon }: { targetMode: AppMode, label: string, icon: any }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
        mode === targetMode ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      <Icon />
      <span className="ml-2 hidden sm:inline">{label}</span>
    </button>
  );

  if (mode === AppMode.HOME) return <LandingPage onStart={() => setMode(AppMode.ANALYZE_EDIT)} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-10 sm:pb-0 font-sans">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 shrink-0 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">V</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block tracking-tight">Vitrine de Imagens</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 justify-end">
             <div className="flex bg-gray-800 rounded-lg p-1 space-x-1 shrink-0 overflow-x-auto no-scrollbar">
              <NavigationButton targetMode={AppMode.ANALYZE_EDIT} label="Analisar & Editar" icon={IconMagic} />
              <NavigationButton targetMode={AppMode.GENERATE} label="Gerar Nova" icon={IconImage} />
              <NavigationButton targetMode={AppMode.LIBRARY} label="Biblioteca" icon={IconLibrary} />
            </div>
            <div className="border-l border-gray-700 pl-2 sm:pl-4 shrink-0 flex gap-2">
              <Tooltip content="Configurações" position="bottom">
                <button onClick={() => setMode(AppMode.SETTINGS)} className={`p-2 rounded-lg transition-colors ${mode === AppMode.SETTINGS ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}><IconSettings /></button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 flex items-center animate-fade-in"><IconX /><span className="ml-3">{error}</span></div>}

        {mode === AppMode.SETTINGS && (
          <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><IconSettings /><span className="ml-3">Configurações Studio</span></h2>
            
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Chave de API do Gemini</h3>
              <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="AIza..." className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleSaveApiKey} className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-lg transition-colors shadow-lg">Salvar Chave</button>
                <button onClick={handleClearApiKey} className="bg-gray-800 hover:bg-red-900/30 text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-700">Remover</button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Automação Atlas (n8n Webhook)</h3>
              <p className="text-xs text-gray-400 mb-4">Insira o link do seu Webhook (https) para integração com o n8n.</p>
              <input type="text" value={atlasWebhookInput} onChange={(e) => setAtlasWebhookInput(e.target.value)} placeholder="https://..." className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <div className="flex gap-4">
                <button onClick={handleSaveWebhook} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors shadow-lg">Atualizar Webhook</button>
              </div>
            </div>
          </div>
        )}

        {mode === AppMode.ANALYZE_EDIT && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors relative overflow-hidden group ${previewUrl ? 'border-gray-700 bg-gray-900 p-1 min-h-[300px]' : 'border-gray-700 hover:border-primary-500 hover:bg-gray-800/50 cursor-pointer min-h-[350px] p-8'}`} onClick={() => !previewUrl && fileInputRef.current?.click()}>
                <input type="file" id="upload-file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                {previewUrl ? (
                   <div className="w-full relative">
                     <div className="absolute top-2 right-2 z-20 flex gap-2">
                       {historyIndex > 0 && <Tooltip content="Desfazer"><button onClick={handleUndo} className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-xl backdrop-blur-md shadow-xl border border-white/10 transition-all"><IconUndo /></button></Tooltip>}
                       <Tooltip content="Limpar Workspace"><button onClick={handleClearWorkspace} className="bg-red-500/50 hover:bg-red-500/70 text-white p-2.5 rounded-xl backdrop-blur-md shadow-xl border border-white/10 transition-all"><IconX /></button></Tooltip>
                     </div>
                     <ImageRegionSelector imageSrc={previewUrl} enabled={editTab === 'text'} onRegionChange={setTextRegion} onClear={() => setTextRegion(null)} />
                   </div>
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                      <IconUpload />
                    </div>
                    <p className="text-gray-300 font-bold text-lg">Enviar Imagem</p>
                    <p className="text-gray-500 text-sm mt-2">Clique ou arraste um arquivo</p>
                  </div>
                )}
              </div>
              {previewUrl && <button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center shadow-2xl active:scale-95">{loading ? <LoadingSpinner /> : <><IconMagic /><span className="ml-3">Analisar com Gemini 3 Pro Vision</span></>}</button>}
              {analysisResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">DNA da Imagem</span>
                    <IconBrain />
                  </div>
                  <div className="bg-gray-950/60 p-5 rounded-2xl border border-gray-800 text-sm leading-relaxed text-gray-300 shadow-inner italic">
                    {analysisResult.description}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div onClick={() => activateSwapItem('Atmosfera', analysisResult.mood)} className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all hover:translate-y-[-2px] active:scale-95 group">
                      <div className="text-[10px] text-purple-400 font-bold mb-2 uppercase tracking-tighter">Atmosfera</div>
                      <div className="text-white font-medium group-hover:text-purple-300">{analysisResult.mood}</div>
                    </div>
                    <div onClick={() => activateSwapItem('Iluminação', analysisResult.lighting)} className="bg-amber-900/10 p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all hover:translate-y-[-2px] active:scale-95 group">
                      <div className="text-[10px] text-amber-400 font-bold mb-2 uppercase tracking-tighter">Iluminação</div>
                      <div className="text-white font-medium group-hover:text-amber-300">{analysisResult.lighting}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-widest flex items-center"><IconZap /><span className="ml-2">Substituição Inteligente</span></div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.objects.map((obj, i) => (
                        <button key={i} onClick={() => activateSwapItem('Objeto', obj)} className="px-4 py-2 text-xs bg-gray-800/50 hover:bg-blue-900/40 text-gray-300 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all active:scale-95">
                          {obj}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
               <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl lg:sticky lg:top-24">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                   <h3 className="text-lg font-bold text-white flex items-center"><IconEdit /><span className="ml-3">Editor IA Precision</span></h3>
                   <div className="bg-gray-800/80 p-1.5 rounded-2xl flex gap-1 w-full sm:w-auto">
                      <button onClick={() => setEditTab('general')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${editTab === 'general' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Geral</button>
                      <button onClick={() => setEditTab('text')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${editTab === 'text' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><IconType /><span className="ml-2">Texto</span></button>
                   </div>
                 </div>
                 
                 {activeSwapItem && (
                    <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-5 animate-fade-in shadow-2xl">
                       <div className="flex justify-between items-start mb-4">
                          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Inpainting / Substituição</div>
                          <button onClick={cancelSwap} className="text-gray-400 hover:text-white bg-gray-800 p-1 rounded-lg"><IconX /></button>
                       </div>
                       <div className="text-gray-300 text-sm mb-4">Trocar <span className="text-white font-bold italic">"{activeSwapItem.value}"</span> por:</div>
                       <div className="flex flex-col sm:flex-row gap-3">
                          <input type="text" value={swapReplacement} onChange={(e) => setSwapReplacement(e.target.value)} placeholder="Novo elemento..." className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleSmartSwap()} autoFocus />
                          <button onClick={handleSmartSwap} disabled={loading || !swapReplacement} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 shrink-0">Substituir</button>
                       </div>
                    </div>
                 )}

                 <div className="space-y-4">
                   {editTab === 'text' && (
                      <div className="grid grid-cols-1 gap-4 p-5 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                         <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                           <IconType /> Edição Regional de Texto
                         </div>
                         <input type="text" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="Texto original (opcional)" value={textToFind} onChange={(e) => setTextToFind(e.target.value)} />
                         <input type="text" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="Novo texto" value={textToReplace} onChange={(e) => setTextToReplace(e.target.value)} />
                         
                         {textRegion && textToReplace && (
                           <button 
                             onClick={handleEdit} 
                             disabled={loading}
                             className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-xl active:scale-95 mt-2"
                           >
                             {loading ? <LoadingSpinner /> : "Aplicar Alteração Regional"}
                           </button>
                         )}
                      </div>
                   )}
                   <div className="relative">
                     <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Descreva as mudanças (ex: mude o clima para chuvoso, adicione óculos de sol...)" className="w-full bg-gray-950 border border-gray-700 rounded-2xl p-5 text-white outline-none h-40 resize-none text-sm focus:ring-2 focus:ring-primary-500/40 transition-all shadow-inner leading-relaxed" />
                     {!activeSwapItem && (
                       <div className="absolute bottom-4 right-4">
                         <button onClick={handleEdit} disabled={loading || !previewUrl || !editPrompt} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-2xl active:scale-95 disabled:opacity-30">
                           {loading ? 'Processando...' : 'Atualizar Imagem'}
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
               {editedImageUrl && (
                 <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
                   <h3 className="text-lg font-bold text-white mb-5 flex items-center"><IconSparkles /><span className="ml-3">Resultado Studio</span></h3>
                   <ImageComparison before={history[historyIndex - 1] || history[0]} after={editedImageUrl} beforeLabel="Anterior" afterLabel="Atual" />
                   <div className="flex justify-end mt-6">
                     <a href={editedImageUrl} download={`vitrine-studio-${Date.now()}.png`} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl text-sm font-bold border border-white/10 transition-all flex items-center shadow-lg active:scale-95">
                       <IconDownload /><span className="ml-3">Salvar na Máquina</span>
                     </a>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {mode === AppMode.GENERATE && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center"><IconImage /><span className="ml-3">Creation Studio</span></h3>
                 
                 <div className="mb-8">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Presets & Estilos Ativos</label>
                   <div className="grid grid-cols-2 gap-3">
                     {TEMPLATES.map((t) => (
                        <button 
                          key={t.name} 
                          onClick={() => handleApplyTemplate(t)} 
                          className="group relative h-24 w-full rounded-2xl overflow-hidden border border-gray-700 hover:border-primary-500 transition-all flex flex-col justify-end p-3 active:scale-95"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-20 group-hover:opacity-50 transition-opacity`}></div>
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                          <span className="relative text-[11px] font-black text-white z-10 leading-tight drop-shadow-xl text-left uppercase">{t.name}</span>
                        </button>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Protagonista do Prompt</label>
                     <input 
                       type="text" 
                       className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-4 text-white outline-none text-sm focus:ring-2 focus:ring-primary-500/40 transition-all" 
                       placeholder="Ex: Frasco de poção mágica, Carro voador..." 
                       value={genConfig.product} 
                       onChange={(e) => setGenConfig({...genConfig, product: e.target.value, prompt: ''})} 
                     />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atmosfera & Cenário</label>
                       <button onClick={() => addGenField('scenarios')} className="text-primary-400 hover:text-primary-300 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest"><IconPlus /> Novo</button>
                     </div>
                     <div className="space-y-3">
                       {genConfig.scenarios.map((val, idx) => (
                         <div key={idx} className="flex gap-2 group animate-fade-in">
                           <input type="text" className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none text-sm focus:ring-1 focus:ring-primary-500" placeholder="Ex: Galáxia distante" value={val} onChange={(e) => updateGenField('scenarios', idx, e.target.value)} />
                           {genConfig.scenarios.length > 1 && <button onClick={() => removeGenField('scenarios', idx)} className="text-gray-500 hover:text-red-400 transition-colors p-2"><IconTrash /></button>}
                         </div>
                       ))}
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estilização</label>
                       <button onClick={() => addGenField('styles')} className="text-primary-400 hover:text-primary-300 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest"><IconPlus /> Novo</button>
                     </div>
                     <div className="space-y-3">
                       {genConfig.styles.map((val, idx) => (
                         <div key={idx} className="flex gap-2 group animate-fade-in">
                           <input type="text" className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none text-sm focus:ring-1 focus:ring-primary-500" placeholder="Ex: Synthwave, Cubismo" value={val} onChange={(e) => updateGenField('styles', idx, e.target.value)} />
                           {genConfig.styles.length > 1 && <button onClick={() => removeGenField('styles', idx)} className="text-gray-500 hover:text-red-400 transition-colors p-2"><IconTrash /></button>}
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Aspect Ratio</label>
                       <select 
                         value={genConfig.aspectRatio} 
                         onChange={(e) => setGenConfig({...genConfig, aspectRatio: e.target.value as AspectRatio})}
                         className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none text-xs font-bold appearance-none cursor-pointer"
                       >
                         {Object.values(AspectRatio).map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Master Quality</label>
                       <select 
                         value={genConfig.size} 
                         onChange={(e) => setGenConfig({...genConfig, size: e.target.value as ImageSize})}
                         className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none text-xs font-bold appearance-none cursor-pointer"
                       >
                         {Object.values(ImageSize).map(size => <option key={size} value={size}>{size}</option>)}
                       </select>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-gray-800">
                      <div className="bg-gray-950/80 p-5 rounded-2xl border border-gray-800 mb-6 shadow-inner">
                         <div className="text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Semantic Prompt Preview</div>
                         <div className="text-[11px] text-gray-400 leading-relaxed italic line-clamp-4">
                           {constructedPrompt || "Inicie a configuração para ver a estrutura semântica..."}
                         </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleSaveConfig} className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl border border-white/5 transition-all active:scale-95 shadow-xl"><IconSave /></button>
                        <button onClick={handleGenerate} disabled={loading} className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-all shadow-2xl active:scale-95 text-sm uppercase tracking-widest">{loading ? <LoadingSpinner /> : 'Manifestar Imagem'}</button>
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-1.5 flex items-center justify-center min-h-[400px] sm:min-h-[500px] relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {generatedImageUrl ? (
                   <>
                     <div className="absolute top-6 right-6 z-20 flex gap-3">
                       {genHistoryIndex > 0 && <Tooltip content="Desfazer"><button onClick={handleUndoGen} className="bg-black/60 text-white p-3 rounded-2xl backdrop-blur-xl border border-white/10 hover:bg-black/80 transition-all shadow-2xl"><IconUndo /></button></Tooltip>}
                       <Tooltip content="Resetar Studio"><button onClick={handleClearGen} className="bg-red-500/40 text-white p-3 rounded-2xl backdrop-blur-xl border border-white/10 hover:bg-red-500/60 transition-all shadow-2xl"><IconTrash /></button></Tooltip>
                     </div>
                     <img src={generatedImageUrl} alt="Gerada" className="max-w-full rounded-[2.2rem] shadow-2xl object-contain max-h-[80vh] transition-transform duration-500" />
                   </>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-8 mx-auto animate-pulse">
                      <IconImage />
                    </div>
                    <p className="font-bold text-gray-500 text-xl max-w-xs mx-auto">Aguardando coordenadas de criação...</p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center"><IconFilter /><span className="ml-3">Iterative Refining</span></h3>
                    <button onClick={() => setFilterQueue([])} className="text-[10px] text-gray-500 hover:text-red-400 font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2"><IconTrash /> Limpar Fila</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {FILTERS.map((f) => (
                      <Tooltip key={f.name} content={f.description} position="top">
                        <button 
                          onClick={() => handleAddToQueue(f.prompt)} 
                          className={`relative overflow-hidden h-14 w-full rounded-2xl border border-white/5 transition-all hover:scale-[1.03] active:scale-95 group shadow-xl`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-30 group-hover:opacity-60 transition-opacity`}></div>
                          <span className="relative text-[10px] font-black text-white uppercase tracking-widest">{f.name}</span>
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                  <div className="flex gap-3 mb-6">
                    <input type="text" value={genFilterPrompt} onChange={(e) => setGenFilterPrompt(e.target.value)} placeholder="Comando customizado..." className="flex-1 bg-gray-950 border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddToQueue(genFilterPrompt)} />
                    <button onClick={() => handleAddToQueue(genFilterPrompt)} className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl border border-white/5 transition-all shadow-xl active:scale-95"><IconPlus /></button>
                  </div>
                  {filterQueue.length > 0 && (
                    <div className="mb-6 bg-gray-950/80 p-5 rounded-3xl border border-gray-800 space-y-3 max-h-72 overflow-y-auto no-scrollbar shadow-inner">
                       {filterQueue.map((item, idx) => (
                         <div key={item.id} className="group flex items-center gap-4 bg-gray-800/40 p-3 rounded-2xl border border-white/5 animate-fade-in">
                            <span className="w-6 h-6 flex items-center justify-center bg-primary-600/30 text-primary-400 rounded-full text-[10px] font-black shrink-0">{idx+1}</span>
                            {editingFilterId === item.id ? (
                               <div className="flex-1 flex gap-2">
                                  <input type="text" value={editingFilterText} onChange={(e) => setEditingFilterText(e.target.value)} className="flex-1 bg-gray-900 border border-primary-500 rounded-xl px-3 py-2 text-xs text-white outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveFilterEdit()} />
                                  <button onClick={saveFilterEdit} className="text-green-400 text-xs font-black uppercase">OK</button>
                               </div>
                            ) : (
                               <div className="flex-1 text-xs text-gray-400 truncate font-medium cursor-text" onClick={() => startEditingFilter(item)}>{item.text}</div>
                            )}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleMoveFilter(idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-10"><IconArrowUp /></button>
                               <button onClick={() => handleMoveFilter(idx, 'down')} disabled={idx === filterQueue.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-10"><IconArrowDown /></button>
                               <button onClick={() => handleRemoveFromQueue(item.id)} className="p-1.5 text-red-900/40 hover:text-red-400"><IconTrash /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                  <button onClick={handleApplyFilterQueue} disabled={loading || filterQueue.length === 0} className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl disabled:opacity-20 transition-all shadow-2xl active:scale-95 flex items-center justify-center uppercase tracking-[0.2em] text-sm">
                    {loading ? <LoadingSpinner /> : <><IconZap /><span className="ml-4">Re-Sintetizar Imagem</span></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === AppMode.LIBRARY && (
          <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <h2 className="text-3xl font-black text-white flex items-center uppercase tracking-tighter"><IconLibrary /><span className="ml-4">Studio Archives</span></h2>
                <div className="flex flex-wrap gap-3">
                   <button 
                     onClick={handleToggleSelectionMode} 
                     className={`px-6 py-3 rounded-2xl font-bold border transition-all flex items-center gap-3 shadow-xl active:scale-95 ${isSelectionMode ? 'bg-primary-600 text-white border-primary-500' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
                   >
                     <IconStack /><span>{isSelectionMode ? 'Encerrar' : 'Selecionar'}</span>
                   </button>
                   
                   {isSelectionMode && selectedLibraryItems.length > 0 && (
                     <>
                       <button onClick={handleDeleteSelected} className="bg-red-600/90 hover:bg-red-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl transition-all animate-fade-in active:scale-95">
                         <IconTrash /><span>Excluir</span>
                       </button>
                       <button onClick={handleDownloadZip} className="bg-green-600/90 hover:bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl transition-all animate-fade-in active:scale-95">
                         <IconDownload /><span>ZIP Package</span>
                       </button>
                     </>
                   )}
                   
                   {!isSelectionMode && (
                     <button onClick={() => libraryInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-white/5 transition-all active:scale-95">
                       <IconPlus /><span>Importar Assets</span>
                     </button>
                   )}
                   <input type="file" id="lib-import" ref={libraryInputRef} className="hidden" accept="image/*" onChange={handleImportToLibrary} />
                </div>
             </div>
             
             {library.length === 0 ? (
               <div className="text-center py-32 bg-gray-900/50 border-dashed border-2 border-gray-800 rounded-[3rem] text-gray-600 flex flex-col items-center gap-6 shadow-inner">
                 <div className="p-8 bg-gray-800/30 rounded-full">
                    <IconLibrary />
                 </div>
                 <p className="max-w-xs mx-auto font-medium text-lg leading-relaxed">Nenhum asset encontrado nos arquivos. Inicie sua jornada criativa no Studio.</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {library.map((item) => (
                   <div 
                     key={item.id} 
                     className={`group relative aspect-square bg-gray-900 rounded-3xl overflow-hidden border transition-all cursor-pointer shadow-xl ${isSelectionMode && selectedLibraryItems.includes(item.id) ? 'border-primary-500 ring-8 ring-primary-500/20 scale-95' : 'border-gray-800 hover:border-gray-600 hover:translate-y-[-4px]'}`} 
                     onClick={() => isSelectionMode ? handleSelectLibraryItem(item.id) : null}
                   >
                    <img src={item.url} alt="Galeria" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-5 transition-all duration-300 backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-black text-white/70 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">{item.type}</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDeleteFromLibrary(item.id); }} 
                             className="text-white hover:text-red-400 bg-red-600/40 hover:bg-red-600/60 p-2 rounded-xl transition-all border border-red-500/20 shadow-lg"
                           >
                             <IconTrash />
                           </button>
                        </div>
                        <div className="flex flex-col gap-3">
                           <button onClick={(e) => { e.stopPropagation(); handleUseFromLibrary(item); }} className="w-full bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-black py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] uppercase tracking-widest active:scale-95">Abrir no Studio</button>
                        </div>
                      </div>
                    )}
                    {isSelectionMode && (
                      <div className={`absolute top-4 right-4 rounded-2xl p-2 shadow-2xl border transition-all ${selectedLibraryItems.includes(item.id) ? 'bg-primary-500 text-white border-primary-400 scale-110' : 'bg-black/60 text-gray-500 border-white/10'}`}>
                        <IconCheckCircle />
                      </div>
                    )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>
      
      <AtlasConnector 
        currentPrompt={getCurrentPromptContext()} 
        webhookUrl={atlasWebhookInput} 
      />
      <AIChatbot />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          main {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
