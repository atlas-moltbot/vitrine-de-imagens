import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, AspectRatio, ImageSize } from "../types";

// Helper to check API key
const getClient = () => {
  const localKey = localStorage.getItem("lumina_api_key");
  if (localKey) {
    return new GoogleGenAI({ apiKey: localKey });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Chave API não configurada. Por favor, vá em 'Configurações' e adicione sua Google Gemini API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToFile = async (base64Url: string, filename: string): Promise<File> => {
  const res = await fetch(base64Url);
  const blob = await res.blob();
  return new File([blob], filename, { type: 'image/png' });
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  const ai = getClient();
  const imagePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: imagePart },
        { text: "Analise esta imagem detalhadamente. Forneça o resultado em Português do Brasil. Extraia a descrição da cena, objetos principais, humor, iluminação e cores dominantes." }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Um parágrafo detalhado descrevendo a cena em Português." },
          objects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de objetos visíveis em Português." },
          mood: { type: Type.STRING, description: "A atmosfera emocional em Português." },
          lighting: { type: Type.STRING, description: "Condições de iluminação em Português (ex: Pôr do sol, estúdio)." },
          colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Paleta de cores dominantes em Português." },
        },
        required: ["description", "objects", "mood", "lighting", "colors"],
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Nenhum resultado de análise retornado.");
  return JSON.parse(text) as AnalysisResult;
};

export const editImage = async (originalFile: File, prompt: string): Promise<string> => {
  const ai = getClient();
  const imagePart = await fileToGenerativePart(originalFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: imagePart },
        { text: prompt },
      ]
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Nenhuma imagem gerada a partir da solicitação de edição.");
};

export const generateImage = async (
  prompt: string, 
  size: ImageSize, 
  aspectRatio: AspectRatio
): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: aspectRatio
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Nenhuma imagem gerada.");
};

/**
 * Low-latency response using Gemini 2.5 Flash Lite.
 */
export const fastQuery = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: prompt,
  });
  return response.text || "Sem resposta rápida disponível.";
};

/**
 * Chat with Gemini 3 Pro Preview.
 */
export const startChat = (systemInstruction: string) => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};

/**
 * Search Grounding using Gemini 3 Flash Preview.
 * Returns text and grounding chunks for citations.
 */
export const searchWithGrounding = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, sources };
};