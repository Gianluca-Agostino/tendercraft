# TenderCraft API — Progress Log

## Stato attuale
**Refactor completo alla pipeline Template + ControlNet + IP-Adapter.** Backend ora usa fal.ai per generazione, Replicate resta solo per editing inpainting.

## Task completati (cumulativo)
- [x] Scaffold + env + types + middleware + storage (Task 1-5 originali)
- [x] Claude Vision + promptBuilder + fluxGenerate + fluxEdit (Task 6-9)
- [x] Controllers + routes + Express app (Task 10-12)
- [x] Fix media type (always PNG to Claude)
- [x] Fix CORS per Vercel
- [x] Fix prompt proporzioni tender
- [x] Two-phase prompt (Claude come naval designer)
- [x] **REFACTOR: Template + ControlNet + IP-Adapter pipeline (fal.ai)**

## REFACTOR pipeline (nuovo)

### Nuova architettura generate
1. User sceglie size/cabin/stern → `selectTemplate()` trova il template più adatto tra 14 disponibili
2. `buildFluxPrompt()` → Claude scrive prompt creativo (senza enfasi forma, perché ControlNet la blocca)
3. `generateWithTemplate()` → chiama `fal-ai/flux-general` con:
   - ControlNet Union Pro (Canny del template) → blocca la FORMA
   - IP-Adapter (foto yacht del cliente) → trasferisce lo STILE
   - Prompt → colori, materiali, dettagli
4. Scarica immagine risultante, salva localmente come `{render_id}.png`
5. Risposta **sincrona** (no polling) — frontend riceve render completato in 15-30s

### File nuovi
- `src/services/templateSelector.ts` — TEMPLATE_MAP per 14 template S1-L5, con fallback progressivo
- `src/services/falGenerate.ts` — wrapper fal.ai flux-general con Canny + IP-Adapter
- `tender_templates/` — cartella asset: 14 reference JPEG + 14 Canny PNG + templates.json

### File modificati
- `src/controllers/generateController.ts` — nuovo flow sincrono, riceve `yachtImageBase64`
- `src/services/promptBuilder.ts` — system prompt sa che ControlNet blocca la forma, concentrati su colori/materiali
- `src/config/env.ts` — `FAL_KEY` obbligatoria, `REPLICATE_API_TOKEN` opzionale
- `src/types/index.ts` — `GenerateRequest.yachtImageBase64`, `RenderResult.template_used`

### File NON toccati (Replicate resta per editing)
- `src/services/fluxEdit.ts`, `fluxGenerate.ts` (download utility)
- `src/controllers/editController.ts`
- `src/routes/edit.ts`

## Parametri fal.ai calibrati
- `conditioning_scale: 0.75` (ControlNet Canny) — fedele alla forma, un po' di libertà
- `ip_adapters.scale: 0.35` — stile yacht trasferito senza sovrascrivere il prompt
- `guidance_scale: 7.5` — segue il prompt senza rigidità
- `num_inference_steps: 28` — sweet spot qualità/velocità
- `controlnet_unions[0].path: 'Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro'`
- `ip_adapters[0].path: 'XLabs-AI/flux-ip-adapter'`

## Template library (14 template)
- **Small (3m)**: S1 open stern, S2 platform, S3 closed — tutti senza cabina
- **Medium (4.5m)**: M1-M3 senza cabina (open/platform/closed), M4-M6 con cabina
- **Large (6.5m)**: L1-L2 senza cabina, L3-L5 con cabina
- Fallback: exact match → size+cabin → size only → error

## Env vars richieste
- `ANTHROPIC_API_KEY` (obbligatoria) — Claude Vision + prompt builder
- `FAL_KEY` (obbligatoria) — fal.ai generation
- `REPLICATE_API_TOKEN` (opzionale) — solo per `/api/edit` inpainting

## Deploy
- **Backend**: https://tendercraft-production.up.railway.app (Railway)
- **Frontend**: https://tendercraft.vercel.app (Vercel)
- **Repo**: https://github.com/Gianluca-Agostino/tendercraft

## Problemi noti / TODO
- L'utente deve aggiungere `FAL_KEY` come env var su Railway prima del prossimo deploy
- La cartella `tender_templates/` deve essere committata (contiene 14+14 file) — 28 asset totali
- Replicate output URLs temporanei — `downloadOutput()` li scarica subito
