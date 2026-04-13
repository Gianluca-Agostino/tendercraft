# TenderCraft API — Piano di Lavoro

## Obiettivo

Backend Express + TypeScript per TenderCraft. Gestisce:
- Analisi foto yacht via Claude Vision (Anthropic SDK)
- Generazione render tender via Flux Pro (Replicate SDK)
- Editing iterativo render via Flux Fill inpainting (Replicate SDK)
- Image processing con Sharp (resize, maschere, ottimizzazione)
- Storage locale temporaneo con cleanup automatico

## Task

### 1. Scaffold progetto e configurazione base
- **File**: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`
- **Dipendenze**: express, cors, dotenv, multer, sharp, replicate, @anthropic-ai/sdk, tsx, typescript, @types/*
- **Criteri**: `npm install` senza errori, `tsc --noEmit` passa
- **Complessità**: S

### 2. Config env + types + struttura cartelle
- **File**: `src/config/env.ts`, `src/types/index.ts`
- **Dipendenze**: nessuna
- **Criteri**: validazione env con errori chiari se mancanti, tutti i tipi definiti (YachtAnalysis, GenerateRequest, EditRequest, RenderResult, MaskArea, GenerateOptions)
- **Complessità**: S

### 3. Middleware (upload, error handler, rate limit)
- **File**: `src/middleware/upload.ts`, `src/middleware/errorHandler.ts`, `src/middleware/rateLimit.ts`
- **Dipendenze**: Task 1
- **Criteri**: Multer configurato per immagini max 10MB, error handler JSON globale, rate limiter token bucket 10 req/min
- **Complessità**: S

### 4. Storage utility
- **File**: `src/utils/storage.ts`
- **Dipendenze**: Task 1
- **Criteri**: funzioni per salvare/leggere/eliminare file in uploads/ e renders/, cleanup automatico con setInterval (uploads 1h, renders 24h)
- **Complessità**: S

### 5. Image processor service (Sharp)
- **File**: `src/services/imageProcessor.ts`
- **Dipendenze**: Task 1
- **Criteri**: resize a max 1500px, generazione maschere per 5 aree (hull, cabin, stern, deck, full), conversione buffer PNG
- **Complessità**: M

### 6. Claude Vision service
- **File**: `src/services/claudeVision.ts`
- **Dipendenze**: Task 2, 5
- **Criteri**: invia immagine base64 a Claude claude-sonnet-4-20250514, parsing robusto JSON (strip backticks, try/catch), log con timestamp e durata, ritorna YachtAnalysis tipizzato
- **Complessità**: M

### 7. Prompt builder service
- **File**: `src/services/promptBuilder.ts`
- **Dipendenze**: Task 2
- **Criteri**: costruisce prompt Flux completo da YachtAnalysis + opzioni (cabin, stern_style, size, custom), aggiunge suffisso qualità/lighting
- **Complessità**: S

### 8. Flux generation service
- **File**: `src/services/fluxGenerate.ts`
- **Dipendenze**: Task 2, 4, 7
- **Criteri**: chiama Replicate flux-1.1-pro con prompt costruito, ritorna prediction ID, gestisce errori API
- **Complessità**: M

### 9. Flux edit (inpainting) service
- **File**: `src/services/fluxEdit.ts`
- **Dipendenze**: Task 2, 4, 5
- **Criteri**: chiama Replicate flux-fill-pro con immagine + maschera + prompt, ritorna prediction ID
- **Complessità**: M

### 10. Controllers
- **File**: `src/controllers/analyzeController.ts`, `generateController.ts`, `editController.ts`, `renderController.ts`
- **Dipendenze**: Task 3, 4, 5, 6, 7, 8, 9
- **Criteri**: ogni controller gestisce input validation, chiama i services, ritorna JSON `{ success, data/error }`, try/catch con next(error)
- **Complessità**: M

### 11. Routes + Express app setup
- **File**: `src/routes/analyze.ts`, `generate.ts`, `edit.ts`, `render.ts`, `src/index.ts`
- **Dipendenze**: Task 3, 10
- **Criteri**: CORS configurato, rate limiting su generate/edit, health endpoint, porta da env, tutti gli endpoint funzionanti
- **Complessità**: M

### 12. Build verification + README
- **File**: `README.md`
- **Dipendenze**: tutti i task precedenti
- **Criteri**: `tsc --noEmit` passa, `npm run dev` avvia il server, tutti gli endpoint rispondono, documentazione d'uso completa
- **Complessità**: S
