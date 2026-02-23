import { AspectRatio, AnalysisResult } from "../types";
import { logger } from "../utils/logger";
import { ModelRouter, ModelCapability } from "./ModelRouter";

// Detectamos se é local ou prod pelo host
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const PROXY_URL = isLocal ? "http://localhost:8000/api/gemini.php" : "/api/gemini.php"; 

export class GeminiError extends Error {
  constructor(
    public message: string,
    public code: "QUOTA" | "CONTENT" | "GENERIC" | "NOT_FOUND" | "NETWORK" | "TIMEOUT",
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

/**
 * Parses generic proxy/API errors into user-friendly GeminiError.
 */
const handleGeminiError = (error: any): never => {
  logger.error("Gemini API Error", error);

  const msg =
    error?.message ||
    error?.error?.message ||
    JSON.stringify(error);

  if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
    throw new GeminiError("Cota excedida ou limite de requisições atingido. Tente novamente em instantes.", "QUOTA");
  }

  if (msg.includes("safety") || msg.includes("blocked") || msg.includes("content_filter")) {
    throw new GeminiError("Conteúdo bloqueado pelos filtros de segurança.", "CONTENT");
  }

  if (msg.includes("404") || msg.includes("not found")) {
    throw new GeminiError("Modelo não encontrado ou acesso restrito.", "NOT_FOUND");
  }

  if (error.name === "AbortError" || msg.includes("network") || msg.includes("fetch")) {
    throw new GeminiError("Erro de rede ou timeout na conexão com a IA.", "NETWORK");
  }

  throw new GeminiError(msg, "GENERIC");
};

/**
 * Fetch with Exponential Backoff + Timeout
 */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<any> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
         if (response.status === 429 && attempt < maxRetries) {
            // Rate limited, wait and retry
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            await new Promise(r => setTimeout(r, delay));
            attempt++;
            continue;
         }
         throw new Error(data.error?.message || data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (attempt >= maxRetries || error.name === 'AbortError') {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
}

/**
 * Standard Proxy Caller
 */
async function callProxy(capability: ModelCapability, endpoint: 'generateContent' | 'generateImages', payload: any) {
  let model = ModelRouter.getModel(capability);
  
  // Define if this call belongs to the Chatbot/Atlas
  const isChat = capability === 'CHAT_COMPLEX' || capability === 'FAST_UTILITY';

  try {
      return await fetchWithRetry(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, model, payload, isChat }),
      });
  } catch (error: any) {
      // Automatic Fallback Check logic for 404
      if (error.message?.includes('404')) {
         const fallbackModel = ModelRouter.getFallback(model);
         if (fallbackModel) {
            logger.warn(`Modelo ${model} falhou com 404. Tentando fallback para ${fallbackModel}.`);
            return await fetchWithRetry(PROXY_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint, model: fallbackModel, payload, isChat }),
            });
         }
      }
      throw error;
  }
}

/* ============================================================
   HELPER FUNCTIONS
============================================================ */

export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      resolve({ mimeType: file.type, data: base64Data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToFile = async (base64Url: string, filename: string): Promise<File> => {
  const res = await fetch(base64Url);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
};

/* ============================================================
   IMAGE ANALYSIS & EDITING
============================================================ */

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
      const imagePart = await fileToGenerativePart(file);
      const payload = {
        contents: [{
          parts: [
            { inlineData: imagePart },
            { text: "Analise esta imagem detalhadamente. Forneça o resultado em Português do Brasil. Extraia a descrição da cena, objetos principais, humor, iluminação e cores dominantes." }
          ]
        }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            // Removed thinking config to save budget since 1.5-pro can do JSON out of the box
        }
      };

      const data = await callProxy('VISION_ANALYZE', 'generateContent', payload);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("Nenhum resultado de análise retornado.");
      return JSON.parse(text) as AnalysisResult;
  } catch(e) {
      handleGeminiError(e);
  }
};

export const editImage = async (originalFile: File, prompt: string, maskCoords: number[] | null = null): Promise<string> => {
  const imagePart = await fileToGenerativePart(originalFile);
  
  // Imagens via Imagen usam generateImages e o SDK é diferente no backend via REST.
  // Para Imagen, o endpoint generateImages na v1beta pede instancias.
  // Como construímos o proxy para repassar o payload cru, passamos o payload de Imagen:
  const payload = {
    instances: [
        { prompt: maskCoords ? `${prompt} [Region: ${maskCoords.join(', ')}]` : prompt, image: { bytesBase64Encoded: imagePart.data } }
    ],
    parameters: { sampleCount: 1 }
  };

  try {
    const data = await callProxy('IMAGE_EDIT', 'generateImages', payload);
    const generatedImageBase64 = data?.predictions?.[0]?.bytesBase64Encoded;
    
    if (generatedImageBase64) {
      return `data:image/png;base64,${generatedImageBase64}`;
    }
    throw new GeminiError("O modelo selecionado não retornou a imagem base64 esperada.", "GENERIC");
  } catch (e: any) {
    handleGeminiError(e);
  }
};

