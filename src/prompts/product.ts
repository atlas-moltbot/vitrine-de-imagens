import { IconBrain, IconZap, IconTrash, IconSparkles } from "../../components/Icons";

export const PRODUCT_PRESETS = [
  {
    name: "Análise Nutricional AR",
    description: "Interface holográfica de Realidade Aumentada.",
    prompt: "Add floating AR holographic nutrition UI.",
    icon: IconBrain,
    color: "from-blue-500 to-cyan-400",
  },
  {
    name: "Explosão de Areia",
    description: "Efeito cinematográfico de poeira.",
    prompt: "Add cinematic dust explosion around the product.",
    icon: IconZap,
    color: "from-amber-600 to-orange-400",
  },
  {
    name: "Remover Fundo (Isolado)",
    description: "Produto em fundo branco puro.",
    prompt: "Remove background, product centered on pure white #ffffff.",
    icon: IconTrash,
    color: "from-slate-100 to-white",
  },
  {
    name: "3D Pop-Out Social",
    description: "Efeito 3D saindo do frame Instagram.",
    prompt:
      'A photorealistic fashion upper body shot of a beautiful young woman with a confident expression wearing a chic leather jacket and silk scarf. The subject is framed inside a central white Instagram-style post border. Composition & Spacing: The white frame is perfectly centered in the middle of the image, leaving balanced empty soft pastel pink space above and below the frame. Frame Details: The top, left, and right white borders are very thin. The bottom white section is thicker to include UI elements (heart, comment, share, bookmark). Text Details: "1,234 likes", username "fashion_icon_99", caption "Living my best life...". 3D Pop-Out Effect: Head and arms are physically popping out OVER the top and side borders. Hands gripping the outer edges. Subject Dimensionality: Solid 3D figure, distinct depth from background. Professional studio lighting, soft realistic drop shadows cast by the frame and hands.',
    icon: IconSparkles,
    color: "from-pink-500 to-rose-400",
  },
];
