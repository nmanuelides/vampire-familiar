import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { X, Upload, Loader2 } from "lucide-react";
import "./AvatarUploadModal.scss";

interface Props {
  onClose: () => void;
}

export default function AvatarUploadModal({ onClose }: Props) {
  const { user, updateUserMetadata } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("La imagen es demasiado grande (máximo 2MB)");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update User Metadata
      await updateUserMetadata({ avatar_url: publicUrl });

      onClose();
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="text-center">Actualizar Avatar</h2>

        <div className="upload-container">
          <div
            className="preview-circle"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Vista previa" />
            ) : (
              <div className="placeholder">
                <Upload size={40} />
                <span>Elegir Imagen</span>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              className="submit-btn"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Subiendo...
                </>
              ) : (
                "Guardar Imagen"
              )}
            </button>
            <button
              className="cancel-btn"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
