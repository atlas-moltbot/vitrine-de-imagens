import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  analyzeImage,
  editImage,
  generateImage,
  base64ToFile,
  analyzeRoboticsSpatial,
  segmentObject,
  GeminiError,
} from "@/services/geminiService";
import {
  AnalysisResult,
  AppMode,
  AspectRatio,
  ImageSize,
  GenerationConfig,
  SavedConfig,
  PromptTemplate,
  LibraryItem,
  DesignLayer,
} from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  IconUpload,
  IconMagic,
  IconEdit,
  IconImage,
  IconSave,
  IconDownload,
  IconLibrary,
  IconTrash,
  IconPlus,
  IconFileText,
  IconSettings,
  IconCheckCircle,
  IconArrowDown,
  IconUndo,
  IconX,
  IconZap,
  IconBrain,
  IconSparkles,
  IconEye,
  IconEyeOff,
} from "@/components/Icons";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ImageComparison } from "@/components/ImageComparison";

import { Tooltip } from "@/components/Tooltip";
import { LandingPage } from "@/components/LandingPage";
import { AtlasConnector } from "@/components/AtlasConnector";
import { AIChatbot } from "@/components/AIChatbot";
import { logger } from "@/utils/logger";
import { PromptMenu } from "@/components/PromptMenu";
import { LibraryPage } from "@/components/LibraryPage";
import { ProductPage } from "@/components/ProductPage";
import { Register } from "@/components/Register";

import { ALL_PROMPTS, PRECISION_PRESETS, PRODUCT_PRESETS, FILTERS } from "@/src/prompts";

const TEMPLATES: PromptTemplate[] = [
  ...ALL_PROMPTS,
  {
    name: "Fantasia de Carnaval",
    product: "Uma pessoa com fantasia luxuosa",
    scenario: "Desfile de Carnaval",
    style: "Fantasia Épica",
    lighting: "Explosão de cores",
    gradient: "from-pink-600 to-purple-600",
  },
  {
    name: "IA Futurista",
    product: "Processador quântico",
    scenario: "Laboratório de robótica",
    style: "Sci-fi",
    lighting: "Neon azul",
    gradient: "from-blue-600 to-indigo-800",
  },
];



