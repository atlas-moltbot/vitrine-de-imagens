import { PromptTemplate } from "../../types";

export const ECOMMERCE_PROMPTS: PromptTemplate[] = [
  {
    name: "Minimalista Clean",
    prompt: "Mantenha o personagem original inalterado. Mude apenas o cenário para: Fundo branco puro #FFFFFF, iluminação suave de estúdio, sombra realista projetada à esquerda, estilo Apple, alta definição 8k.",
    category: "Estúdio",
    product: "Produto genérico",
    scenario: "Estúdio fotográfico branco minimalista",
    style: "Minimalista, Clean, Fotografia de Produto High-End",
    lighting: "Softbox, Difusa, Natural",
    gradient: "from-gray-100 to-white"
  },
  {
    name: "Luxo Dark Mode",
    prompt: "Mantenha o personagem original inalterado. Mude apenas o cenário para: Fundo preto fosco com textura de pedra ardósia, iluminação lateral dourada (rim light), reflexo sutil na base, atmosfera premium e sofisticada.",
    category: "Luxo",
    product: "Produto de luxo",
    scenario: "Ambiente escuro com texturas nobres",
    style: "Dark Mode, Premium, Sofisticado",
    lighting: "Rim Light, Dourada, Dramática",
    gradient: "from-gray-900 to-black"
  },
  {
    name: "Natureza Orgânica",
    prompt: "Mantenha o personagem original inalterado. Mude apenas o cenário para: Podium de madeira natural cercado por folhas verdes tropicais desfocadas no primeiro plano, luz solar filtrada (dappled light), atmosfera fresca e sustentável.",
    category: "Natureza",
    product: "Produto natural",
    scenario: "Jardim botânico com luz natural",
    style: "Orgânico, Fresco, Sustentável",
    lighting: "Luz Solar, Filtrada, Quente",
    gradient: "from-green-50 to-emerald-100"
  },
  {
    name: "Tech Neon",
    prompt: "Mantenha o personagem original inalterado. Mude apenas o cenário para: Ambiente futurista com luzes neon ciano e magenta, superfície reflexiva de vidro escuro, estilo cyberpunk clean, foco nítido.",
    category: "Tech",
    product: "Gadget tecnológico",
    scenario: "Cenário Cyberpunk abstrato",
    style: "Futurista, Neon, High-Tech",
    lighting: "Neon, Azul, Magenta, Contraste Alto",
    gradient: "from-slate-900 to-indigo-900"
  },
  {
  name: "Face Lock Vogue Paparazzi – Playful Luxury",
  prompt: "Gere uma nova imagem usando a imagem de referência exclusivamente como fonte de identidade facial. O rosto deve permanecer 100% idêntico ao da imagem de referência, sem qualquer alteração. Não recriar, não redesenhar, não reinterpretar, não embelezar, não estilizar, não suavizar e não modificar o rosto de forma alguma. Preserve exatamente a estrutura facial, proporções, traços, textura da pele, tom e subtom de pele, idade, gênero, etnia e identidade. A mulher aparece em um ensaio de capa de revista no estilo Vogue, piscando com o olho esquerdo e fazendo uma expressão divertida de duck-face, mantendo rigorosamente o mesmo rosto original, sem distorções. Ambas as mãos estão erguidas próximas ao rosto formando um gesto de coração. Ela está cercada por múltiplas câmeras DSLR e smartphones apontados para ela como se paparazzi estivessem fotografando de todos os ângulos, com algumas telas exibindo sua imagem ao vivo. Pele com brilho natural e textura realista preservada, maquiagem natural com lábios rosa gloss, blush suave e iluminado discreto, sem alterar o rosto original. Cabelo castanho claro preso em um coque baixo elegante com algumas mechas soltas. Veste um vestido de gala tom bege-branco minimalista sem alças, colar Louis Vuitton, anel de diamante e joias luxuosas. Retrato fashion close-up a meio corpo, iluminação profissional de estúdio cinematográfica, fundo suave em HDR com profundidade de campo rasa e bokeh delicado. Aparência fotográfica profissional com lente 85mm, abertura f/1.8, foco nítido no rosto e fundo suavemente desfocado. Layout de capa de revista com logotipo grande no topo e composição editorial limpa e elegante. Prioridade absoluta para preservação da identidade facial acima de estética, realismo ou criatividade.",
  category: "Presets Identity Lock",
  product: "Image-to-Image Face Reference",
  scenario: "Capa de revista fashion com paparazzi e gesto de coração",
  style: "Photorealistic, Vogue Editorial, Face Lock, Identity Preservation, Luxury Fashion",
  lighting: "Professional Studio Lighting, Soft Cinematic Light on Face",
  gradient: "from-neutral-200 to-stone-400"
},
{
  name: "Face Lock Tropical Beach – Smiling",
  prompt: "Gere uma nova imagem usando a imagem de referência exclusivamente como fonte de identidade facial. O rosto deve permanecer 100% idêntico ao da imagem de referência, sem qualquer alteração. Não recriar, não redesenhar, não reinterpretar, não embelezar, não estilizar, não suavizar e não modificar o rosto de forma alguma. Preserve exatamente a estrutura facial, proporções, traços, textura da pele, tom e subtom de pele, idade, gênero, etnia e identidade. A expressão facial deve ser um sorriso radiante, mantendo o mesmo rosto original sem distorções. A mulher está em uma praia ensolarada, vestindo um vestido colorido ou um biquíni estampado em tons de laranja e azul, transmitindo uma vibração alegre e descontraída. O fundo apresenta palmeiras e um céu azul claro. A luz do sol realça o bronzeado natural e a beleza natural, sem alterar o rosto. O cenário captura um ambiente tropical, atmosfera leve e relaxada, perfeito para um dia ensolarado à beira-mar. Prioridade absoluta para preservação da identidade facial acima de estética, realismo ou criatividade.",
  category: "Presets Identity Lock",
  product: "Image-to-Image Face Reference",
  scenario: "Praia tropical ensolarada com sorriso natural",
  style: "Photorealistic, Tropical, Face Lock, Identity Preservation",
  lighting: "Natural Sunlight, Soft and Even on Face",
  gradient: "from-sky-400 to-blue-300"
},
  {
    name: "Cozinha Gourmet",
    prompt: "Mantenha o personagem original inalterado. Mude apenas o cenário para: Bancada de mármore carrara, ingredientes frescos desfocados ao fundo (limão, ervas), luz natural da manhã vindo da janela lateral, estilo editorial de culinária.",
    category: "Gourmet",
    product: "Alimento ou utensílio",
    scenario: "Cozinha moderna iluminada",
    style: "Editorial, Lifestyle, Apetitoso",
    lighting: "Luz da Manhã, Natural, Brilhante",
    gradient: "from-orange-50 to-white"
  }
];
