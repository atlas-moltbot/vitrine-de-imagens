import React from 'react';
import { IconZap } from './Icons';
import { Tooltip } from './Tooltip';

interface AtlasConnectorProps {
  currentPrompt?: string;
  webhookUrl: string;
}

export const AtlasConnector: React.FC<AtlasConnectorProps> = ({ currentPrompt, webhookUrl }) => {
  const falarComAtlas = async (mensagem: string) => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      alert("⚠️ Configure um Webhook válido em 'Configurações' primeiro.");
      return;
    }

    try {
      // Tenta enviar o comando para o webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Cabeçalhos para ignorar páginas de aviso de túneis comuns (Localtunnel, Ngrok, etc)
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
        alert("🚀 Comando enviado para o Atlas com sucesso!");
      } else {
        const errorText = await response.text();
        console.error("Atlas Error Response:", errorText);
        alert(`⚠️ Erro do Servidor: ${response.status}. Verifique se o seu workflow no n8n está ativo.`);
      }
    } catch (error) {
      console.error("Erro detalhado ao falar com Atlas:", error);
      
      // O erro 'Failed to fetch' geralmente ocorre por:
      // 1. URL expirada do Localtunnel/Ngrok
      // 2. n8n offline
      // 3. Bloqueio de CORS no servidor n8n
      // 4. Falta de interação manual com a página de túnel
      
      let errorMessage = "❌ Falha de Conexão: 'Failed to fetch'.";
      
      if (webhookUrl.includes('loca.lt') || webhookUrl.includes('ngrok')) {
        errorMessage += "\n\nPossíveis causas:\n1. O túnel (Localtunnel/Ngrok) expirou ou caiu.\n2. O n8n está desligado.\n3. O túnel exige um clique manual no botão 'Click to Continue' uma vez.";
      }

      alert(errorMessage);
      
      if (window.confirm("Deseja abrir o link do Webhook no navegador para verificar se o serviço está online?")) {
        window.open(webhookUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Tooltip content="Enviar para automação Atlas (n8n)" position="top">
        <button 
          onClick={() => falarComAtlas(currentPrompt || "Gerar imagem de Carnaval")}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:shadow-[0_0_35px_rgba(79,70,229,0.7)] transition-all transform hover:scale-110 active:scale-95 border border-white/20 group"
        >
          <div className="relative">
            <IconZap />
            <div className="absolute inset-0 bg-white rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
          </div>
          <span className="font-bold text-sm pr-2 hidden md:inline">Integrar com Atlas</span>
        </button>
      </Tooltip>
    </div>
  );
};