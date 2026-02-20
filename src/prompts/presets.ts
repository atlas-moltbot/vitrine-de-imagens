import { PromptTemplate } from "../../types";

export const PRESETS_PROMPTS: PromptTemplate[] = [
  {
    name: "Análise Nutricional AR",
    prompt: "Adicione uma interface holográfica futurista flutuando ao lado do produto, mostrando dados nutricionais e gráficos em estilo AR (Realidade Aumentada).",
    category: "Presets Tech",
    product: "Produto com AR",
    scenario: "Fundo neutro tecnológico",
    style: "Futurista, Holográfico, UI Blue",
    lighting: "Neon Cyan",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    name: "Explosão de Areia",
    prompt: "Crie uma explosão cinematográfica de areia e poeira dourada ao redor do produto, dando uma sensação de impacto e movimento dinâmico.",
    category: "Presets Efeitos",
    product: "Produto em movimento",
    scenario: "Deserto estilizado",
    style: "Cinematográfico, Ação, Alta Velocidade",
    lighting: "Dourada, Contraste Alto",
    gradient: "from-amber-600 to-orange-400"
  },
  {
    name: "Remover Fundo (Isolado)",
    prompt: "Remova completamente o fundo original. Coloque o produto centralizado sobre um fundo branco puro #FFFFFF infinito, com uma sombra de contato suave e realista na base.",
    category: "Presets Util",
    product: "Produto isolado",
    scenario: "Fundo branco infinito",
    style: "Packshot, E-commerce Padrão",
    lighting: "Softbox Estúdio",
    gradient: "from-white to-gray-100"
  },
  {
    name: "3D Pop-Out Social",
    prompt: "Crie um efeito de 'Pop-Out' 3D onde o produto parece estar saindo fisicamente de uma moldura de postagem do Instagram. Adicione elementos de UI social flutuando.",
    category: "Presets Social",
    product: "Produto 3D",
    scenario: "Moldura Instagram estilizada",
    style: "3D, Pop-surrealism, Social Media",
    lighting: "Ring Light",
    gradient: "from-pink-500 to-rose-400"
  },
  {
    name: "Black Friday Sale",
    prompt: "Adicione elementos gráficos de 'Black Friday' e 'Oferta' em neon vermelho e preto ao fundo, com confetes escuros caindo. Atmosfera de urgência e promoção.",
    category: "Presets Vendas",
    product: "Produto em oferta",
    scenario: "Fundo promocional dark",
    style: "Varejo, Promocional, Bold",
    lighting: "Vermelho Dramático",
    gradient: "from-red-900 to-black"
  },
  {
    name: "Foco Inteligente (Preservação Total)",
    prompt: "PASSO 1 [ANÁLISE]: Analise a imagem original e identifique o sujeito central (produto, rosto ou corpo inteiro). PASSO 2 [PRESERVAÇÃO ABSOLUTA]: Mantenha o sujeito identificado 100% inalterado — identidade, rosto, traços faciais, corpo, proporções, roupas, cores, textura, estilo visual e pose. Não modifique o sujeito sob nenhuma circunstância. PASSO 3 [EDIÇÃO CONTROLADA]: Altere exclusivamente o fundo e o entorno para: ambiente de galeria de arte moderna, paredes brancas levemente texturizadas, iluminação museológica direcionada no ambiente, profundidade de campo suave. A iluminação do sujeito deve permanecer exatamente como na imagem original.",
    category: "Presets Profissional", 
    product: "Retrato ou Produto Complexo",
    scenario: "Galeria de Arte Moderna",
    style: "Analítico, Preciso, Fotorrealista",
    lighting: "Direcionada, Museológica, Suave",
    gradient: "from-neutral-100 to-neutral-300"
  }
];
