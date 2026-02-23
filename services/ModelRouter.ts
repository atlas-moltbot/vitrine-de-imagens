/**
 * Model Router - GenAI Model Manager
 * Centralizes the logic for choosing which model to use for which task,
 * abstracting hardcoded strings and preventing 404s from discontinued models.
 */

export type ModelCapability = 
  | 'CHAT_COMPLEX'
  | 'VISION_ANALYZE'
  | 'VISION_SEGMENT'
  | 'IMAGE_GENERATE'
  | 'IMAGE_EDIT'
  | 'FAST_UTILITY';

export class ModelRouter {
  // Configuração centralizada de modelos seguros para Produção
  private static config: Record<ModelCapability, string> = {
    CHAT_COMPLEX: 'gemini-1.5-pro',
    VISION_ANALYZE: 'gemini-1.5-pro', // 1.5 Pro é estável para visão
    VISION_SEGMENT: 'gemini-2.0-flash-exp', // Mantido temporariamente, mas isolado
    IMAGE_GENERATE: 'imagen-4.0-generate-001',
    IMAGE_EDIT: 'imagen-4.0-generate-001',
    FAST_UTILITY: 'gemini-1.5-flash',
  };

  /**
   * Obtém o modelo recomendado para uma funcionalidade
   */
  public static getModel(capability: ModelCapability): string {
    // Se o usuário sobrescreveu o modelo de geração no localStorage, usamos ele
    if (capability === 'IMAGE_GENERATE' || capability === 'IMAGE_EDIT') {
      const userModel = localStorage.getItem("lumina_image_model");
      if (userModel && userModel.includes('imagen')) {
         return userModel;
      }
      return this.config[capability]; // Força Imagen se tentar usar modelo Gemini em Inpaint
    }
    
    return this.config[capability];
  }

  /**
   * Fornece um fallback em caso de falha (ex: 404 de modelo depreciado)
   */
  public static getFallback(failedModel: string): string | null {
    if (failedModel.includes('pro')) return 'gemini-1.5-flash';
    if (failedModel.includes('flash')) return 'gemini-1.5-flash-8b';
    return null;
  }
}
