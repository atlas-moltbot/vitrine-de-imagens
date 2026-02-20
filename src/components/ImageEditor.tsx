import { useState } from 'react';
import { generateDescription, GeminiError } from '../../services/geminiService';

export const ImageEditor = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null); // Limpa erros anteriores
    setResult(null);

    try {
      // Exemplo usando uma URL fictícia. 
      // Se seu serviço espera um File, você precisará ajustar isso.
      const description = await generateDescription("https://via.placeholder.com/150"); 
      setResult(description);

    } catch (err: any) {
      if (err instanceof GeminiError) {
        switch (err.code) {
          case 'QUOTA':
            setErrorMsg("⚠️ Muita calma nessa hora! Espere um pouquinho e tente de novo.");
            break;
          case 'CONTENT':
            setErrorMsg("🛡️ A IA bloqueou esta imagem por motivos de segurança.");
            break;
          case 'UNKNOWN': // Ajustado para bater com os tipos comuns
          case 'NETWORK':
            setErrorMsg("🌐 Erro de conexão ou rede.");
            break;
          default:
            setErrorMsg(`Erro: ${err.message}`);
        }
      } else {
        // Erros que não são do Gemini (ex: erro de lógica no React)
        setErrorMsg("Ocorreu um erro desconhecido no sistema.");
        console.error(err); // Importante logar o erro original
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-white/10 rounded-xl bg-[#111113] text-zinc-100 shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-zinc-100 tracking-tight">Editor de IA (Demo)</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Teste a geração de descrições com tratamento de erros robusto.
        </p>
        
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm flex items-center justify-center"
          title="Gera uma descrição detalhada da imagem usando o Gemini"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </span>
          ) : "Gerar Descrição"}
        </button>
      </div>
      
      {/* Exibição de Erro */}
      {errorMsg && (
        <div className="mt-6 p-4 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 text-sm animate-fade-in flex items-start gap-3">
          <span className="text-lg mt-0.5">⚠️</span>
          <div>
            <p className="font-medium">Erro na Geração</p>
            <p className="opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Exibição do Resultado */}
      {result && (
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg animate-fade-in">
          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 tracking-wider">Resultado</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
};
