# 📋 Plano Completo de Ajuste e Correção

## Vitrine de Imagens - Atlas Studio

**Data da Análise:** 16 de Fevereiro de 2026  
**Versão do Projeto:** 0.0.0  
**Desenvolvedor:** Jean

---

## 🎯 Resumo Executivo

Este documento apresenta uma análise abrangente do código do projeto **Atlas Studio** (anteriormente Vitrine de Imagens), identificando erros, vulnerabilidades e oportunidades de melhoria. O projeto é uma aplicação React+TypeScript+Vite que utiliza a Google Gemini API para edição, geração e análise de imagens com IA.

### Status Geral do Projeto

- **Estado Atual:** ⚠️ Com problemas de build
- **Complexidade:** Média-Alta
- **Principais Tecnologias:** React 19, TypeScript 5.8, Vite 6.2, Google Gemini API
- **Total de Arquivos Auditados:** 15+ arquivos

---

## 🔍 Problemas Identificados

### 1. ❌ **CRÍTICO: Build Falhando**

**Descrição:**  
O comando `npm run build` está falhando, impedindo a geração do bundle de produção.

**Evidência:**

```
> vitrine-de-imagens@0.0.0 build

vel ou um arquivo em lotes.
```

**Causa Provável:**

- Possível problema com o comando `vite build` no Windows
- Path ou configuração de script incorreta
- Dependências corrompidas

**Prioridade:** 🔴 URGENTE

**Solução:**

1. Verificar integridade do `node_modules`
2. Reinstalar dependências: `npm install`
3. Testar build com verbose: `npm run build -- --debug`
4. Verificar compatibilidade Vite com Windows

---

### 2. ⚠️ **ALTO: Variáveis de Ambiente Não Configuradas**

**Descrição:**  
A aplicação depende de variáveis de ambiente que não estão configuradas corretamente.

**Localização:** `services/geminiService.ts:11`

```typescript
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Chave API não configurada...");
}
```

**Problema:**

- Falta arquivo `.env` ou `.env.local`
- Variável `API_KEY` não está sendo carregada pelo Vite corretamente
- No Vite, variáveis de ambiente precisam do prefixo `VITE_`

**Prioridade:** 🟠 ALTA

**Solução:**

1. Criar arquivo `.env.local` com:

```env
VITE_GOOGLE_GEMINI_API_KEY=sua-chave-aqui
```

2. Atualizar `geminiService.ts`:

```typescript
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
```

3. Adicionar `.env.local` ao `.gitignore`

---

### 3. ⚠️ **MÉDIO: Console.log em Produção**

**Descrição:**  
Existem 4 ocorrências de console.log/warn/error que podem vazar informações em produção.

**Localizações:**

- `components/SkillManager.tsx:27` - `console.error("Erro ao carregar skills")`
- `components/AtlasConnector.tsx:43` - `console.error("Atlas Error Response:", errorText)`
- `components/AtlasConnector.tsx:47` - `console.error("Erro detalhado ao falar com Atlas:", error)`
- `App.tsx:93` - `console.warn("DB not reachable.")`

**Problemas:**

- Exposição de detalhes de erro para usuários finais
- Performance: console.log em loops pode degradar performance
- Segurança: informações sensíveis podem vazar no console

**Prioridade:** 🟡 MÉDIA

**Solução:**
Criar um sistema de logging centralizado:

```typescript
// utils/logger.ts
export const logger = {
  error: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.error(message, data);
    }
    // Em produção, enviar para serviço de monitoramento
  },
  warn: (message: string) => {
    if (import.meta.env.DEV) {
      console.warn(message);
    }
  },
};
```

Substituir todos os `console.*` por `logger.*`

---

### 4. ⚠️ **MÉDIO: Ausência de Tratamento de Erro Consistente**

**Descrição:**  
Múltiplas chamadas à API não têm tratamento adequado de erros.

**Exemplos Problemáticos:**

**App.tsx:162**

