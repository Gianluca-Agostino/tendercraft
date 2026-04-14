import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GOLD, CREAM } from '../../constants/colors';
import { FONT_BODY } from '../../constants/typography';
import { api } from '../../services/api';
import type { ConfigState, ConfigAction, ConfigStep, RenderResult, EditRequest } from '../../types';
import { DEFAULT_OPTIONS } from '../../types';
import UploadStep from './UploadStep';
import AnalyzingStep from './AnalyzingStep';
import ConfigureStep from './ConfigureStep';
import GeneratingStep from './GeneratingStep';
import ResultStep from './ResultStep';

interface ConfiguratorProps {
  open: boolean;
  onClose: () => void;
}

const initialState: ConfigState = {
  step: 'upload',
  imageFile: null,
  imagePreview: null,
  analysis: null,
  options: { ...DEFAULT_OPTIONS },
  currentRender: null,
  renderHistory: [],
  promptUsed: null,
  isEditing: false,
  error: null,
};

function reducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, imageFile: action.file, imagePreview: action.preview, error: null };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis };
    case 'SET_OPTIONS':
      return { ...state, options: { ...state.options, ...action.options } };
    case 'SET_RENDER': {
      const history = state.currentRender
        ? [state.currentRender, ...state.renderHistory].slice(0, 5)
        : state.renderHistory;
      return { ...state, currentRender: action.render, renderHistory: history, isEditing: false };
    }
    case 'SET_EDITING':
      return { ...state, isEditing: action.editing };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_PROMPT':
      return { ...state, promptUsed: action.prompt };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const modalBg: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'rgba(5,8,14,0.92)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  overflowY: 'auto',
};

