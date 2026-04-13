# TenderCraft Frontend — Piano Integrazione Backend

## Obiettivo

Collegare il frontend al backend tendercraft-api. Trasformare il Configurator da 3 step (upload → analyzing → results) a 5 step (upload → analyzing → configure → generating → result) con generazione render via Flux e editing iterativo.

## Stato attuale

- 4 file configurator: Configurator.tsx, UploadStep.tsx, AnalyzingStep.tsx, ResultsStep.tsx
- Chiamata diretta all'API Anthropic dal browser (src/services/anthropic.ts)
- Types: YachtAnalysis, YachtColor, TrailPoint, UploadedImage
- Hook: useFileUpload.ts

## Task

### 1. API service + types + env config
- **File**: `src/services/api.ts`, `src/types/index.ts`, `.env.example`
- **Cosa**: Creare client API verso backend, aggiungere tipi mancanti (GenerateRequest, EditRequest, RenderResult, TenderOptions, MaskArea, ConfigStep, ConfigState, ConfigAction), aggiungere VITE_API_URL
- **Dipendenze**: nessuna
- **Complessità**: S

### 2. Componenti UI condivisi
- **File**: `src/components/configurator/OptionCard.tsx`, `ToggleSwitch.tsx`, `RotatingText.tsx`
- **Cosa**: Card selezionabile con radio semantics, toggle switch luxury, testo con fade rotation
- **Dipendenze**: nessuna
- **Complessità**: M

### 3. Riscrivere Configurator.tsx con useReducer
- **File**: `src/components/configurator/Configurator.tsx`
- **Cosa**: State machine 5 step con useReducer, dispatch passato a tutti i sub-step, cleanup polling su unmount, error banner, ESC to close
- **Dipendenze**: Task 1
- **Complessità**: M

### 4. Aggiornare UploadStep
- **File**: `src/components/configurator/UploadStep.tsx`
- **Cosa**: Passare File object allo state (non solo base64), dispatch SET_IMAGE, bottone chiama dispatch per passare ad analyzing
- **Dipendenze**: Task 3
- **Complessità**: S

### 5. Aggiornare AnalyzingStep con rotating text
- **File**: `src/components/configurator/AnalyzingStep.tsx`
- **Cosa**: Integrare RotatingText con 4 messaggi che ciclano ogni 3s. Chiamata api.analyze integrata nel Configurator
- **Dipendenze**: Task 2, 3
- **Complessità**: S

### 6. Creare ConfigureStep (NUOVO)
- **File**: `src/components/configurator/ConfigureStep.tsx`
- **Cosa**: Due colonne — sinistra: riepilogo analisi (foto, nome, style, palette, materiali, hull). Destra: opzioni tender (cabin toggle, stern 3-card, size 3-card, textarea custom, bottone "Generate Tender →")
- **Dipendenze**: Task 1, 2, 3
- **Complessità**: L

### 7. Creare GeneratingStep (NUOVO)
- **File**: `src/components/configurator/GeneratingStep.tsx`
- **Cosa**: Animazione attesa premium (progress ring, testi rotanti ogni 4s, box prompt usato). Logica polling integrata nel Configurator
- **Dipendenze**: Task 2, 3
- **Complessità**: M

### 8. Creare ResultStep + EditPanel + RenderHistory (NUOVO)
- **File**: `src/components/configurator/ResultStep.tsx`, `EditPanel.tsx`, `RenderHistory.tsx`
- **Cosa**: Due colonne — sinistra: render + download/retry. Destra: pannello edit (color, cabin, stern, custom) con polling. History strip con thumbnails clickabili, max 5
- **Dipendenze**: Task 1, 2, 3
- **Complessità**: L

### 9. Rimuovere vecchio ResultsStep + anthropic.ts, verificare build
- **File**: rimuovere `ResultsStep.tsx`, `src/services/anthropic.ts`
- **Cosa**: Cleanup file non più usati, tsc --noEmit, npm run build, test visivo
- **Dipendenze**: tutti i task precedenti
- **Complessità**: S
