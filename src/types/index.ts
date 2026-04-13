export interface YachtColor {
  hex: string;
  name: string;
  usage: string;
}

export interface YachtAnalysis {
  yacht_name: string;
  design_style: string;
  style_description: string;
  colors: YachtColor[];
  materials: string[];
  hull_character: string;
  tender_prompt: string;
}

export interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

export interface UploadedImage {
  dataUrl: string;
  base64: string;
  mediaType: string;
}

// --- Configurator types ---

export interface TenderOptions {
  cabin: boolean;
  stern_style: 'open' | 'closed' | 'platform';
  size: 'small' | 'medium' | 'large';
  custom_instructions: string;
}

export interface GenerateRequest {
  analysis: YachtAnalysis;
  options?: Partial<TenderOptions>;
}

export type MaskArea = 'hull' | 'cabin' | 'stern' | 'deck' | 'full';

export interface EditRequest {
  render_id: string;
  edit_type: 'color' | 'cabin' | 'stern' | 'custom';
  mask_area?: MaskArea;
  new_prompt?: string;
  custom_instructions?: string;
}

export interface RenderResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url?: string;
  thumbnail_url?: string;
  analysis?: YachtAnalysis;
  prompt_used?: string;
  created_at?: string;
  completed_at?: string;
  error?: string;
}

export type ConfigStep = 'upload' | 'analyzing' | 'configure' | 'generating' | 'result';

export interface ConfigState {
  step: ConfigStep;
  imageFile: File | null;
  imagePreview: string | null;
  analysis: YachtAnalysis | null;
  options: TenderOptions;
  currentRender: RenderResult | null;
  renderHistory: RenderResult[];
  promptUsed: string | null;
  isEditing: boolean;
  error: string | null;
}

export type ConfigAction =
  | { type: 'SET_IMAGE'; file: File; preview: string }
  | { type: 'SET_ANALYSIS'; analysis: YachtAnalysis }
  | { type: 'SET_OPTIONS'; options: Partial<TenderOptions> }
  | { type: 'SET_RENDER'; render: RenderResult }
  | { type: 'SET_EDITING'; editing: boolean }
  | { type: 'SET_STEP'; step: ConfigStep }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_PROMPT'; prompt: string }
  | { type: 'RESET' };

export const DEFAULT_OPTIONS: TenderOptions = {
  cabin: true,
  stern_style: 'open',
  size: 'medium',
  custom_instructions: '',
};
