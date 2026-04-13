# TenderCraft API — Progress Log

## Stato attuale
Tutti i task completati. Deploy live su Railway. Prompt ricalibrato per proporzioni tender realistiche.

## Task completati
- [x] Task 1 — Scaffold progetto — `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`
- [x] Task 2 — Config env + types — `src/config/env.ts`, `src/types/index.ts`
- [x] Task 3 — Middleware — `src/middleware/upload.ts`, `errorHandler.ts`, `rateLimit.ts`
- [x] Task 4 — Storage utility — `src/utils/storage.ts`
- [x] Task 5 — Image processor — `src/services/imageProcessor.ts`
- [x] Task 6 — Claude Vision service — `src/services/claudeVision.ts`
- [x] Task 7 — Prompt builder — `src/services/promptBuilder.ts`
- [x] Task 8 — Flux generation — `src/services/fluxGenerate.ts`
- [x] Task 9 — Flux edit — `src/services/fluxEdit.ts`
- [x] Task 10 — Controllers — `src/controllers/analyze|generate|edit|renderController.ts`
- [x] Task 11 — Routes + Express app — `src/routes/*.ts`, `src/index.ts`
- [x] Task 12 — Build verification + README — `README.md`, `tsc --noEmit` clean
- [x] Fix media type — analyzeController ora passa sempre `image/png` a Claude (Sharp converte a PNG)
- [x] Fix CORS — accetta *.vercel.app + localhost:4173/5173
- [x] Fix prompt proporzioni — riscritto promptBuilder.ts per generare TENDER, non yacht

## Decisioni prese
- Express 5: `req.params` values sono `string | string[]` — creata helper `paramStr()` nel renderController
- Rate limiting: token bucket custom — 10 req/min per IP
- Storage locale MVP: filesystem con cleanup a intervalli (uploads 1h, renders 24h)
- CORS dinamico: callback che accetta qualsiasi origine con `vercel.app`
- Prompt builder: definizione esplicita TENDER con dimensioni reali (3m/4.5m/6.5m), NO flybridge/multiple decks
- Claude Vision prompt: campo tender_prompt ora chiede descrizione tender-scale, non yacht

## Deploy
- **Backend**: https://tendercraft-production.up.railway.app (Railway, auto-deploy da main)
- **Frontend**: https://tendercraft.vercel.app (Vercel, auto-deploy da main)
- **Repo**: https://github.com/Gianluca-Agostino/tendercraft

## Problemi noti
- Replicate output URLs sono temporanei — il renderController li scarica e salva localmente
- Rate limit buckets in memoria — si resettano al restart del server
- Railway free tier: 30 giorni o $5 di utilizzo
