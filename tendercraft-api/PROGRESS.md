# TenderCraft API — Progress Log

## Stato attuale
Tutti i 12 task completati. Build TypeScript pulita, progetto pronto per uso.

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

## Decisioni prese
- Express 5: `req.params` values sono `string | string[]` — creata helper `paramStr()` nel renderController
- Multer 1.x: warning deprecation, ma 2.x ha API diversa — mantenuto per stabilità
- Rate limiting: token bucket custom (niente dipendenze extra) — 10 req/min per IP
- Storage locale MVP: filesystem con cleanup a intervalli (uploads 1h, renders 24h)

## Problemi noti
- Replicate output URLs sono temporanei — il renderController li scarica e salva localmente appena completati
- Rate limit buckets in memoria — si resettano al restart del server (accettabile per MVP)

## Struttura file corrente
```
tendercraft-api/
├── PLAN.md
├── PROGRESS.md
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── uploads/                  (gitignored)
├── renders/                  (gitignored)
└── src/
    ├── index.ts
    ├── config/
    │   └── env.ts
    ├── types/
    │   └── index.ts
    ├── middleware/
    │   ├── upload.ts
    │   ├── errorHandler.ts
    │   └── rateLimit.ts
    ├── utils/
    │   └── storage.ts
    ├── services/
    │   ├── claudeVision.ts
    │   ├── fluxGenerate.ts
    │   ├── fluxEdit.ts
    │   ├── imageProcessor.ts
    │   └── promptBuilder.ts
    ├── controllers/
    │   ├── analyzeController.ts
    │   ├── generateController.ts
    │   ├── editController.ts
    │   └── renderController.ts
    └── routes/
        ├── analyze.ts
        ├── generate.ts
        ├── edit.ts
        └── render.ts
```
