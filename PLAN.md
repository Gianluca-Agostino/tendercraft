# TenderCraft — Refactor Pipeline: Template + ControlNet + IP-Adapter

## Obiettivo

Sostituire la pipeline "prompt-only" con una pipeline **template + style transfer** più precisa:

- **Template ControlNet (Canny)** → blocca la FORMA del tender (scelto in base a size/cabin/stern)
- **IP-Adapter (foto yacht)** → trasferisce lo STILE (colori, materiali, mood)
- **Prompt da design spec** → guida colori, finiture, dettagli

**Cambio provider**: da Replicate a **fal.ai** per la generazione (endpoint `fal-ai/flux-general` supporta ControlNet + IP-Adapter insieme). Replicate resta solo per l'editing inpainting (`/api/edit`).

## Asset già pronti

`tender_templates/` nella root del progetto contiene:
- `templates.json` (metadata con dimensioni per 14 template)
- `reference/` (14 JPEG originali a 1024px)
- `canny/` (14 PNG Canny edge maps)

Template ID mapping: S1-S3 (small), M1-M6 (medium), L1-L5 (large).

## Task

### 1. Installare @fal-ai/client + aggiornare env
- **File**: `tendercraft-api/package.json`, `src/config/env.ts`, `.env.example`
- **Cosa**: npm install @fal-ai/client; aggiungere FAL_KEY obbligatoria, rendere REPLICATE_API_TOKEN opzionale
- **Dipendenze**: nessuna
- **Complessità**: S

### 2. Template selector service
- **File**: `src/services/templateSelector.ts` (NUOVO)
- **Cosa**: TEMPLATE_MAP + funzione `selectTemplate(size, cabin, stern)` con fallback, legge `templates.json` per dimensioni
- **Dipendenze**: Task 1
- **Complessità**: S

### 3. fal.ai generation service
- **File**: `src/services/falGenerate.ts` (NUOVO)
- **Cosa**: `generateWithTemplate({ prompt, cannyImagePath, yachtImageBase64, width, height })` → chiama `fal-ai/flux-general` con ControlNet Canny (scale 0.75) + IP-Adapter (scale 0.35), ritorna URL immagine
- **Dipendenze**: Task 1
- **Complessità**: M

### 4. Modifiche promptBuilder
- **File**: `src/services/promptBuilder.ts`
- **Cosa**: Aggiungere nel system prompt che la FORMA è già data dal ControlNet e il prompt deve concentrarsi su colori/materiali/dettagli, non sulla forma
- **Dipendenze**: nessuna
- **Complessità**: S

### 5. Aggiornare generateController
- **File**: `src/controllers/generateController.ts`
- **Cosa**: Nuovo flow: selectTemplate → buildFluxPrompt → generateWithTemplate → download + save → response sincrona (no più polling ID). Body include `yachtImageBase64`.
- **Dipendenze**: Task 2, 3, 4
- **Complessità**: M

### 6. Aggiornare route generate + rate limit
- **File**: `src/routes/generate.ts`
- **Cosa**: Body size limit aumentato per `yachtImageBase64`, validazione che yachtImageBase64 sia presente
- **Dipendenze**: Task 5
- **Complessità**: S

### 7. Copiare tender_templates nel backend
- **File**: `tendercraft-api/tender_templates/` (o path via process.cwd())
- **Cosa**: Il backend deve trovare i template a runtime. Su Railway serve che la cartella sia committata nel repo. Dato che il Root Directory di Railway è `tendercraft-api`, copio/sposto `tender_templates/` dentro `tendercraft-api/`
- **Dipendenze**: nessuna
- **Complessità**: S

### 8. Frontend: api.ts e Configurator (invio yacht base64, no polling)
- **File**: `src/services/api.ts`, `src/components/configurator/Configurator.tsx`
- **Cosa**: `api.generate` ora include `yachtImageBase64` (già nello state imagePreview), response sincrona contiene il render completato → skip GeneratingStep polling, vai direttamente a `result`. Rimuovi timeout safety da polling (fetch ha il suo).
- **Dipendenze**: Task 5
- **Complessità**: M

### 9. Types aggiornati
- **File**: `tendercraft-api/src/types/index.ts`, frontend `src/types/index.ts`
- **Cosa**: `GenerateRequest` ora include `yachtImageBase64: string`. `RenderResult` può includere `template_used`, `design_spec`.
- **Dipendenze**: Task 5, 8
- **Complessità**: S

### 10. Build + commit + push (Railway + Vercel auto-deploy)
- **File**: —
- **Cosa**: `tsc --noEmit` backend e frontend, commit, push. L'utente deve aggiungere `FAL_KEY` come env var su Railway
- **Dipendenze**: tutti i task
- **Complessità**: S

### 11. Update PROGRESS.md
- **File**: `PROGRESS.md`, `tendercraft-api/PROGRESS.md`
- **Cosa**: Documentare refactor, decisioni prese, parametri ControlNet/IP-Adapter calibrati
- **Dipendenze**: tutti i task
- **Complessità**: S

## Parametri critici calibrati

- `conditioning_scale: 0.75` (ControlNet Canny) — fedele alla forma, un po' di libertà
- `ip_adapters.scale: 0.35` — stile yacht trasferito senza sovrascrivere il prompt
- `guidance_scale: 7.5` — segue il prompt senza essere rigido
- `num_inference_steps: 28` — sweet spot qualità/velocità

## Cosa NON tocco

- `fluxEdit.ts`, `/api/edit`, `editController.ts` — restano con Replicate per l'inpainting
- Water shader, landing page, showcase, nav, footer — nessuna modifica
- Claude Vision service — nessuna modifica (già ottimizzato)

## Impatto utente

- Nessun polling → esperienza più veloce (15-30s sincroni invece di N polling da 2s)
- Forma del tender sempre realistica (bloccata dal template)
- Stile yacht trasferito esplicitamente via IP-Adapter (colori/materiali più coerenti)
- Frontend più semplice (skip GeneratingStep se response immediata, OR mostra GeneratingStep durante l'await)
