import React, { useEffect, useRef, useState } from "react";

type Props = {
  file?: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  aspect?: number;
  maxSizeMB?: number;
};

export const ImageUploader: React.FC<Props> = ({ file, previewUrl, onChange, aspect = 16 / 9, maxSizeMB = 5 }) => {
  const [preview, setPreview] = useState<string | undefined>(previewUrl || undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(previewUrl || undefined);
    }
  }, [file, previewUrl]);

  const handleFile = (f?: File) => {
    if (!f) {
      onChange(null);
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`Image too big (max ${maxSizeMB}MB)`);
      return;
    }
    // optional: integrate cropper here. For now we send raw file.
    onChange(f);
  };

  return (
    <div className="image-uploader">
      <div className="preview" style={{ aspectRatio: String(aspect) }}>
        {preview ? <img src={preview} alt="Featured preview" /> : <div className="placeholder">No image</div>}
      </div>
      <div className="controls">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-label="Upload featured image"
        />
        <button type="button" onClick={() => inputRef.current?.click()}>Choose file</button>
        <button type="button" onClick={() => { onChange(null); }}>Remove</button>
      </div>
    </div>
  );
};