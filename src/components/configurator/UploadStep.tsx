import { useRef, useState, useCallback } from 'react';
import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import type { ConfigAction } from '../../types';

interface UploadStepProps {
  imagePreview: string | null;
  dispatch: React.Dispatch<ConfigAction>;
  onAnalyze: () => void;
}

export default function UploadStep({ imagePreview, dispatch, onAnalyze }: UploadStepProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File | undefined | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ type: 'SET_IMAGE', file, preview: e.target!.result as string });
      };
      reader.readAsDataURL(file);
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      processFile(e.dataTransfer?.files?.[0]);
    },
    [processFile],
  );

  return (
    <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: GOLD,
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        Step 1
      </div>
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(28px,4vw,44px)',
          fontWeight: 400,
          color: CREAM,
          margin: '0 0 12px',
        }}
      >
        Upload Your <span style={{ fontStyle: 'italic', color: GOLD }}>Yacht</span>
      </h2>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 15,
          color: 'rgba(245,240,232,0.45)',
          marginBottom: 40,
          lineHeight: 1.6,
        }}
      >
        Share a photo and our AI will analyze the design DNA
      </p>

      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? GOLD : 'rgba(201,169,110,0.25)'}`,
            borderRadius: 20,
            padding: '64px 40px',
            cursor: 'pointer',
            background: dragOver ? 'rgba(201,169,110,0.04)' : 'rgba(12,28,52,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>&#x1F6E5;&#xFE0F;</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: CREAM, marginBottom: 8 }}>
            Drop your yacht photo here
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(245,240,232,0.35)' }}>
            or click to browse &mdash; JPG, PNG, WebP
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div>
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 28,
              border: '1px solid rgba(201,169,110,0.15)',
              maxHeight: 360,
              display: 'flex',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={imagePreview}
              alt="Yacht"
              style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,169,110,0.2)',
                color: GOLD_LIGHT,
                padding: '14px 32px',
                borderRadius: 10,
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Change Photo
            </button>
            <button
              onClick={onAnalyze}
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                border: 'none',
                color: DARK,
                padding: '14px 36px',
                borderRadius: 10,
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 6px 28px rgba(201,169,110,0.3)',
              }}
            >
              Analyze Design &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