```typescript
try {
  const file = await base64ToFile(previewUrl, "src.png");
  const res = await editImage(file, editPrompt || genConfig.prompt);
  setPreviewUrl(res);
  setEditedImageUrl(res);
  addToLibrary(res, "edited", editPrompt || genConfig.prompt);
} catch (err) {
} finally {
  setLoading(false);
}
```

**Problemas:**

- `catch (err) {}` - erro silencioso, usuário não recebe feedback
- Não define `error` state
- Dificulta debugging

**App.tsx:116**

```typescript
} catch (err) { setError("Erro Robotics"); }
```

**Problemas:**

- Mensagem genérica não ajuda o usuário
- Não loga o erro original
- Perde informações valiosas de debug

**Prioridade:** 🟡 MÉDIA-ALTA

**Solução:**

```typescript
// Criar helper de tratamento de erro
const handleApiError = (err: any, userMessage: string) => {
  logger.error(userMessage, err);

  // Mensagens específicas baseadas no erro
  if (err.message?.includes("API key")) {
    setError("Chave API inválida. Configure em Configurações.");
  } else if (err.message?.includes("quota")) {
    setError("Cota da API excedida. Tente novamente mais tarde.");
  } else {
    setError(userMessage);
  }
};

// Uso:
try {
  const res = await editImage(file, prompt);
  setPreviewUrl(res);
} catch (err) {
  handleApiError(err, "Falha ao editar imagem");
} finally {
  setLoading(false);
}
```

---

### 5. ⚠️ **MÉDIO: Prompt do LibraryItem Não é Salvo**

**Descrição:**  
O tipo `LibraryItem` não possui o campo `prompt`, mas é passado na função `addToLibrary`.

**Localização:** `types.ts:65-70`

```typescript
export interface LibraryItem {
  id: string;
  url: string;
  type: "generated" | "edited" | "uploaded";
  timestamp: number;
  // FALTANDO: prompt?: string;
}
```

**App.tsx:139**

```typescript
const addToLibrary = async (url: string, type: LibraryItem['type'], prompt?: string) => {
  const newItem: LibraryItem = {
    id: Date.now().toString(),
    url,
    type,
    timestamp: Date.now(),
    prompt // ❌ TypeScript deveria reclamar aqui
  };
```

**Impacto:**

- Perda de histórico de prompts usados
- Impossível recriar uma imagem com o mesmo prompt
- TypeScript não está detectando o erro (possível problema de configuração)

**Prioridade:** 🟡 MÉDIA

**Solução:**

```typescript
// types.ts
export interface LibraryItem {
  id: string;
  url: string;
  type: "generated" | "edited" | "uploaded";
  timestamp: number;
  prompt?: string; // ✅ Adicionar campo opcional
}
```

---

### 6. ⚠️ **BAIXO-MÉDIO: Falta de Loading States Específicos**

**Descrição:**  
A aplicação usa um único `loading` state para múltiplas operações simultâneas.

**Problema:**

- Usuário não sabe qual operação está em andamento
- Se duas operações rodarem em paralelo, uma pode esconder a outra
- UX inferior

**Exemplo:**

```typescript
const [loading, setLoading] = useState(false);

// Usado para:
// - handleSpatialAnalyze
// - handleExtractLayer
// - handleEdit
// - handleGenerate
```

**Prioridade:** 🟢 BAIXA-MÉDIA

**Solução:**

```typescript
const [loadingStates, setLoadingStates] = useState({
  analyzing: false,
  generating: false,
  editing: false,
  extracting: false,
});

const updateLoading = (key: keyof typeof loadingStates, value: boolean) => {
  setLoadingStates((prev) => ({ ...prev, [key]: value }));
};

// Uso:
const handleGenerate = async () => {
  updateLoading("generating", true);
  try {
    // ...
  } finally {
    updateLoading("generating", false);
  }
};
```

---

### 7. ⚠️ **BAIXO: Falta Validação de Inputs**

