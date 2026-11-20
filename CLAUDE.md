# Pelada Sorteio

App web (PWA) para o sorteio balanceado da pelada de quarta. Usado por 3 admins no celular.

- Spec aprovada: `docs/superpowers/specs/2026-11-19-pelada-sorteio-design.md` — fonte da verdade do escopo da fase 1.
- Stack: React (Vite) + TypeScript + Supabase + Netlify. Testes com Vitest.
- Estrutura: `src/logic/` é código puro, sem React nem Supabase; `src/data/` acessa o Supabase; `src/ui/` são as telas.
- Fixtures reais da lista do WhatsApp em `tests/fixtures/`. Todo comportamento do leitor e do sorteio precisa de teste.
- Interface e textos em português do Brasil. Mobile primeiro, uso com uma mão.
- Nunca commitar chaves. `.env.local` fica fora do git; a service_role key do Supabase nunca entra no projeto.
- Eduardo é product designer e está estudando front-end: explique decisões técnicas em linguagem simples quando relevante.

## Interface
- Antes de qualquer tela, leia `docs/HANDOFF-UI.md`: ordem de prioridade dos documentos, telas, ajustes pendentes na lógica e decisões fechadas.
- Visual: `DESIGN.md` (tokens, componentes, motion, ícones Phosphor). Componentes usam só os tokens semânticos; nunca hex direto.
- Textos: `COPY.md`, coluna "Final". Nunca inventar texto de botão ou mensagem.
- Comportamento e aparência de referência: `docs/prototipo/index.html` (abrir no navegador). É referência, não código para copiar: a lógica oficial é a de `src/logic/`.
- Imagens do mascote em `public/mascote/`; cenas que faltam em `docs/design/MASCOTE.md`.
