import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { X, Upload, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import getCroppedImg from "../utils/cropImage";
import "./AvatarUploadModal.scss";

interface Props {
  onClose: () => void;
}

export default function AvatarUploadModal({ onClose }: Props) {
  const { user, updateUserMetadata } = useAuthStore();
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("La imagen es demasiado grande (máximo 5MB)");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!user) return;
    if (!file && name === user.user_metadata?.full_name) return;

    setUploading(true);
    setError(null);

    try {
      let finalAvatarUrl = user.user_metadata?.avatar_url;

      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const fileName = `${user.id}-${Date.now()}.jpg`;
        const filePath = `${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, croppedImage, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      }

      // 3. Update User Metadata (Name and Avatar)
      await updateUserMetadata({
        full_name: name,
        avatar_url: finalAvatarUrl,
      });

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
          <div className="crop-controls-wrapper">
            <div className="avatar-preview-container">
              {imageSrc ? (
                <div className="cropper-container">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              ) : (
                <div
                  className="preview-circle empty"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="placeholder">
                    <Upload size={40} />
                    <span>Elegir Imagen</span>
                  </div>
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="zoom-controls">
                <ZoomOut size={18} />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="zoom-range"
                />
                <ZoomIn size={18} />
                <button
                  className="change-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar imagen
                </button>
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

          <div className="form-group name-group">
            <label>Nombre del Jugador</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              disabled={uploading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              className="submit-btn"
              onClick={handleUpload}
              disabled={
                uploading ||
                (!imageSrc && name === user?.user_metadata?.full_name)
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
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
