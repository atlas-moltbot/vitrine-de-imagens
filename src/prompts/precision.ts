import { AnalysisResult } from "../../types";

export interface PrecisionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  buildPrompt: (analysis: AnalysisResult) => string;
}

export const PRECISION_PRESETS: PrecisionPreset[] = [
  {
    id: "swap-bg",
    name: "Trocar Fundo",
    description: "Troca o fundo preservando 100% do sujeito original.",
    icon: "🖼️",
    color: "from-violet-600 to-indigo-600",
    buildPrompt: (analysis: AnalysisResult) =>
      `PRESERVAÇÃO ABSOLUTA DO SUJEITO: ${analysis.description}. Objetos detectados: ${analysis.objects.join(", ")}. Manter iluminação ${analysis.lighting} e cores originais (${analysis.colors.join(", ")}). NÃO altere o sujeito sob nenhuma circunstância — identidade, rosto, traços faciais, corpo, proporções, roupas, cores, textura, estilo visual e pose. EDIÇÃO CONTROLADA: Remova o fundo original e substitua por um ambiente de estúdio profissional com fundo gradiente suave, iluminação direcionada e profundidade de campo rasa.`,
  },
  {
    id: "fix-lighting",
    name: "Correção de Luz",
    description: "Ajusta iluminação com base na análise da imagem.",
    icon: "💡",
    color: "from-amber-500 to-yellow-500",
    buildPrompt: (analysis: AnalysisResult) =>
      `PRESERVAÇÃO ABSOLUTA: Mantenha todos os elementos da imagem 100% inalterados — sujeito, objetos (${analysis.objects.join(", ")}), cores (${analysis.colors.join(", ")}), composição e pose. A iluminação atual é: ${analysis.lighting}. Clima atual: ${analysis.mood}. EDIÇÃO CONTROLADA: Aprimore sutilmente a iluminação para torná-la mais profissional e equilibrada. Adicione key light suave à esquerda, fill light difusa à direita e rim light sutil para separação do fundo. Mantenha naturalidade.`,
  },
  {
    id: "isolate-object",
    name: "Isolar Objeto",
    description: "Isola um objeto detectado com fundo limpo.",
    icon: "🔍",
    color: "from-emerald-500 to-teal-500",
    buildPrompt: (analysis: AnalysisResult) =>
      `ANÁLISE: Objetos detectados na imagem: ${analysis.objects.join(", ")}. PRESERVAÇÃO ABSOLUTA: Mantenha o objeto principal 100% inalterado — cores (${analysis.colors.join(", ")}), texturas e detalhes. EDIÇÃO CONTROLADA: Isole o objeto principal em um fundo branco puro #FFFFFF infinito, com sombra de contato suave e realista na base. Estilo packshot profissional para e-commerce.`,
  },
  {
    id: "style-transfer",
    name: "Transfer Estilo",
    description: "Aplica estilo artístico mantendo composição.",
    icon: "🎨",
    color: "from-pink-500 to-rose-500",
    buildPrompt: (analysis: AnalysisResult) =>
      `PRESERVAÇÃO DA COMPOSIÇÃO: ${analysis.description}. Objetos: ${analysis.objects.join(", ")}. Manter a estrutura, posição e proporção de todos os elementos. EDIÇÃO CONTROLADA: Transforme o estilo visual da imagem para uma estética editorial de alta moda. Aplicar color grading cinematográfico com tons ${analysis.mood === "Alegre" || analysis.mood === "Vibrante" ? "quentes e vibrantes" : "frios e sofisticados"}. Manter a iluminação ${analysis.lighting} como base mas intensificar contraste e profundidade.`,
  },
  {
    id: "enhance-comp",
    name: "Composição+",
    description: "Melhora enquadramento e balanço visual.",
    icon: "📐",
    color: "from-sky-500 to-blue-500",
    buildPrompt: (analysis: AnalysisResult) =>
      `ANÁLISE DA COMPOSIÇÃO ATUAL: ${analysis.description}. Iluminação: ${analysis.lighting}. Clima: ${analysis.mood}. Cores dominantes: ${analysis.colors.join(", ")}. PRESERVAÇÃO ABSOLUTA: Mantenha o sujeito e todos os objetos (${analysis.objects.join(", ")}) 100% inalterados. EDIÇÃO CONTROLADA: Aprimore a composição expandindo levemente o enquadramento, adicionando espaço negativo estratégico, melhorando a regra dos terços e garantindo que o ponto focal esteja otimizado. Manter o estilo visual original.`,
  },
  {
    id: "smart-focus",
    name: "Foco Inteligente",
    description: "Preservação total + fundo de galeria moderna.",
    icon: "🎯",
    color: "from-neutral-400 to-neutral-600",
    buildPrompt: (analysis: AnalysisResult) =>
      `PASSO 1 [ANÁLISE]: Sujeito identificado: ${analysis.description}. Objetos: ${analysis.objects.join(", ")}. PASSO 2 [PRESERVAÇÃO ABSOLUTA]: Mantenha o sujeito identificado 100% inalterado — identidade, rosto, traços faciais, corpo, proporções, roupas, cores (${analysis.colors.join(", ")}), textura, estilo visual e pose. Não modifique o sujeito sob nenhuma circunstância. PASSO 3 [EDIÇÃO CONTROLADA]: Altere exclusivamente o fundo e o entorno para: ambiente de galeria de arte moderna, paredes brancas levemente texturizadas, iluminação museológica direcionada no ambiente, profundidade de campo suave. A iluminação do sujeito deve permanecer exatamente como na imagem original (${analysis.lighting}).`,
  },
];