**Descrição:**  
Não há validação de entradas do usuário antes de enviar para a API.

**Exemplos:**

**Prompt Vazio:**

```typescript
// App.tsx:337 - botão desabilitado, mas não valida tamanho mínimo
disabled={loading || !genConfig.prompt}
```

**Tamanho de Arquivo:**

- Não há validação de tamanho máximo de imagem
- API pode rejeitar arquivos muito grandes

**Formato de Arquivo:**

- HTML aceita qualquer arquivo: `<input type="file" />`
- Deveria aceitar apenas: `.png, .jpg, .jpeg, .webp`

**Prioridade:** 🟢 BAIXA

**Solução:**

```typescript
const validateImageFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return "Formato não suportado. Use PNG, JPEG ou WEBP.";
  }

  if (file.size > maxSize) {
    return "Arquivo muito grande. Máximo: 10MB.";
  }

  return null;
};

const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const error = validateImageFile(file);
    if (error) {
      setError(error);
      return;
    }
    // ... resto do código
  }
};
```

---

### 8. ⚠️ **BAIXO: Memory Leaks Potenciais**

**Descrição:**  
Uso de `URL.createObjectURL` sem `URL.revokeObjectURL`.

**Localização:** `App.tsx:149, 150, 211`

```typescript
const url = URL.createObjectURL(file);
setPreviewUrl(url);
// ❌ Nunca é revogado - memory leak
```

**Impacto:**

- Vazamento de memória em uso prolongado
- Especialmente problemático ao fazer upload de múltiplas imagens

**Prioridade:** 🟢 BAIXA-MÉDIA

**Solução:**

```typescript
useEffect(() => {
  // Cleanup de URLs quando componente desmonta ou URL muda
  return () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

---

### 9. ⚠️ **BAIXO: Falta de Acessibilidade (a11y)**

**Descrição:**  
Múltiplos problemas de acessibilidade detectados.

**Problemas:**

**Botões sem labels:**

```tsx
<button onClick={() => setMode(AppMode.SETTINGS)} className="p-2">
  <IconSettings />
</button>
```

**Imagens sem alt:**

```tsx
<img src={previewUrl} className="max-w-full" />
```

**Falta de ARIA labels:**

- Modais sem `role="dialog"`
- Botões de fechar sem `aria-label="Fechar"`

**Prioridade:** 🟢 BAIXA

**Solução:**

```tsx
<button
  onClick={() => setMode(AppMode.SETTINGS)}
  className="p-2"
  aria-label="Configurações"
>
  <IconSettings />
</button>

<img
  src={previewUrl}
  alt={analysisResult?.description || "Imagem carregada"}
  className="max-w-full"
/>
```

---

### 10. ⚠️ **INFORMATIVO: Código Não Utilizado**

**Descrição:**  
Existem variáveis e estados declarados mas nunca utilizados.

**Exemplos:**

**App.tsx - Estados não usados:**

```typescript
const [editTab, setEditTab] = useState<"general" | "text">("general");
// ❌ Nunca usado - tab system removido?

const [activeSwapItem, setActiveSwapItem] = useState<{
  type: string;
  value: string;
} | null>(null);
const [swapReplacement, setSwapReplacement] = useState("");
// ❌ Funcionalidade de swap não implementada

const [textToFind, setTextToFind] = useState("");
const [textToReplace, setTextToReplace] = useState("");
const [textRegion, setTextRegion] = useState<number[] | null>(null);
// ❌ Funcionalidade de texto não implementada

const [genFilterPrompt, setGenFilterPrompt] = useState("");
const [filterQueue, setFilterQueue] = useState<any[]>([]);
// ❌ Sistema de fila de filtros não implementado

const [baseGeneratedImageUrl, setBaseGeneratedImageUrl] = useState<
  string | null
>(null);
// ❌ Nunca usado

const [genHistory, setGenHistory] = useState<string[]>([]);
const [genHistoryIndex, setGenHistoryIndex] = useState(-1);
// ❌ Histórico de geração não implementado

