import type { YachtAnalysis, GenerateRequest, RenderResult, EditRequest } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async analyze(imageFile: File): Promise<YachtAnalysis> {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Analysis failed');
    return data.data.analysis;
  },

  /**
   * Generate tender render via fal.ai — SYNCHRONOUS (no polling).
   * Returns the completed render directly. Takes 15-30 seconds.
   */
  async generate(request: GenerateRequest): Promise<RenderResult> {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Generation failed');
    const result = data.data as RenderResult;
    // Resolve relative image_url against API_BASE
    if (result.image_url && result.image_url.startsWith('/')) {
      result.image_url = `${API_BASE}${result.image_url}`;
    }
    return result;
  },

  async getRender(id: string): Promise<RenderResult> {
    const res = await fetch(`${API_BASE}/api/render/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Fetch failed');
    return data.data as RenderResult;
  },

  async edit(request: EditRequest): Promise<{ render_id: string }> {
    const res = await fetch(`${API_BASE}/api/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Edit failed');
    return { render_id: data.data.render_id };
  },

  renderImageUrl(id: string): string {
    return `${API_BASE}/api/render/${id}/image`;
  },
};
