import React, { useState, useEffect } from 'react';
import { IconZap, IconX, IconBrain } from './Icons';
import { Skill } from '../types';
import { logger } from '../utils/logger';
import { LoadingSpinner } from './LoadingSpinner';

interface SkillManagerProps {
  onClose: () => void;
}

export const SkillManager: React.FC<SkillManagerProps> = ({ onClose }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch('/skills.json');
      const data = await response.json();
      if (Array.isArray(data)) {
        setSkills(data);
      }
    } catch (e) {
      logger.error("Erro ao carregar skills", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
              <IconZap />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Agent Skills</h3>
              <p className="text-xs text-zinc-500">Capacidades ativas do sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors duration-150" aria-label="Fechar">
            <IconX />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <IconBrain />
              </div>
              <p className="text-sm text-zinc-500">Nenhuma skill encontrada no Hub.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map(skill => (
                <div key={skill.id} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors duration-150">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-zinc-200">{skill.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{skill.description}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600/10 text-indigo-400 text-xs font-semibold rounded-md border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-colors duration-150 shrink-0">
                      Ativa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors duration-150">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
