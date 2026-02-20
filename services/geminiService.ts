import { GoogleGenAI, Type, SafetyFilterLevel, PersonGeneration } from "@google/genai";
import { AspectRatio, AnalysisResult } from "../types";
import { logger } from "../utils/logger";

/* ============================================================
   CLIENT
============================================================ */

const getClient = (): GoogleGenAI => {
  const localKey = localStorage.getItem("lumina_api_key");
  const envKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

  const apiKey = localKey || envKey;

  if (!apiKey) {
    throw new Error(
      "Chave API não configurada. Configure sua Google API Key.",
    );
  }

  return new GoogleGenAI({ apiKey });
};

/* ============================================================
   ERROR
============================================================ */

export class GeminiError extends Error {
  constructor(
    public message: string,
    public code: "QUOTA" | "CONTENT" | "GENERIC" | "NOT_FOUND" | "UNKNOWN" | "NETWORK",
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

const handleGeminiError = (error: any): never => {
  logger.error("Gemini API Error", error);

  const msg =
    error?.message ||
    error?.error?.message ||
    JSON.stringify(error);

  if (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted")
  ) {
    throw new GeminiError(
      "Cota excedida. Tente novamente mais tarde.",
      "QUOTA",
    );
  }

  if (
    msg.includes("safety") ||
    msg.includes("blocked") ||
    msg.includes("content_filter")
  ) {
    throw new GeminiError(
      "Conteúdo bloqueado pelos filtros de segurança.",
      "CONTENT",
    );
  }

  if (msg.includes("404")) {
    throw new GeminiError(
      "Modelo não encontrado ou sem permissão.",
      "NOT_FOUND",
    );
  }

  throw new GeminiError(msg, "GENERIC");
};

/* ============================================================
   SUPPORTED MODELS
============================================================ */

const GEMINI_IMAGE_MODELS = [
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
];

const IMAGEN_MODELS = [
  "imagen-4.0-generate-001",
  "imagen-4.0-ultra-generate-001",
  "imagen-4.0-fast-generate-001",
];

/* ============================================================
   HELPER FUNCTIONS (Restored)
============================================================ */

export const fileToGenerativePart = async (
  file: File,
  ): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToFile = async (
  base64Url: string,
  filename: string,
  ): Promise<File> => {
  const res = await fetch(base64Url);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
};

/* ============================================================
   IMAGE ANALYSIS & EDITING (Restored)
============================================================ */

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
      const ai = getClient();
      const imagePart = await fileToGenerativePart(file);

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            { inlineData: imagePart },
            {
              text: "Analise esta imagem detalhadamente. Forneça o resultado em Português do Brasil. Extraia a descrição da cena, objetos principais, humor, iluminação e cores dominantes.",
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description:
                  "Um parágrafo detalhado descrevendo a cena em Português.",
              },
              objects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de objetos visíveis em Português.",
              },
              mood: {
                type: Type.STRING,
                description: "A atmosfera emocional em Português.",
              },
              lighting: {
                type: Type.STRING,
                description:
                  "Condições de iluminação em Português (ex: Pôr do sol, estúdio).",
              },
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Paleta de cores dominantes em Português.",
              },
            },
            required: ["description", "objects", "mood", "lighting", "colors"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("Nenhum resultado de análise retornado.");
      return JSON.parse(text) as AnalysisResult;
  } catch(e) {
      handleGeminiError(e);
  }
};

export const editImage = async (
  originalFile: File,
  prompt: string,
  maskCoords: number[] | null = null
  ): Promise<string> => {
  const ai = getClient();
  const imagePart = await fileToGenerativePart(originalFile);
  
  const modelId = localStorage.getItem("lumina_image_model") || "imagen-4.0-generate-001";

  // If coordinates are provided, enhance the prompt for spatial grounding
  const enhancedPrompt = maskCoords 
    ? `${prompt}. Focus the edit execution only on the region described by coordinates [ymin, xmin, ymax, xmax]: [${maskCoords.join(', ')}].`
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: imagePart }, 
          { text: enhancedPrompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData && part.inlineData.data) {
         return `data:image/png;base64,${part.inlineData.data}`;
       }
    }
    
    logger.warn("Modelo retornou texto em vez de imagem: " + (response.text || "(vazio)"));
    if (modelId.includes("imagen") || modelId.includes("image") || modelId.includes("preview")) {
        throw new GeminiError(`O modelo selecionado (${modelId}) não retornou imagem. Verifique se ele suporta geração de imagem na sua conta.`, "GENERIC");
    }
    throw new GeminiError(`O modelo atual (${modelId}) apenas descreve a edição. Selecione um modelo de geração de imagem (ex: Imagen 4) nas Configurações.`, "GENERIC");

  } catch (e: any) {
    if (e instanceof GeminiError) throw e;
    logger.error("Erro na API Gemini (editImage)", e);
    
    if (e.message?.includes("404") || e.status === 404) {
        throw new GeminiError(`Modelo '${modelId}' não encontrado. Selecione outro nas Configurações.`, "NOT_FOUND");
    }
    handleGeminiError(e);
  }
};

