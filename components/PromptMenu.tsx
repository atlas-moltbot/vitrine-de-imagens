import React from 'react';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { ALL_PROMPTS } from '@/src/prompts';

interface PromptMenuProps {
  value: string;
  onChange: (promptText: string) => void;
  className?: string;
}

export const PromptMenu: React.FC<PromptMenuProps> = ({ value, onChange, className = "" }) => {
  return (
      <MultiSelect
        options={ALL_PROMPTS.map((t) => ({
            value: t.name,
            label: t.name,
            category: t.category || "Templates",
        }))}
        value={
            // Tenta encontrar pelo conteúdo do prompt (value) ou pelo nome (caso value seja o nome, o que é raro mas possível em inits)
            ALL_PROMPTS.find(t => (t.prompt === value || t.scenario === value))?.name || ""
        }
        onChange={(val) => {
            // val é o 'value' da option, que mapeamos para t.name
            const template = ALL_PROMPTS.find(t => t.name === val);
            if (template) {
                onChange(template.prompt || template.scenario);
            }
        }}
        single
        placeholder="✨ Carregar Prompt da Galeria..."
        className={className}
      />
  );
};