const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
// ✅ Carregado do localStorage mas nunca usado na UI
```

**Componentes Importados mas Não Usados:**

```typescript
import { ImageComparison } from "./components/ImageComparison";
import { ImageRegionSelector } from "./components/ImageRegionSelector";
import { AtlasConnector } from "./components/AtlasConnector";
// ❌ Nunca renderizados
```

**Prioridade:** 🔵 INFORMATIVA

**Solução:**

- Remover código morto (dead code)
- Se são funcionalidades planejadas, mover para branch separada
- Reduz tamanho do bundle e melhora manutenibilidade

---

### 11. 🔒 **SEGURANÇA: API Key Exposta no LocalStorage**

**Descrição:**  
A API Key é armazenada em texto puro no localStorage.

**Localização:** `services/geminiService.ts:6`

```typescript
const localKey = localStorage.getItem("lumina_api_key");
```

**Riscos:**

- XSS pode roubar a chave
- Extensions maliciosas podem acessar
- JavaScript injetado pode exfiltrar

**Prioridade:** 🟠 MÉDIA-ALTA (dependendo do contexto de uso)

**Observação:**  
Para aplicações client-side, não há solução 100% segura. Idealmente, a chave deveria estar em um backend.

**Mitigações Possíveis:**

1. **Backend Proxy** (Ideal):

```typescript
// Não armazenar chave no cliente
// Criar API própria que faz proxy para Gemini
fetch("/api/generate", {
  method: "POST",
  body: JSON.stringify({ prompt }),
});
```

2. **Aviso ao Usuário:**

```tsx
<div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded">
  <p className="text-sm">
    ⚠️ <strong>Importante:</strong> Sua API Key é armazenada localmente apenas
    neste navegador e não é enviada para nenhum servidor nosso. Use apenas em
    dispositivos confiáveis.
  </p>
</div>
```

3. **Session Storage ao invés de LocalStorage:**

```typescript
// Chave é perdida ao fechar o navegador
sessionStorage.setItem("lumina_api_key", key);
```

---

### 12. 📦 **ARQUITETURA: Falta de Separação de Responsabilidades**

**Descrição:**  
O arquivo `App.tsx` com 427 linhas está fazendo muitas coisas.

**Problemas:**

- Dificulta manutenção
- Dificulta testes
- Código repetido

**Responsabilidades do App.tsx:**

- Estado global
- Lógica de negócio
- UI de múltiplos modos
- Gerenciamento de histórico
- Interação com API
- Gerenciamento de biblioteca

**Prioridade:** 🟡 MÉDIA (Melhoria de longo prazo)

**Solução Sugerida:**

```
src/
├── App.tsx (apenas roteamento e provider)
├── hooks/
│   ├── useImageEditor.ts
│   ├── useImageGenerator.ts
│   ├── useLibrary.ts
│   └── useSpatialAnalysis.ts
├── pages/
│   ├── GeneratePage.tsx
│   ├── EditPage.tsx
│   ├── MagicGrabPage.tsx
│   └── LibraryPage.tsx
├── components/
│   ├── ImageCanvas/
│   ├── PromptEditor/
│   └── ToolPanel/
└── services/
    └── geminiService.ts