export const analyzeRoboticsSpatial = async (file: File) => {
  try {
      const imagePart = await fileToGenerativePart(file);
      const prompt = 'Point to all items in the image. The label returned should be an identifying name for the object detected. The answer should follow the json format: [{"point": [y, x], "label": "label"}, ...]. The points are in [y, x] format normalized to 0-1000.';

      const payload = {
        contents: [{ parts: [{ inlineData: imagePart }, { text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const data = await callProxy('VISION_SEGMENT', 'generateContent', payload);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Nenhum dado retornado.");
      return JSON.parse(text);
  } catch(e) {
      handleGeminiError(e);
  }
};

export const segmentObject = async (file: File, label: string): Promise<string> => {
  try {
      const imagePart = await fileToGenerativePart(file);
      const prompt = `Segment the object "${label}" precisely. Return the object as an image part with a transparent background. Deliver the base64 result.`;

      const payload = {
        contents: [{ parts: [{ inlineData: imagePart }, { text: prompt }] }]
      };

      const data = await callProxy('VISION_SEGMENT', 'generateContent', payload);
      for (const part of data?.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Falha ao segmentar objeto.");
  } catch(e) {
      handleGeminiError(e);
  }
};

/* ============================================================
   TRANSLATION SEPARATION
============================================================ */

export const translatePromptToEnglishForImagen = async (text: string): Promise<string> => {
  try {
    const payload = {
      contents: [{ parts: [{ text: `Act as a professional photography translator. Translate the following image generation prompt from Portuguese to English. Maintain professional photography and design terminology.\n\nText: "${text}"` }] }]
    };
    const data = await callProxy('FAST_UTILITY', 'generateContent', payload);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
  } catch (e) {
    logger.error("Erro na tradução para Inglês", e);
    return text;
  }
};

export const translatePromptToPtBrForUser = async (text: string): Promise<string> => {
  try {
    const payload = {
      contents: [{ parts: [{ text: `Traduza de volta para Português do Brasil com tom natural e claro.\n\nTexto: "${text}"` }] }]
    };
    const data = await callProxy('FAST_UTILITY', 'generateContent', payload);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
  } catch (e) {
    logger.error("Erro na tradução para PT-BR", e);
    return text;
  }
};


/* ============================================================
   IMAGE GENERATION
============================================================ */

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
      // Always use IMAGE_GENERATE capability (Imagen models)
      const englishPrompt = await translatePromptToEnglishForImagen(prompt);
      
      const payload = {
        instances: [{ prompt: englishPrompt }],
        parameters: { sampleCount: 1, aspectRatio: aspectRatio.toString() }
      };

      const data = await callProxy('IMAGE_GENERATE', 'generateImages', payload);
      const imageBytes = data?.predictions?.[0]?.bytesBase64Encoded;

      if (!imageBytes) {
        throw new Error("Modelo não retornou imagem válida.");
      }
      return `data:image/png;base64,${imageBytes}`;
  } catch (e) {
    handleGeminiError(e);
  }
};

/* ============================================================
   UTILITIES
============================================================ */

export const fastQuery = async (prompt: string): Promise<string> => {
  try {
      const payload = { contents: [{ parts: [{ text: prompt }] }] };
      const data = await callProxy('FAST_UTILITY', 'generateContent', payload);
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta rápida disponível.";
  } catch(e) {
      handleGeminiError(e);
  }
};

/**
 * Chat Simulation - For real chat sessions, passing history manually
 */
export const startChat = (systemInstruction: string) => {
   let history: any[] = [];
   
   return {
      sendMessage: async (params: { message: string, fileParts?: { mimeType: string, data: string }[] }) => {
         const parts: any[] = [{ text: params.message }];
         if (params.fileParts) {
             params.fileParts.forEach(p => parts.push({ inlineData: p }));
         }
         history.push({ role: 'user', parts });
         
         const payload = {
             systemInstruction: { parts: [{ text: systemInstruction }] },
             contents: history,
         };
         
         const data = await callProxy('CHAT_COMPLEX', 'generateContent', payload);
         const textObj = data?.candidates?.[0]?.content?.parts?.[0];
         const textOut = textObj?.text || "";
         
         if (textOut) {
            history.push({ role: 'model', parts: [{ text: textOut }] });
         }
         return { text: textOut };
      }
   };
};

export const searchWithGrounding = async (query: string) => {
  try {
      const payload = {
         contents: [{ parts: [{ text: query }] }],
         tools: [{ googleSearch: {} }] // Requesting grounding
      };
      const data = await callProxy('FAST_UTILITY', 'generateContent', payload);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const sources = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text, sources };
  } catch(e) {
      handleGeminiError(e);
  }
};

export const generateDescription = async (imageInput: File | string, prompt: string = "Atue como um especialista em e-commerce. Crie uma descrição curta e atraente para este produto."): Promise<string> => {
    try {
        let imagePart: { mimeType: string, data: string };
        if (imageInput instanceof File) {
            imagePart = await fileToGenerativePart(imageInput);
        } else if (imageInput.startsWith('data:')) {
            const base64Data = imageInput.split(',')[1];
            const mimeType = imageInput.split(';')[0].split(':')[1];
            imagePart = { mimeType, data: base64Data };
        } else {
             const resp = await fetch(imageInput);
             const blob = await resp.blob();
             imagePart = await fileToGenerativePart(new File([blob], "image.png", { type: blob.type }));
        }

        const payload = {
           contents: [{ parts: [{ inlineData: imagePart }, { text: prompt }] }]
        };
        const data = await callProxy('FAST_UTILITY', 'generateContent', payload);
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem descrição disponível.";
    } catch (e) {
        if (e instanceof GeminiError) throw e;
        handleGeminiError(e);
    }
};