export default function Configurator({ open, onClose }: ConfiguratorProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount or close
  const clearPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  useEffect(() => {
    return clearPolling;
  }, [clearPolling]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); setTimeout(() => dispatch({ type: 'RESET' }), 400); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // --- Actions ---

  const startPolling = useCallback((renderId: string, returnStep: ConfigStep) => {
    clearPolling();

    pollRef.current = setInterval(async () => {
      try {
        const render = await api.getRender(renderId);
        if (render.status === 'completed') {
          clearPolling();
          const result: RenderResult = {
            ...render,
            image_url: api.renderImageUrl(renderId),
          };
          dispatch({ type: 'SET_RENDER', render: result });
          dispatch({ type: 'SET_STEP', step: 'result' });
        } else if (render.status === 'failed') {
          clearPolling();
          dispatch({ type: 'SET_ERROR', error: render.error || 'Generation failed' });
          dispatch({ type: 'SET_STEP', step: returnStep === 'generating' ? 'configure' : 'result' });
          dispatch({ type: 'SET_EDITING', editing: false });
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2000);

    // Safety timeout 120s
    timeoutRef.current = setTimeout(() => {
      clearPolling();
      dispatch({ type: 'SET_ERROR', error: 'This is taking longer than expected. Please try again.' });
      dispatch({ type: 'SET_STEP', step: returnStep === 'generating' ? 'configure' : 'result' });
      dispatch({ type: 'SET_EDITING', editing: false });
    }, 120_000);
  }, [clearPolling]);

  const handleAnalyze = useCallback(async () => {
    if (!state.imageFile) return;
    dispatch({ type: 'SET_STEP', step: 'analyzing' });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const analysis = await api.analyze(state.imageFile);
      dispatch({ type: 'SET_ANALYSIS', analysis });
      dispatch({ type: 'SET_STEP', step: 'configure' });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', error: 'Analysis failed. Please try again.' });
      dispatch({ type: 'SET_STEP', step: 'upload' });
    }
  }, [state.imageFile]);

  const handleGenerate = useCallback(async () => {
    if (!state.analysis || !state.imagePreview) return;
    dispatch({ type: 'SET_STEP', step: 'generating' });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      // fal.ai is synchronous — single await, 15-30s
      const render = await api.generate({
        analysis: state.analysis,
        options: state.options,
        yachtImageBase64: state.imagePreview,
      });
      if (render.prompt_used) {
        dispatch({ type: 'SET_PROMPT', prompt: render.prompt_used });
      }
      dispatch({ type: 'SET_RENDER', render });
      dispatch({ type: 'SET_STEP', step: 'result' });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', error: 'Generation failed. Please try again.' });
      dispatch({ type: 'SET_STEP', step: 'configure' });
    }
  }, [state.analysis, state.options, state.imagePreview]);

  const handleEdit = useCallback(async (editRequest: Omit<EditRequest, 'render_id'>) => {
    if (!state.currentRender) return;
    dispatch({ type: 'SET_EDITING', editing: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const { render_id } = await api.edit({
        ...editRequest,
        render_id: state.currentRender.id,
      });
      startPolling(render_id, 'result');
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', error: 'Edit failed. Please try again.' });
      dispatch({ type: 'SET_EDITING', editing: false });
    }
  }, [state.currentRender, startPolling]);

  const handleSelectHistory = useCallback((render: RenderResult) => {
    dispatch({ type: 'SET_RENDER', render });
  }, []);

  const handleClose = useCallback(() => {
    clearPolling();
    onClose();
    setTimeout(() => dispatch({ type: 'RESET' }), 400);
  }, [onClose, clearPolling]);

  if (!open) return null;

  const closeBtn = (
    <button
      onClick={handleClose}
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        background: 'none',
        border: '1px solid rgba(201,169,110,0.2)',
        color: CREAM,
        width: 44,
        height: 44,
        borderRadius: 12,
        cursor: 'pointer',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transition: 'border-color 0.3s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)')}
    >
      &#x2715;
    </button>
  );

  const errorBanner = state.error && (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(180,40,40,0.85)',
        backdropFilter: 'blur(12px)',
        color: '#f5dede',
        fontFamily: FONT_BODY,
        fontSize: 13,
        padding: '10px 40px 10px 20px',
        borderRadius: 10,
        zIndex: 20,
        maxWidth: 500,
      }}
    >
      {state.error}
      <button
        onClick={() => dispatch({ type: 'SET_ERROR', error: null })}
        style={{
          position: 'absolute',
          top: 6,
          right: 10,
          background: 'none',
          border: 'none',
          color: '#f5dede',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        &#x2715;
      </button>
    </div>
  );

  const needsScroll = state.step === 'configure' || state.step === 'result';

  return (
    <div style={{
      ...modalBg,
      alignItems: needsScroll ? 'flex-start' : 'center',
      padding: needsScroll ? '80px 24px 40px' : 24,
    }}>
      {closeBtn}
      {errorBanner}

      {state.step === 'upload' && (
        <UploadStep
          imagePreview={state.imagePreview}
          dispatch={dispatch}
          onAnalyze={handleAnalyze}
        />
      )}

      {state.step === 'analyzing' && <AnalyzingStep />}

      {state.step === 'configure' && state.analysis && (
        <ConfigureStep
          analysis={state.analysis}
          imagePreview={state.imagePreview}
          options={state.options}
          dispatch={dispatch}
          onGenerate={handleGenerate}
        />
      )}

      {state.step === 'generating' && (
        <GeneratingStep promptUsed={state.promptUsed} />
      )}

      {state.step === 'result' && state.currentRender && (
        <ResultStep
          render={state.currentRender}
          analysis={state.analysis}
          isEditing={state.isEditing}
          renderHistory={state.renderHistory}
          onEdit={handleEdit}
          onSelectHistory={handleSelectHistory}
          onNewVariation={() => dispatch({ type: 'SET_STEP', step: 'configure' })}
          onReset={() => dispatch({ type: 'RESET' })}
          options={state.options}
        />
      )}
    </div>
  );
}
