# 🎨 Atlas Studio — Design System

> **"Quiet Intelligence"** — Minimalista, sofisticado e atemporal.

---

## 🎯 Filosofia de Design

O Atlas Studio adota uma estética **minimalista, sofisticada e atemporal**, baseada no conceito de **"Quiet Intelligence"**. O visual privilegia tons escuros neutros, contrastes refinados e um accent indigo desaturado usado com **moderação**.

A interface elimina excessos visuais como glows constantes, gradientes vibrantes e efeitos chamativos, priorizando **clareza**, **hierarquia tipográfica elegante** e **espaçamento generoso**.

### Princípios
1. **Silêncio Visual** — Cada elemento ganha importância pelo espaço ao redor, não pelo brilho
2. **Precisão** — Sombras sutis, bordas discretas, cantos levemente arredondados
3. **Funcionalidade** — Microinterações suaves e funcionais, sem distração
4. **Maturidade** — Presença forte porém silenciosa — moderna e refinada

### O que **NÃO** fazemos
- ❌ Glows constantes ou pulsantes
- ❌ Gradientes vibrantes ou neon
- ❌ Animações exageradas ou chamativas
- ❌ Bordas brilhantes ou rainbow
- ❌ Excesso de sombras ou elevação

---

## 🌈 Paleta de Cores

### Backgrounds (Neutros escuros, não preto puro)
| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#09090b` | Fundo principal (quase preto) |
| `--bg-surface` | `#111113` | Cards, painéis |
| `--bg-elevated` | `#18181b` | Inputs, áreas interativas |
| `--bg-hover` | `#1f1f23` | Hover states |

### Accent (Indigo desaturado — usado com moderação)
| Token | Hex | Uso |
|-------|-----|-----|
| `--accent` | `#6366f1` | Ações primárias, indicadores ativos |
| `--accent-subtle` | `rgba(99,102,241,0.08)` | Backgrounds de hover sutil |
| `--accent-text` | `#a5b4fc` | Texto de destaque (raro) |

### Borders (Quase invisíveis)
| Token | Hex | Uso |
|-------|-----|-----|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Separadores, cards |
| `--border-default` | `rgba(255,255,255,0.10)` | Inputs, dividers |
| `--border-focus` | `rgba(99,102,241,0.40)` | Focus rings |

### Semantic (Desaturados)
| Token | Hex | Uso |
|-------|-----|-----|
| `--success` | `#22c55e` | Confirmações |
| `--warning` | `#eab308` | Avisos |
| `--error` | `#dc2626` | Erros |

### Text (Hierarquia clara)
| Token | Hex | Uso |
|-------|-----|-----|
| `--text-primary` | `#fafafa` | Texto principal |
| `--text-secondary` | `#a1a1aa` | Texto auxiliar |
| `--text-muted` | `#52525b` | Labels, placeholders, desabilitados |

---

## 🔤 Tipografia

**Font:** Inter — limpa, legível, profissional.

| Uso | Weight | Size | Tracking |
|-----|--------|------|----------|
| Page Title | 700 | 1.875rem (30px) | -0.025em |
| Section Title | 600 | 1.125rem (18px) | -0.015em |
| Body | 400 | 0.875rem (14px) | 0 |
| Caption / Label | 500 | 0.75rem (12px) | 0.025em |
| Badge | 600 | 0.625rem (10px) | 0.05em |

> Tracking negativo nos títulos cria sensação de solidez. Tracking positivo em labels/badges melhora legibilidade em tamanhos pequenos.

---

## 📐 Espaçamento & Forma

### Border Radius (Sutil, não "bubbly")
| Value | Uso |
|-------|-----|
| 6px | Inputs, badges, tags |
| 8px | Botões, select |
| 12px | Cards, modals |
| 16px | Áreas de upload |

### Sombras (Quase imperceptíveis)
```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.2);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.15);
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);
```

> Nada de box-shadow exagerado. A profundidade é dada por diferença de background, não por sombra.

---

## ✨ Interações

### Transições (Rápidas e funcionais)
- `transition: all 150ms ease` — Interações rápidas (hover, focus)
- `transition: all 200ms ease-out` — Entradas de elementos
- `transition: opacity 300ms ease` — Fade in/out

### Hover States
- **Botões:** Fundo levemente aclarado (`--bg-hover`)
- **Cards:** Borda levemente mais visível (`opacity: 0.06 → 0.12`)
- **Links:** Underline aparece suavemente

### Focus
- `outline: 2px solid var(--border-focus)` + `outline-offset: 2px`
- Sem glow. Apenas borda sólida sutil.

### Loading
- Spinner simples: anel em rotação, cor accent, sem glow
- Skeleton: retângulos `--bg-elevated` com shimmer muito sutil

---

## 🧩 Componentes — Diretrizes

| Componente | Direção de Design |
|------------|-------------------|
| **Navbar** | Fixa, fundo sólido `--bg-surface`, borda inferior `--border-subtle`. Tab ativa = text accent + underline 2px. Sem blur. |
| **Botões** | Primary: fundo `--accent`, text white, hover levemente claro. Secondary: fundo transparente, border `--border-default`, text `--text-secondary`. Sem shimmer. |
| **Cards** | Fundo `--bg-surface`, borda `--border-subtle`, radius 12px. Hover: borda clareia sutilmente. |
| **Upload Zone** | Borda dashed `--border-default`, ícone centralizado muted. Hover: borda clareia. Sem animação de borda. |
| **Inputs** | Fundo `--bg-elevated`, borda `--border-default`. Focus: borda accent com ring sutil. Placeholder muted. |
| **Modals** | Fundo `--bg-surface`, overlay `rgba(0,0,0,0.6)`. Entrada com fade 200ms. Sem glassmorphism pesado. |
| **Toast** | Fundo `--bg-surface`, borda sutil, ícone semântico. Auto-dismiss 4s. Sem animação exagerada. |
| **Chatbot** | Janela com fundo `--bg-surface`, borda `--border-subtle`. Mensagens com padding generoso. Typing = 3 dots discretos. |
| **Spinner** | Anel fino em rotação, cor accent, background transparente. Sem glow ou partículas. |
| **Gallery** | Grid limpo, hover com scale 1.02 e borda clareia. Sem tilt 3D ou overlay gradient. |
| **Landing** | Título grande (700 weight), subtítulo `--text-secondary`, CTA accent sólido. Background limpo, sem partículas. |

---

## 🔗 Referências

- [21st.dev](https://21st.dev) — Biblioteca de componentes React
- [Tailwind CSS v4](https://tailwindcss.com) — Framework CSS
- [Inter Font](https://fonts.google.com/specimen/Inter) — Tipografia
- [Radix UI](https://www.radix-ui.com/) — Padrões de componente acessíveis

---

*Atlas Studio Design System v2.0 — "Quiet Intelligence"*
