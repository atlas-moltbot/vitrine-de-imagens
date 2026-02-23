import React from 'react';
import { 
  IconBrain, IconSparkles, IconEdit, IconImage, IconZap, 
  IconCheckCircle, IconArrowRight, IconLayers 
} from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full opacity-50 mix-blend-screen animate-pulse duration-5000"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-violet-600/5 blur-[100px] rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">V</div>
             <span className="font-semibold text-lg tracking-tight">Atlas Studio</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
             <a href="#features" className="hover:text-zinc-200 transition-colors">Recursos</a>
             <a href="#showcase" className="hover:text-zinc-200 transition-colors">Showcase</a>
             <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition-colors">Gemini 3</a>
          </nav>
          <button 
            onClick={onStart}
            className="px-5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium rounded-lg transition-all hover:bg-zinc-800"
          >
            Entrar
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center pt-20 pb-32 px-6">
           
           {/* Badge */}
           <div className="animate-fade-in-up delay-100">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Powered by Gemini 3 Flash & Imagen 4
             </div>
           </div>

           {/* Hero Text */}
           <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-400 animate-fade-in-up delay-200">
                 Design inteligente <br/> para criadores modernos.
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                 A plataforma definitiva para criar, editar e analisar imagens com IA. 
                 Combine visão computacional avançada com geração de alta fidelidade em um só lugar.
              </p>
           </div>

           {/* CTA Buttons */}
           <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-500">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 flex items-center gap-2 group"
              >
                Começar a Criar
                <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onStart} // Or scroll to demo
                className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <IconImage />
                Ver Galeria
              </button>
           </div>

           {/* Showcase Image / UI Mockup */}
           <div className="mt-24 w-full max-w-6xl mx-auto animate-fade-in-up delay-700">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-2 shadow-2xl relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-violet-500 rounded-3xl opacity-20 blur-lg -z-10"></div>
                  
                  {/* Fake UI Header */}
                  <div className="h-10 bg-zinc-950/50 rounded-t-xl border-b border-zinc-800 flex items-center px-4 gap-2 mb-2">
                     <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                     </div>
                     <div className="mx-auto w-64 h-6 bg-zinc-800/50 rounded-md flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                        atlas-studio.dev/workspace/edit
                     </div>
                  </div>

                  {/* UI Content - Abstract Representation */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 h-[300px] md:h-[500px] overflow-hidden">
                      {/* Sidebar */}
                      <div className="hidden md:flex col-span-3 flex-col gap-3">
                          <div className="h-32 bg-zinc-800/30 rounded-lg animate-pulse"></div>
                          <div className="h-12 bg-zinc-800/30 rounded-lg animate-pulse delay-75"></div>
                          <div className="h-12 bg-zinc-800/30 rounded-lg animate-pulse delay-100"></div>
                          <div className="flex-1 bg-zinc-800/20 rounded-lg border border-zinc-800/50 border-dashed"></div>
                      </div>
                      
                      {/* Main Canvas */}
                      <div className="col-span-12 md:col-span-9 bg-zinc-950 rounded-xl border border-zinc-800 relative flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
                          <div className="relative z-10 text-center space-y-4">
                             <div className="w-24 h-24 bg-indigo-500/20 rounded-2xl mx-auto flex items-center justify-center border border-indigo-500/30">
                                <IconSparkles className="w-10 h-10 text-indigo-400" />
                             </div>
                             <p className="text-zinc-500 text-sm font-mono">Inicializando Workspace IA...</p>
                          </div>
                          
                          {/* Floating Elements */}
                          <div className="absolute top-10 left-10 bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl animate-bounce duration-3000">
                              <div className="text-xs text-zinc-400 mb-1">Análise de Cena</div>
                              <div className="flex gap-2 text-indigo-400 text-xs font-bold"><IconBrain size={14}/> 98% Precisão</div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* Features Grid */}
           <div id="features" className="mt-32 w-full max-w-6xl mx-auto">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold mb-4">Potência Criativa Ilimitada</h2>
                 <p className="text-zinc-400">Tudo o que você precisa para transformar ideias em realidade visual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <FeatureCard 
                    icon={IconBrain}
                    title="Visão Computacional"
                    desc="Entendimento profundo de imagens. Detecte objetos, analise iluminação e extraia paletas de cores automaticamente."
                    delayClass=""
                 />
                 <FeatureCard 
                    icon={IconZap}
                    title="Geração Ultra-Rápida"
                    desc="Crie visuais impressionantes em segundos com o novo Imagen 4 Fast e Gemini Flash."
                    delayClass="delay-100"
                 />
                 <FeatureCard 
                    icon={IconEdit}
                    title="Edição Semântica"
                    desc="Esqueça máscaras complexas. Descreva o que você quer mudar e deixe a IA cuidar dos pixels."
                    delayClass="delay-200"
                 />
                   <FeatureCard 
                    icon={IconLayers}
                    title="Design System"
                    desc="Interface minimalista focada no conteúdo. O design 'Quiet Intelligence' remove distrações."
                    delayClass="delay-300"
                 />
                 <FeatureCard 
                    icon={IconCheckCircle}
                    title="Workflow Profissional"
                    desc="Histórico de sessões, biblioteca de prompts e comparação de versões lado a lado."
                    delayClass="delay-500"
                 />
                 <FeatureCard 
                    icon={IconSparkles}
                    title="Upscaling & Detalhes"
                    desc="Melhore a qualidade de suas imagens com algoritmos de super-resolução inteligentes."
                    delayClass="delay-700"
                 />
              </div>
           </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 bg-zinc-950 py-12 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-zinc-800 rounded-md flex items-center justify-center text-xs font-bold text-zinc-400">V</div>
                 <span className="font-medium text-zinc-400 text-sm">Atlas Studio &copy; 2026</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">v1.0</span>
              </div>
              <div className="flex gap-6 text-sm text-zinc-500">
                 <a href="#" className="hover:text-zinc-300">Privacidade</a>
                 <a href="#" className="hover:text-zinc-300">Termos</a>
                 <a href="https://twitter.com/googledeepmind" className="hover:text-zinc-300">Twitter</a>
              </div>
           </div>
        </footer>

      </div>
    </div>
  );
};

// Helper Component for Features
const FeatureCard = ({ icon: Icon, title, desc, delayClass }: { icon: any, title: string, desc: string, delayClass: string }) => (
  <div 
     className={`bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-900/60 hover:border-indigo-500/30 transition-all duration-300 group animate-fade-in-up ${delayClass}`} 
  >
     <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
        <Icon size={24} />
     </div>
     <h3 className="text-lg font-bold text-zinc-200 mb-2 group-hover:text-indigo-200 transition-colors">{title}</h3>
     <p className="text-sm text-zinc-500 leading-relaxed font-medium">{desc}</p>
  </div>
);