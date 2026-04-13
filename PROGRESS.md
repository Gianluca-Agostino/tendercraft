# TenderCraft Frontend — Progress Log

## Stato attuale
Tutti i 9 task completati. Build clean, lint clean. Configurator 5-step collegato al backend.

## Task completati
- [x] Task 1 — API service + types + env — `src/services/api.ts`, `src/types/index.ts`, `.env.example`
- [x] Task 2 — UI condivisi — `OptionCard.tsx`, `ToggleSwitch.tsx`, `RotatingText.tsx`
- [x] Task 3 — Configurator useReducer — `Configurator.tsx` riscritto con state machine 5 step
- [x] Task 4 — UploadStep aggiornato — passa File object via dispatch
- [x] Task 5 — AnalyzingStep aggiornato — RotatingText con 4 messaggi ciclanti
- [x] Task 6 — ConfigureStep (NUOVO) — due colonne: analisi + opzioni tender
- [x] Task 7 — GeneratingStep (NUOVO) — animazione premium + box prompt
- [x] Task 8 — ResultStep + EditPanel + RenderHistory (NUOVO) — render + editing + history
- [x] Task 9 — Cleanup + build — rimosso ResultsStep.tsx, lint 0 errori, build clean

## Decisioni prese
- useReducer: preferito a useState multipli per gestire 5 step + render history + editing state
- startPolling: dichiarato prima di handleGenerate/handleEdit per evitare errore ESLint "accessed before declared"
- EditRequest type: importato direttamente invece di usare `import()` type inline per pulizia
- anthropic.ts: mantenuto nel progetto ma non importato da nessuno (legacy, rimovibile)
- Responsive: grids ConfigureStep e ResultStep collassano a 1 colonna sotto 768px

## Problemi noti
- anthropic.ts non è più usato ma è ancora nel progetto (dead code)
- Il backend deve girare su :3001 per i test end-to-end
- Polling interval 2s + timeout 120s — se Replicate è lento, l'utente vede "taking longer than expected"

## Struttura file corrente
```
src/components/configurator/
├── Configurator.tsx        # Modal wrapper + useReducer state machine (5 step)
├── UploadStep.tsx          # Step 1: drag & drop photo
├── AnalyzingStep.tsx       # Step 2: spinner + rotating text
├── ConfigureStep.tsx       # Step 3: analysis summary + tender options
├── GeneratingStep.tsx      # Step 4: premium loading + polling
├── ResultStep.tsx          # Step 5: render + download + edit
├── EditPanel.tsx           # Edit panel (color, cabin, stern, custom)
├── RenderHistory.tsx       # Thumbnails versioni precedenti
├── OptionCard.tsx          # Card selezionabile riutilizzabile
├── ToggleSwitch.tsx        # Toggle switch luxury
└── RotatingText.tsx        # Testo con fade rotation

src/services/
├── api.ts                  # Client HTTP verso backend :3001
└── anthropic.ts            # Legacy (non più importato)

src/types/
└── index.ts                # +TenderOptions, GenerateRequest, EditRequest,
                            #  RenderResult, MaskArea, ConfigStep,
                            #  ConfigState, ConfigAction, DEFAULT_OPTIONS
```