export const analyzeRoboticsSpatial = async (file: File) => {
  try {
      const ai = getClient();
      const imagePart = await fileToGenerativePart(file);

      const prompt =
        'Point to all items in the image. The label returned should be an identifying name for the object detected. The answer should follow the json format: [{"point": [y, x], "label": "label"}, ...]. The points are in [y, x] format normalized to 0-1000.';

      const response = await ai.models.generateContent({
        model: "gemini-robotics-er-1.5-preview", // Check if this model is still valid/generic enough? Assuming yes.
        contents: {
          parts: [{ inlineData: imagePart }, { text: prompt }],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) throw new Error("Nenhum dado retornado pelo modelo Robotics.");
      return JSON.parse(text);
  } catch(e) {
      handleGeminiError(e);
  }
};

export const segmentObject = async (
  file: File,
  label: string,
  ): Promise<string> => {
  try {
      const ai = getClient();
      const imagePart = await fileToGenerativePart(file);

      const prompt = `Segment the object "${label}" precisely. Return the object as an image part with a transparent background. Deliver the base64 result.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: {
          parts: [{ inlineData: imagePart }, { text: prompt }],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("Falha ao segmentar objeto.");
  } catch(e) {
      handleGeminiError(e);
  }
};


export const translateToPortuguese = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [{ text: `Aja como um tradutor profissional. Traduza o seguinte prompt de geração de imagem do Inglês para o Português do Brasil. Mantenha os termos técnicos de fotografia/design em inglês se for padrão da indústria, mas adapte a descrição da cena para PT-BR.\n\nTexto: "${text}"` }]
      }
    });

    return response.text?.trim() || text;
  } catch (e) {
    logger.error("Erro na tradução", e);
    return text;
  }
};


/* ============================================================
   IMAGE GENERATION
============================================================ */

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
): Promise<string> => {
  const ai = getClient();

  const selectedModel =
    localStorage.getItem("lumina_image_model") ||
    "imagen-4.0-generate-001";

  try {
    /* =============================
       IMAGEN MODELS
    ============================== */
   if (IMAGEN_MODELS.includes(selectedModel)) {
  const response = await ai.models.generateImages({
    model: selectedModel,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: aspectRatio.toString(),
      // REMOVIDO:
      // safetyFilterLevel
      // personGeneration
    },
  });

  const image = response.generatedImages?.[0];

  if (!image?.image?.imageBytes) {
    throw new Error(
      "Modelo Imagen não retornou imagem válida.",
    );
  }

  return `data:image/png;base64,${image.image.imageBytes}`;
}
    /* =============================
       GEMINI IMAGE MODELS
    ============================== */
    if (GEMINI_IMAGE_MODELS.includes(selectedModel)) {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
      });

      const parts =
        response.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error(
        "Modelo Gemini não retornou imagem inlineData.",
      );
    }

    throw new GeminiError(
      `Modelo não suportado: ${selectedModel}`,
      "NOT_FOUND",
    );
  } catch (e) {
    handleGeminiError(e);
  }
};

/**
 * Low-latency response using Gemini 2.5 Flash Lite.
 */
export const fastQuery = async (prompt: string): Promise<string> => {
  try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: prompt,
      });
      return response.text || "Sem resposta rápida disponível.";
  } catch(e) {
      handleGeminiError(e);
  }
};

/**
 * Chat with Gemini 3 Pro Preview.
 */
export const startChat = (systemInstruction: string) => {
  const ai = getClient();
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
};

/**
 * Search Grounding using Gemini 3 Flash Preview.
 * Returns text and grounding chunks for citations.
 */
export const searchWithGrounding = async (query: string) => {
  try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      const sources =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text, sources };
  } catch(e) {
      handleGeminiError(e);
  }
};

export const generateDescription = async (
  imageInput: File | string,
  prompt: string = "Atue como um especialista em e-commerce. Crie uma descrição curta e atraente para este produto."
): Promise<string> => {
    try {
        let imagePart: { mimeType: string, data: string };
        
        if (imageInput instanceof File) {
            if (imageInput.size > 4 * 1024 * 1024) {
                throw new GeminiError("A imagem é muito grande. Por favor, use uma imagem menor que 4MB.", "GENERIC");
            }
            imagePart = await fileToGenerativePart(imageInput);
        } else if (imageInput.startsWith('data:')) {
            const base64Data = imageInput.split(',')[1];
            const mimeType = imageInput.split(';')[0].split(':')[1];
            imagePart = { mimeType, data: base64Data };
        } else {
             try {
                const resp = await fetch(imageInput);
                const blob = await resp.blob();
                imagePart = await fileToGenerativePart(new File([blob], "image.png", { type: blob.type }));
             } catch(err) {
                 throw new GeminiError("Falha ao processar imagem para análise.", "GENERIC");
             }
        }

        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash", // Modelo atualizado conforme solicitação
            contents: {
                parts: [
                    { inlineData: imagePart },
                    { text: prompt }
                ]
            }
        });
        
        return response.text || "Sem descrição disponível.";
    } catch (e) {
        if (e instanceof GeminiError) throw e;
        handleGeminiError(e);
    }
};
