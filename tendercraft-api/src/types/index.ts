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

export interface GenerateOptions {
  cabin: boolean;
  stern_style: 'open' | 'closed' | 'platform';
  size: 'small' | 'medium' | 'large';
  custom_instructions?: string;
}

export interface GenerateRequest {
  analysis: YachtAnalysis;
  options?: GenerateOptions;
  yachtImageBase64: string;
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
  template_used?: string;
  created_at?: string;
  completed_at?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
