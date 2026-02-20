import React, { useState } from 'react';
import { IconZap } from './Icons';
import { Tooltip } from './Tooltip';
import { logger } from '../utils/logger';
import { Toast, ToastType } from './Toast';

interface AtlasConnectorProps {
  currentPrompt?: string;
  webhookUrl: string;
}

export const AtlasConnector: React.FC<AtlasConnectorProps> = ({ currentPrompt, webhookUrl }) => {
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  const falarComAtlas = async (mensagem: string) => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      setToast({ message: "⚠️ Configure um Webhook válido primeiro.", type: 'error' });
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
        setToast({ message: "✅ Comando enviado para o Atlas.", type: 'success' });
      } else {
        const errorText = await response.text();
        logger.error("Atlas Error Response", errorText);
        setToast({ message: `⚠️ Erro: ${response.status}. Workflow inativo?`, type: 'error' });
      }
    } catch (error) {
      logger.error("Erro ao falar com Atlas", error);

      let errorMessage = "❌ Falha de conexão.";
      if (webhookUrl.includes('loca.lt') || webhookUrl.includes('ngrok')) {
        errorMessage = "Falha no túnel (ngrok/loca.lt). Verifique a conexão.";
      }
      setToast({ message: errorMessage, type: 'error' });

      if (window.confirm("Abrir link do Webhook no navegador?")) {
        window.open(webhookUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Tooltip content="Enviar para Atlas (n8n)" position="top">
        <button
          onClick={() => falarComAtlas(currentPrompt || "Gerar imagem de Carnaval")}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-3 rounded-lg border border-zinc-700 transition-colors duration-150"
        >
          <IconZap />
          <span className="font-medium text-sm hidden md:inline">Atlas</span>
        </button>
      </Tooltip>
    </div>
  );
};