```

---

## 🎯 Plano de Ação Priorizado

### Fase 1: Crítico - Fazer Build Funcionar (1-2 dias)

- [ ] **P1.1:** Reinstalar node_modules
- [ ] **P1.2:** Investigar erro do build
- [ ] **P1.3:** Verificar configuração do Vite
- [ ] **P1.4:** Corrigir variáveis de ambiente (VITE\_ prefix)
- [ ] **P1.5:** Criar arquivo `.env.local` template

### Fase 2: Estabilidade - Tratamento de Erros (2-3 dias)

- [ ] **P2.1:** Implementar sistema de logging centralizado
- [ ] **P2.2:** Substituir todos console.\* por logger
- [ ] **P2.3:** Adicionar tratamento de erro robusto em todas APIs
- [ ] **P2.4:** Criar componente de erro global
- [ ] **P2.5:** Adicionar tipo LibraryItem.prompt

### Fase 3: Qualidade - Validações e UX (2-3 dias)

- [ ] **P3.1:** Implementar validação de arquivos
- [ ] **P3.2:** Adicionar loading states específicos
- [ ] **P3.3:** Implementar cleanup de memory leaks
- [ ] **P3.4:** Melhorar feedback ao usuário
- [ ] **P3.5:** Adicionar toast notifications

### Fase 4: Segurança (1-2 dias)

- [ ] **P4.1:** Avaliar backend proxy para API key
- [ ] **P4.2:** Adicionar avisos de segurança
- [ ] **P4.3:** Implementar Content Security Policy
- [ ] **P4.4:** Audit de dependências: `npm audit`

### Fase 5: Acessibilidade (2 dias)

- [ ] **P5.1:** Adicionar aria-labels em todos botões
- [ ] **P5.2:** Adicionar alt text em imagens
- [ ] **P5.3:** Testar navegação por teclado
- [ ] **P5.4:** Implementar focus management

### Fase 6: Limpeza e Otimização (2-3 dias)

- [ ] **P6.1:** Remover código morto
- [ ] **P6.2:** Remover imports não utilizados
- [ ] **P6.3:** Otimizar re-renders (React.memo)
- [ ] **P6.4:** Code splitting por rota

### Fase 7: Refatoração (Opcional - 1 semana)

- [ ] **P7.1:** Extrair custom hooks
- [ ] **P7.2:** Criar páginas separadas
- [ ] **P7.3:** Implementar Context API para estado global
- [ ] **P7.4:** Melhorar structure de pastas

---

## 📊 Métricas de Qualidade

### Antes da Correção (Estimado)

- ❌ **Build:** Falhando
- ⚠️ **TypeScript Errors:** ~5-10 potenciais
- ⚠️ **Console Statements:** 4
- ⚠️ **Dead Code:** ~200 linhas
- ⚠️ **Memory Leaks:** 3 ocorrências
- ⚠️ **A11y Issues:** 10+

### Meta Após Correção

- ✅ **Build:** Sucesso
- ✅ **TypeScript Errors:** 0
- ✅ **Console Statements:** 0 (em produção)
- ✅ **Dead Code:** 0
- ✅ **Memory Leaks:** 0
- ✅ **A11y Score:** 90+

---

## 🛠️ Ferramentas Recomendadas

### Para Análise Contínua

```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "audit": "npm audit fix"
  }
}
```

### Dependências Dev Recomendadas

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-jsx-a11y  # Acessibilidade
npm install -D vitest @testing-library/react  # Testes
```

---

## 📝 Notas Finais

### Pontos Positivos do Código Atual ✅

- Uso moderno de React Hooks
- TypeScript implementado
- Boa separação de componentes
- UI/UX bem pensada
- Integração com APIs modernas (Gemini)

### Principais Riscos 🚨

1. **Build não funciona** - Bloqueia deploy
2. **Erros silenciosos** - Usuário não recebe feedback
3. **API Key no cliente** - Risco de abuso
4. **Falta de validações** - Possíveis crashes

### Tempo Estimado Total

- **Mínimo (Fases 1-3):** 5-8 dias
- **Completo (Todas fases):** 2-3 semanas

---

## 🤝 Próximos Passos

1. **URGENTE:** Corrigir o build (Fase 1)
2. **IMPORTANTE:** Implementar tratamento de erros (Fase 2)
3. **BOM TER:** Validações e UX (Fase 3)
4. **FUTURO:** Refatoração completa (Fase 7)

---

**Documento preparado por:** Antigravity AI Assistant  
**Para:** Jean - Desenvolvedor Principal  
**Projeto:** Atlas Studio (Vitrine de Imagens)  
**Última atualização:** 2026-02-16
