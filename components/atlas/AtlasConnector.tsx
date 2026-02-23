import React, { useState } from 'react';
import { IconZap } from '../Icons';
import { Tooltip } from '../Tooltip';
import { logger } from '../../utils/logger';
import { Toast, ToastType } from '../Toast';

interface AtlasConnectorProps {
  currentPrompt?: string;
  webhookUrl: string;
}

export const AtlasConnector: React.FC<AtlasConnectorProps> = ({ currentPrompt, webhookUrl }) => {
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  const falarComAtlas = async (mensagem: string) => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      setToast({ message: "⚠️ Configure um Webhook válido nas opções / .env primeiro.", type: 'error' });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true',
          'X-Atlas-App': 'Vitrine-Studio'
        },
        body: JSON.stringify({
          user: "Jean",
          text: mensagem,
          timestamp: new Date().toISOString(),
          app: "Vitrine de Imagens",
          context: "Studio Advanced Editor"
        })
      });

      if (response.ok) {
        setToast({ message: "✅ Comando enviado com sucesso para o pipeline do n8n.", type: 'success' });
      } else {
        const errorText = await response.text();
        logger.error("Atlas Error Response", errorText);
        setToast({ message: `⚠️ Erro: ${response.status}. Workflow inativo?`, type: 'error' });
      }
    } catch (error) {
      logger.error("Erro ao falar com Atlas", error);

      let errorMessage = "❌ Falha de conexão. O servidor n8n pode estar offfline.";
      if (webhookUrl.includes('loca.lt') || webhookUrl.includes('ngrok')) {
        errorMessage = "Falha no túnel (ngrok/loca.lt). Verifique a conexão.";
      }
      setToast({ message: errorMessage, type: 'error' });

      if (window.confirm("Abrir link do Webhook no navegador para visualizar erros?")) {
        window.open(webhookUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Tooltip content="Disparar Workflow Atlas (n8n)" position="top">
        <button
          onClick={() => falarComAtlas(currentPrompt || "Gerar imagem com parâmetros padrão")}
          className="flex items-center gap-2.5 bg-zinc-900/90 backdrop-blur hover:bg-zinc-800 text-zinc-200 p-3.5 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-900/10 transition-all duration-300 group ring-1 ring-white/5"
        >
          <div className="relative">
             <IconZap className="text-amber-400 group-hover:scale-110 transition-transform duration-300 w-5 h-5" />
             <div className="absolute inset-0 bg-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="font-semibold text-sm hidden md:inline tracking-wide">Flow</span>
        </button>
      </Tooltip>
    </div>
  );
};
