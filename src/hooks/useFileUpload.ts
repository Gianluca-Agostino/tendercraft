import { useState, useCallback, useRef } from 'react';
import type { UploadedImage } from '../types';

export function useFileUpload() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target!.result as string;
      const base64 = dataUrl.split(',')[1];
      const mediaType = file.type;
      setImage({ dataUrl, base64, mediaType });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const reset = useCallback(() => {
    setImage(null);
    setDragOver(false);
  }, []);

  return { image, dragOver, setDragOver, fileRef, handleFile, handleDrop, reset };
}