const App: React.FC = () => {
  const [spatialData, setSpatialData] = useState<DesignLayer[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [atlasWebhookInput, setAtlasWebhookInput] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [editTab, setEditTab] = useState<"general" | "text">("general");
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  const [textToFind, setTextToFind] = useState("");
  const [textToReplace, setTextToReplace] = useState("");

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(
    null,
  );

  const [genConfig, setGenConfig] = useState<GenerationConfig>({
    size: ImageSize.SIZE_1K,
    aspectRatio: AspectRatio.RATIO_16_9,
    prompt: "",
    product: "",
    scenarios: [""],
    styles: [""],
    lightings: [""],
  });

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>(
    [],
  );
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activePrecisionPreset, setActivePrecisionPreset] = useState<string | null>(null);


  const [modelId, setModelId] = useState("gemini-3-pro-image-preview");

  // Estados para metadados da imagem gerada
  const [genTitle, setGenTitle] = useState("");
  const [genDate, setGenDate] = useState("");
  const [genTime, setGenTime] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const productPromptInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // Cleanup de blob URLs para evitar memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (referencePreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(referencePreviewUrl);
    };
  }, [referencePreviewUrl]);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/library.php");
        if (response.ok) setLibrary(await response.json());
      } catch (e) {
        logger.warn("DB não acessível - usando biblioteca local");
      }
    };
    fetchLibrary();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lumina_saved_configs");
    if (saved) setSavedConfigs(JSON.parse(saved));
    const storedKey = localStorage.getItem("lumina_api_key");
    if (storedKey) setApiKeyInput(storedKey);
    const storedModel = localStorage.getItem("lumina_image_model");
    if (storedModel) setModelId(storedModel);
  }, []);

  // Inicializar metadados quando gerar imagem
  useEffect(() => {
    if (generatedImageUrl) {
      setGenTitle("Imagem Gerada");
      const now = new Date();
      // Ajuste básico para local date string YYYY-MM-DD
      const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      setGenDate(local.toISOString().split('T')[0]);
      setGenTime(local.toISOString().split('T')[1].substring(0, 5));
    }
  }, [generatedImageUrl]);

  const constructedPrompt = useMemo(() => {
    if (genConfig.prompt) return genConfig.prompt;
    return `${genConfig.product} ${genConfig.scenarios.join(" ")} ${genConfig.styles.join(" ")}`.trim();
  }, [genConfig]);

  const validateImageFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Formato não suportado. Use PNG, JPEG ou WEBP.";
    }
    if (file.size > maxSize) {
      return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo permitido: 10MB.`;
    }
    return null;
  };

  const handleSpatialAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const data = await analyzeRoboticsSpatial(selectedFile);
      setSpatialData(
        data.map((d: any, i: number) => ({
          id: `l-${i}`,
          label: d.label,
          point: d.point,
        })),
      );
    } catch (err: any) {
      logger.error("Falha na análise espacial", err);
      setError(err.message || "Falha na análise espacial. Verifique a imagem e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = async (
    url: string,
    type: LibraryItem["type"],
    prompt?: string,
    title?: string,
    customTimestamp?: number
  ) => {
    const newItem: LibraryItem = {
      id: Date.now().toString(),
      url,
      type,
      timestamp: customTimestamp || Date.now(),
      prompt,
      title,
    };
    setLibrary((prev) => [newItem, ...prev]);
    try {
      const response = await fetch("/api/library.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("Falha ao salvar no servidor");
    } catch (e) {
      logger.error("Erro ao salvar item na biblioteca remota", e);
      // O item continua no estado local, então não é crítico para UX imediata
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHistory([url]);
      setHistoryIndex(0);
      setSpatialData([]);
      setEditedImageUrl(null);
      const reader = new FileReader();
      reader.onloadend = () =>
        addToLibrary(reader.result as string, "uploaded");
      reader.readAsDataURL(file);
    }
  };

  const handleLibraryImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        addToLibrary(reader.result as string, "uploaded");
        // Reset input para permitir re-upload do mesmo arquivo
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (maskCoords: number[] | null = null) => {
    if (!previewUrl) return;
    setLoading(true);
    try {
      const file = await base64ToFile(previewUrl, "src.png");
      
      // Store current preview as history before editing
      setHistory(prev => [previewUrl, ...prev].slice(0, 10));

      const res = await editImage(file, editPrompt || genConfig.prompt, maskCoords);
      setPreviewUrl(res);
      setEditedImageUrl(res);
      addToLibrary(res, "edited", editPrompt || genConfig.prompt);
    } catch (err: any) {
      logger.error("Falha ao editar imagem", err);
      setError(err.message || "Falha ao editar imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pass referenceFile if available
      const res = await generateImage(
        constructedPrompt,
        genConfig.aspectRatio,
      );
      setGeneratedImageUrl(res);
      // Removido salvamento automático para permitir edição de metadados antes de salvar
      // addToLibrary(res, "generated", constructedPrompt);
    } catch (err: any) {
      if (err instanceof GeminiError) {
        switch (err.code) {
          case 'QUOTA':
            setError("⚠️ Muita calma nessa hora! Espere um pouquinho e tente de novo (Cota excedida).");
            break;
          case 'CONTENT':
            setError("🛡️ A IA bloqueou esta imagem por motivos de segurança.");
            break;
          case 'NOT_FOUND':
             setError("🔍 Modelo não encontrado. Verifique as configurações.");
             break;
          default:
            setError(`Erro na geração: ${err.message}`);
        }
      } else {
        setError(`Erro desconhecido: ${err.message || "Tente novamente."}`);
      }
      logger.error("Falha na geração de imagem", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setReferenceFile(file);
      setReferencePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePromptImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) setGenConfig((prev) => ({ ...prev, prompt: text }));
      };
      reader.readAsText(file);
    }
  };

  const handleProductPromptImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) setEditPrompt(text);
      };
      reader.readAsText(file);
    }
  };

  const savePromptToFile = () => {
    if (!genConfig.prompt) return;
    const blob = new Blob([genConfig.prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prompt-${Date.now()}.txt`;
    link.click();
  };

  const handleUseFromLibrary = async (item: LibraryItem) => {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`Falha ao buscar imagem: ${res.statusText}`);
      const blob = await res.blob();
      const file = new File([blob], `lib-${item.id}.png`, {
        type: "image/png",
      });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHistory([url]);
      setHistoryIndex(0);
      setSpatialData([]);
      setMode(AppMode.ANALYZE_EDIT);
    } catch (e) {
      logger.error("Erro ao carregar imagem da biblioteca", e);
      setError("Não foi possível carregar a imagem selecionada.");
    }
  };

  const handleUsePrompt = (promptText: string, category: string) => {
    if (category === 'analyze') {
       setMode(AppMode.ANALYZE_EDIT);
       return;
    }

    if (category === 'product' || category === 'ecommerce') {
       setGenConfig(prev => ({ ...prev, prompt: promptText }));
       setMode(AppMode.GENERATE);
    } else if (category === 'precision' || category === 'filters') {
       setEditPrompt(promptText);
       setMode(AppMode.ANALYZE_EDIT);
    } else {
       setGenConfig(prev => ({ ...prev, prompt: promptText }));
       setMode(AppMode.GENERATE);
    }
  };

  const NavigationButton = ({ targetMode, label, icon: Icon }: any) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors duration-150 border-b-2 ${mode === targetMode ? "text-zinc-100 border-indigo-500" : "text-zinc-500 hover:text-zinc-300 border-transparent"}`}
    >
      <Icon /> <span className="ml-1.5 hidden sm:inline">{label}</span>
    </button>
  );

  if (mode === AppMode.HOME)
    return <LandingPage onStart={() => setMode(AppMode.ANALYZE_EDIT)} />;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setMode(AppMode.HOME)}
          >
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-bold text-white">
              V
            </div>
            <h1 className="font-semibold tracking-tight text-zinc-200">
              Atlas Studio
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <NavigationButton
              targetMode={AppMode.ANALYZE_EDIT}
              label="Análise"
              icon={IconMagic}
            />
            <NavigationButton
              targetMode={AppMode.GENERATE}
              label="Geração"
              icon={IconImage}
            />
            <NavigationButton
              targetMode={AppMode.PRODUCT_EDIT}
              label="Produto"
              icon={IconZap}
            />
            <NavigationButton
              targetMode={AppMode.LIBRARY}
              label="Biblioteca"
              icon={IconLibrary}
            />
            <button
              onClick={() => setMode(AppMode.SETTINGS)}
              className="ml-2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
              aria-label="Configurações"
            >
              <IconSettings />
            </button>
            <button
              onClick={() => setMode(AppMode.REGISTER)}
              className="ml-2 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-medium rounded-lg border border-indigo-500/20 transition-all"
            >
               Cadastrar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-900/10 border border-red-800/30 rounded-lg px-4 py-3 flex items-center justify-between animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-zinc-500 hover:text-zinc-300 ml-4 transition-colors"
              aria-label="Fechar erro"
            >
              <IconX />
            </button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-3">
              <LoadingSpinner />
              <p className="text-xs text-zinc-500">Processando...</p>
            </div>
          </div>
        )}

        {mode === AppMode.REGISTER && (
          <Register onBack={() => setMode(AppMode.HOME)} />
        )}

        {mode === AppMode.SETTINGS && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-md space-y-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <IconSettings /> Configurações
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                    Google Gemini API Key
                  </label>
                  <div className="flex gap-3">
                    <div className="flex bg-gray-950 border border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/40 transition-all flex-1">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Cole sua API Key aqui..."
                        className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 text-gray-500 hover:text-gray-300 transition-colors"
                        type="button"
                        aria-label={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                      >
                        {showApiKey ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("lumina_api_key", apiKeyInput);
                        setError(null);
                        alert("✅ API Key salva com sucesso!");
                      }}
                      className="bg-primary-600 hover:bg-primary-500 px-6 py-3 rounded-xl text-white font-bold transition-all"
                    >
                      Salvar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Obtenha sua chave em{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline"
                    >
                      aistudio.google.com
                    </a>
                    . A chave é armazenada apenas localmente neste navegador.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                    Modelo de IA (Geração de Imagem)
                  </label>
                  <MultiSelect
                    options={[
                      { value: "gemini-3-pro-image-preview", label: "Gemini 3 Pro Image (Preview)" },
                      { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image" },
                      { value: "imagen-4.0-generate-001", label: "Imagen 4.0 (Standard)" },
                      { value: "imagen-4.0-ultra-generate-001", label: "Imagen 4.0 Ultra (High Quality)" },
                      { value: "imagen-4.0-fast-generate-001", label: "Imagen 4.0 Fast (Low Latency)" },
                    ]}
                    value={modelId}
                    onChange={(val) => {
                      setModelId(val as string);
                      localStorage.setItem("lumina_image_model", val as string);
                    }}
                    single
                    placeholder="Selecionar Modelo"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <b>Gemini 3 Pro:</b> Melhor para seguir instruções complexas. <b>Imagen 4.0 Ultra:</b> Máxima qualidade fotográfica. <b>Fast:</b> Geração rápida.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                    Atlas Webhook URL (Opcional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={atlasWebhookInput}
                      onChange={(e) => setAtlasWebhookInput(e.target.value)}
                      placeholder="https://seu-webhook.com/endpoint"
                      className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem(
                          "lumina_atlas_webhook",
                          atlasWebhookInput,
                        );
                        alert("✅ Webhook salvo!");
                      }}
                      className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl text-white font-bold transition-all"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                  Sobre
                </h3>
                <p className="text-xs text-gray-500">
                  Atlas Studio v0.1.0 — Editor de imagens com IA Gemini
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === AppMode.ANALYZE_EDIT && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-700 bg-gray-900/50 rounded-2xl min-h-[400px] flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => !previewUrl && fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={previewUrl}
                      alt="Imagem carregada para análise"
                      className="max-w-full max-h-[60vh] object-contain rounded-xl"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          setAnalysisResult(null);
                          setEditedImageUrl(null);
                          setSpatialData([]);
                        }}
                        className="bg-red-500/80 p-2 rounded-lg text-white hover:bg-red-600"
                        aria-label="Remover imagem"
                      >
                        <IconTrash />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="bg-primary-600/80 p-2 rounded-lg text-white hover:bg-primary-500"
                        aria-label="Trocar imagem"
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconUpload />
                    </div>
                    <p className="text-gray-400 font-bold tracking-tight">
                      Faça upload de uma imagem
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      PNG, JPG ou WebP (máx 10MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                aria-label="Selecionar arquivo de imagem"
                accept="image/png,image/jpeg,image/webp"
              />

              {previewUrl && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <IconEdit /> Edição com IA
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditTab("general")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editTab === "general" ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400"}`}
                    >
                      Geral
                    </button>
                    <button
                      onClick={() => setEditTab("text")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editTab === "text" ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400"}`}
                    >
                      Texto
                    </button>
                  </div>
                  {editTab === "general" ? (
                    <div className="space-y-3">
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Descreva a edição que deseja fazer na imagem..."
                        className="w-full bg-gray-950 border border-gray-700 rounded-2xl p-4 text-white text-sm outline-none h-24 focus:ring-2 focus:ring-primary-500/40 transition-all"
                      />
                      <button
                        onClick={handleEdit}
                        disabled={loading || !editPrompt}
                        className="w-full bg-primary-600 hover:bg-primary-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                      >
                        {loading ? "Editando..." : "Aplicar Edição"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={textToFind}
                        onChange={(e) => setTextToFind(e.target.value)}
                        placeholder="Texto a encontrar..."
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      />
                      <input
                        type="text"
                        value={textToReplace}
                        onChange={(e) => setTextToReplace(e.target.value)}
                        placeholder="Substituir por..."
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      />
                      <button
                        onClick={() => {
                          setEditPrompt(
                            `Replace text "${textToFind}" with "${textToReplace}"`,
                          );
                          handleEdit();
                        }}
                        disabled={loading || !textToFind}
                        className="w-full bg-primary-600 hover:bg-primary-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                      >
                        {loading ? "Editando..." : "Substituir Texto"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {previewUrl && (
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await analyzeImage(selectedFile!);
                        setAnalysisResult(result);
                      } catch (e) {
                        logger.error("Falha na análise", e);
                        setError("Falha ao analisar imagem.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || !selectedFile}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconMagic /> Analisar
                  </button>
                  <button
                    onClick={() => {
                      if (previewUrl) {
                        const link = document.createElement("a");
                        link.href = previewUrl;
                        link.download = `edited-${Date.now()}.png`;
                        link.click();
                      }
                    }}
                    disabled={!editedImageUrl}
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl text-white transition-all disabled:opacity-50"
                    aria-label="Baixar imagem editada"
                  >
                    <IconDownload />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">

              {analysisResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <IconBrain /> Resultado da Análise
                    </h3>
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Clique para usar na edição</span>
                  </div>
                  <div className="space-y-3">
                    <div
                      onClick={() => {
                        const text = `Descrição: ${analysisResult.description}`;
                        setEditPrompt(prev => prev ? `${prev}\n${text}` : text);
                      }}
                      className={`cursor-pointer rounded-lg p-3 border transition-all duration-150 ${
                        editPrompt.includes(analysisResult.description)
                          ? "border-indigo-500/60 bg-indigo-950/30"
                          : "border-transparent hover:bg-gray-800/60"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                        Descrição
                        {editPrompt.includes(analysisResult.description) && <IconCheckCircle />}
                      </span>
                      <p className="text-sm text-gray-200 mt-1">
                        {analysisResult.description}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block px-3">
                        Objetos
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1 px-3">
                        {analysisResult.objects.map((obj, i) => {
                          const isSelected = editPrompt.includes(obj);
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                const text = `Objeto: ${obj}`;
                                setEditPrompt(prev => prev ? `${prev}\n${text}` : text);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
                                isSelected
                                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 ring-1 ring-indigo-500/20"
                                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-transparent"
                              }`}
                            >
                              {isSelected && "✓ "}{obj}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => {
                          const text = `Clima: ${analysisResult.mood}`;
                          setEditPrompt(prev => prev ? `${prev}\n${text}` : text);
                        }}
                        className={`cursor-pointer rounded-lg p-3 border transition-all duration-150 ${
                          editPrompt.includes(analysisResult.mood)
                            ? "border-indigo-500/60 bg-indigo-950/30"
                            : "border-transparent hover:bg-gray-800/60"
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          Clima
                          {editPrompt.includes(analysisResult.mood) && <IconCheckCircle />}
                        </span>
                        <p className="text-sm text-gray-300 mt-1">
                          {analysisResult.mood}
                        </p>
                      </div>
                      <div
                        onClick={() => {
                          const text = `Iluminação: ${analysisResult.lighting}`;
                          setEditPrompt(prev => prev ? `${prev}\n${text}` : text);
                        }}
                        className={`cursor-pointer rounded-lg p-3 border transition-all duration-150 ${
                          editPrompt.includes(analysisResult.lighting)
                            ? "border-indigo-500/60 bg-indigo-950/30"
                            : "border-transparent hover:bg-gray-800/60"
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          Iluminação
                          {editPrompt.includes(analysisResult.lighting) && <IconCheckCircle />}
                        </span>
                        <p className="text-sm text-gray-300 mt-1">
                          {analysisResult.lighting}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block px-3">
                        Cores Dominantes
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1 px-3">
                        {analysisResult.colors.map((color, i) => {
                          const isSelected = editPrompt.includes(color);
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                const text = `Cor: ${color}`;
                                setEditPrompt(prev => prev ? `${prev}\n${text}` : text);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
                                isSelected
                                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 ring-1 ring-indigo-500/20"
                                  : "bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 hover:text-primary-300"
                              }`}
                            >
                              {isSelected && "✓ "}{color}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {editPrompt && (
                      <button
                        onClick={() => setEditPrompt("")}
                        className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 mt-1"
                      >
                        <IconX /> Limpar Seleção
                      </button>
                    )}
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md space-y-5 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-sm">🎯</div>
                    <div>
                      <h3 className="font-bold text-zinc-100 tracking-tight">Editor IA Precision</h3>
                      <p className="text-[11px] text-zinc-500">Presets inteligentes baseados na análise</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PRECISION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setActivePrecisionPreset(preset.id);
                          setEditPrompt(preset.buildPrompt(analysisResult));
                        }}
                        className={`group relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 text-center ${
                          activePrecisionPreset === preset.id
                            ? "border-indigo-500/60 bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50"
                        }`}
                      >
                        <span className="text-xl">{preset.icon}</span>
                        <span className="text-xs font-semibold text-zinc-200 leading-tight">{preset.name}</span>
                        <span className="text-[10px] text-zinc-500 leading-snug">{preset.description}</span>
                        {activePrecisionPreset === preset.id && (
                          <div className={`absolute -top-px -left-px -right-px h-0.5 rounded-t-xl bg-linear-to-r ${preset.color}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {activePrecisionPreset && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prompt de Precisão</label>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(editPrompt);
                          }}
                          className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-zinc-200 text-sm outline-none h-32 focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none leading-relaxed"
                        placeholder="O prompt de precisão aparecerá aqui..."
                      />
                      <button
                        onClick={handleEdit}
                        disabled={loading || !editPrompt}
                        className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner /> Processando...
                          </>
                        ) : (
                          <>
                            🎯 Aplicar Edição Precision
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {editedImageUrl && history.length > 0 && (
                <ImageComparison
                  before={history[0]}
                  after={editedImageUrl}
                  beforeLabel="Original"
                  afterLabel="Editada"
                />
              )}

              {!analysisResult && !editedImageUrl && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 shadow-md flex flex-col items-center justify-center text-center min-h-[300px]">
                  <IconMagic />
                  <h3 className="text-lg font-bold mt-4 text-gray-400">
                    Análise & Edição com IA
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 max-w-sm">
                    Faça upload de uma imagem para analisar seus elementos,
                    cores e clima, ou edite com prompts de IA.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === AppMode.GENERATE && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <IconImage /> Geração de Imagem
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Prompt
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="w-[200px]">
                      <PromptMenu
                        value={genConfig.prompt}
                        onChange={(val) => setGenConfig(prev => ({ ...prev, prompt: val }))}
                        className="text-xs"
                      />
                    </div>
                    <button
                      onClick={() => promptInputRef.current?.click()}
                      className="text-[10px] bg-gray-800 px-2 py-1 rounded text-white hover:bg-gray-700 flex items-center gap-1 transition-all"
                    >
                      <IconFileText /> Importar
                    </button>
                    <button
                      onClick={savePromptToFile}
                      disabled={!genConfig.prompt}
                      className="text-[10px] bg-gray-800 px-2 py-1 rounded text-white hover:bg-gray-700 flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <IconSave /> Salvar
                    </button>
                  </div>
                </div>
                <textarea
                  value={genConfig.prompt}
                  onChange={(e) =>
                    setGenConfig({ ...genConfig, prompt: e.target.value })
                  }
                  placeholder="Descreva a imagem que deseja gerar..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-2xl p-4 text-white text-sm outline-none h-32 focus:ring-2 focus:ring-primary-500/40 transition-all"
                />
                <input
                  type="file"
                  ref={promptInputRef}
                  className="hidden"
                  accept=".txt"
                  onChange={handlePromptImport}
                  aria-label="Importar prompt de arquivo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Imagem de Referência (Opcional)
                </label>
                <div
                  className="border-2 border-dashed border-gray-700 bg-gray-900/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all relative overflow-hidden h-40"
                  onClick={() => referenceInputRef.current?.click()}
                >
                  {referencePreviewUrl ? (
                    <>
                      <img
                        src={referencePreviewUrl}
                        alt="Imagem de referência"
                        className="h-full object-contain rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReferenceFile(null);
                          setReferencePreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500/80 p-1 rounded-full text-white hover:bg-red-600"
                        aria-label="Remover referência"
                      >
                        <IconX />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <IconUpload />
                      <p className="text-xs mt-2">
                        Clique para adicionar referência
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={referenceInputRef}
                  onChange={handleReferenceSelect}
                  aria-label="Selecionar imagem de referência"
                  accept="image/png,image/jpeg,image/webp"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !genConfig.prompt}
                className="w-full bg-primary-600 hover:bg-primary-500 py-4 rounded-2xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Gerando..." : "Gerar Imagem"}
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md flex items-center justify-center min-h-[400px]">
              {generatedImageUrl ? (
                <div className="flex flex-col w-full h-full gap-4">
                  <div className="relative group flex-1 flex flex-col items-center justify-center bg-gray-950/30 rounded-lg min-h-[300px]">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = generatedImageUrl!;
                          link.download = `generated-${genTitle || Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-gray-800/80 p-2 rounded-lg text-white hover:bg-gray-700 backdrop-blur-sm"
                        aria-label="Baixar imagem"
                      >
                        <IconDownload />
                      </button>
                    </div>
                    {referencePreviewUrl ? (
                      <ImageComparison
                        before={referencePreviewUrl}
                        after={generatedImageUrl}
                        beforeLabel="Referência"
                        afterLabel="Gerada"
                      />
                    ) : (
                      <img
                        src={generatedImageUrl}
                        alt="Imagem gerada por IA"
                        className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
                      />
                    )}
                  </div>

                  <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                      <IconEdit /> Metadados da Imagem
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={genTitle}
                        onChange={(e) => setGenTitle(e.target.value)}
                        placeholder="Título da Imagem"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary-500 transition-colors"
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={genDate}
                          onChange={(e) => setGenDate(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary-500 transition-colors"
                          aria-label="Data da criação"
                        />
                        <input
                          type="time"
                          value={genTime}
                          onChange={(e) => setGenTime(e.target.value)}
                          className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary-500 transition-colors"
                          aria-label="Hora da criação"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!generatedImageUrl) return;
                        const timestamp = new Date(
                          `${genDate}T${genTime}`,
                        ).getTime();
                        addToLibrary(
                          generatedImageUrl,
                          "generated",
                          genConfig.prompt,
                          genTitle,
                          isNaN(timestamp) ? Date.now() : timestamp,
                        );
                        alert(
                          "Imagem salva na biblioteca com os dados informados!",
                        );
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg text-white font-bold transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <IconLibrary /> Salvar na Biblioteca
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <IconImage />
                  <p className="mt-4 font-bold">Sua criação aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === AppMode.PRODUCT_EDIT && (
             <ProductPage
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                editedImageUrl={editedImageUrl}
                setEditedImageUrl={setEditedImageUrl}
                loading={loading}
                setLoading={setLoading}
                handleEdit={handleEdit}
                onUploadClick={() => fileInputRef.current?.click()}
                onClear={() => {
                    setPreviewUrl(null);
                    setEditedImageUrl(null);
                }}
                addToLibrary={(url, type, prompt) => addToLibrary(url, type, prompt, "Edição de Produto", Date.now())}
                history={history}
             />
        )}

        {mode === AppMode.LIBRARY && (
            <LibraryPage
                items={library}
                onImport={() => libraryInputRef.current?.click()}
                onSelect={handleUseFromLibrary}
                onDelete={(id) => {
                    setLibrary(prev => prev.filter(item => item.id !== id));
                    // Opcional: chamar API para deletar no backend também
                }}
                onUsePrompt={handleUsePrompt}
            />
        )}
      </main>
      
      {/* Input hidden para importar imagens na biblioteca */}
      <input
        type="file"
        ref={libraryInputRef}
        className="hidden"
        onChange={handleLibraryImport}
        accept="image/png,image/jpeg,image/webp"
        aria-label="Importar imagem para biblioteca"
      />
      
      <AIChatbot />
    </div>
  );
};

export default App;
