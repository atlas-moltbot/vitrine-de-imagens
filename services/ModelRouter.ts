/**
 * Model Router - GenAI Model Manager
 * Centralizes the logic for choosing which model to use for which task,
 * abstracting hardcoded strings and preventing 404s from discontinued models.
 * 
 * Modelos atualizados para Fev/2026:
 *   - gemini-3.1-pro-preview   → Mais avançado (agentic, complex)
 *   - gemini-3-flash-preview   → Frontier-class, rápido e poderoso
 *   - gemini-3-pro-preview     → State-of-the-art reasoning + multimodal
 *   - gemini-2.5-flash         → Stable, custo-benefício, reasoning
 *   - gemini-2.5-flash-lite    → Mais rápido e barato da família 2.5
 *   - gemini-2.5-pro           → Stable Pro para tarefas complexas
 *   - imagen-4.0-generate-001  → Geração e edição de imagens
 * 
 * ⚠️ gemini-2.0-flash e gemini-2.0-flash-lite estão DEPRECATED.
 */

export type ModelCapability = 
  | 'CHAT_COMPLEX'
  | 'VISION_ANALYZE'
  | 'VISION_SEGMENT'
  | 'IMAGE_GENERATE'
  | 'IMAGE_EDIT'
  | 'FAST_UTILITY';

export class ModelRouter {
  private static config: Record<ModelCapability, string> = {
    CHAT_COMPLEX: 'gemini-3-flash-preview',       // Chat avançado com reasoning (rápido e frontier)
    VISION_ANALYZE: 'gemini-2.5-flash',            // Visão multimodal estável com reasoning
    VISION_SEGMENT: 'gemini-2.5-flash',            // Segmentação visual estável
    IMAGE_GENERATE: 'imagen-4.0-generate-001',     // Geração de imagens (Imagen 4)
    IMAGE_EDIT: 'imagen-4.0-generate-001',         // Edição de imagens (Imagen 4)
    FAST_UTILITY: 'gemini-2.5-flash-lite',         // Operações rápidas e baratas (tradução, queries simples)
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
      return this.config[capability];
    }
    
    return this.config[capability];
  }

  /**
   * Fornece um fallback em caso de falha (ex: 404 de modelo descontinuado)
   * Cadeia: 3.1-pro → 3-flash → 2.5-flash → 2.5-flash-lite
   */
  public static getFallback(failedModel: string): string | null {
    if (failedModel.includes('3.1-pro')) return 'gemini-3-flash-preview';
    if (failedModel.includes('3-flash')) return 'gemini-2.5-flash';
    if (failedModel.includes('3-pro'))   return 'gemini-2.5-flash';
    if (failedModel.includes('2.5-flash-lite')) return null; // Fim da cadeia
    if (failedModel.includes('2.5-flash')) return 'gemini-2.5-flash-lite';
    if (failedModel.includes('2.5-pro')) return 'gemini-2.5-flash';
    // Fallback genérico
    return 'gemini-2.5-flash';
  }
}

