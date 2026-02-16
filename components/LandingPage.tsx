import React from 'react';
import { IconBrain, IconZap, IconSparkles, IconImage, IconMagic, IconEdit } from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex flex-col">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-900/20 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse [animation-delay:4s]"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 flex-1 flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary-500/30 bg-primary-900/20 text-primary-300 text-xs font-medium mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Nova Engine Gemini 3 Pro
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            A Nova Era da <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary-500 to-purple-500">
              Criação Visual
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Um estúdio completo de inteligência artificial. Analise estruturas complexas, gere imagens em 4K e edite com precisão semântica usando o poder do Google Gemini.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center">
                Entrar no Studio
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            
            <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white px-6 py-4 font-medium transition-colors">
              Saiba mais sobre o Modelo &rarr;
            </a>
          </div>
        </div>

        {/* Dynamic Visual Mockup */}
        <div className="mt-20 relative max-w-5xl mx-auto perspective-1000 group">
           <div className="relative rounded-xl border border-gray-700 bg-gray-900/80 backdrop-blur-xl shadow-2xl p-2 transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-700 ease-out">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-xl pointer-events-none"></div>
              
              {/* Header Dots */}
              <div className="h-8 bg-gray-800/50 rounded-t-lg flex items-center px-4 space-x-2 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>

              {/* Mock Content */}
              <div className="grid grid-cols-12 gap-4 p-6 h-[400px] overflow-hidden">
                 {/* Sidebar */}
                 <div className="col-span-3 space-y-3">
                    <div className="h-8 w-3/4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-800/50 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-800/50 rounded"></div>
                    <div className="mt-8 h-32 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed"></div>
                 </div>
                 {/* Main Area */}
                 <div className="col-span-9 flex flex-col gap-4">
                    <div className="flex gap-4">
                       <div className="flex-1 h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                             <IconImage />
                          </div>
                          {/* Scan Line Animation */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_3s_ease-in-out_infinite]"></div>
                       </div>
                       <div className="w-1/3 space-y-3">
                          <div className="h-full bg-gray-800/30 rounded-lg border border-gray-700 p-4 space-y-2">
                             <div className="h-2 w-full bg-gray-700 rounded"></div>
                             <div className="h-2 w-5/6 bg-gray-700 rounded"></div>
                             <div className="h-2 w-4/6 bg-gray-700 rounded"></div>
                             <div className="mt-4 flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20"></div>
                                <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Glow Effect behind mockup */}
           <div className="absolute -inset-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl blur-2xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity duration-700"></div>
        </div>

        {/* Features Grid (Bento Style) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
           <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                 <IconBrain />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visão Computacional</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                 Extraia metadados profundos, descrições de cena, paletas de cores e objetos com o Gemini 3 Pro Vision.
              </p>
           </div>

           <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                 <IconSparkles />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Geração 4K</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                 Crie imagens com fidelidade fotorealista, anime ou 3D. Suporte nativo para resoluções de até 4K.
              </p>
           </div>

           <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-colors group">
              <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                 <IconEdit />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Edição Semântica</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                 Altere elementos específicos, mude a iluminação ou substitua objetos usando apenas linguagem natural.
              </p>
           </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-900/50 py-8 mt-20 relative z-10">
         <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Vitrine de Imagens. Powered by Google Gemini API.</p>
         </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};