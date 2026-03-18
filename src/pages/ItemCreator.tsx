import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { useItemStore } from "../store/useItemStore";
import type { VTMItem } from "../types/vtm";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Loader2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import getCroppedImg from "../utils/cropImage";
import "./ItemCreator.scss";

export default function ItemCreator() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, fetchItems, createItem, updateItem, deleteItem, loading } =
    useItemStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const [editingItem, setEditingItem] = useState<VTMItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [damage, setDamage] = useState("");

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
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!user) return;
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    // Si estamos editando y NO hay imagen nueva, permitimos guardar igual
    if (!editingItem && (!imageSrc || !croppedAreaPixels)) {
      setError(
        "Debes seleccionar y recortar una imagen para crear un ítem nuevo",
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let finalImageUrl = editingItem?.image_url;

      // Solo subimos y recortamos si hay una imagen nueva en el cropper
      if (imageSrc && croppedAreaPixels) {
        // 1. Crop Image
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const fileName = `item-${user.id}-${Date.now()}.jpg`;
        const filePath = `${fileName}`;

        // 2. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("items")
          .upload(filePath, croppedImage, {
            contentType: "image/jpeg",
          });

        if (uploadError) {
          console.error("STORAGE UPLOAD ERROR:", uploadError);
          throw uploadError;
        }

        // 3. Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("items").getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      if (editingItem) {
        // UPDATE MODE
        await updateItem(editingItem.id!, {
          name: name.trim(),
          description: description.trim() || undefined,
          damage: damage.trim() || undefined,
          ...(finalImageUrl !== editingItem.image_url && {
            image_url: finalImageUrl,
          }),
        });
      } else {
        // CREATE MODE
        const createResult = await createItem({
          name: name.trim(),
          description: description.trim() || undefined,
          damage: damage.trim() || undefined,
          image_url: finalImageUrl!,
        });

        if (!createResult) {
          throw new Error(
            "createItem devolvió null, revisa la consola para ver el error exacto de la DB",
          );
        }
      }

      // Reset Form
      resetForm();
    } catch (err: any) {
      setError(err.message || "Error al procesar el ítem");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setDamage("");
    setImageSrc(null);
    setCroppedAreaPixels(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (item: VTMItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setDamage(item.damage || "");
    setImageSrc(null); // Force them to see the old image placeholder, or upload new
    setCroppedAreaPixels(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (id: string, itemName: string) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${itemName}"? Esto lo borrará de todos los inventarios.`,
      )
    ) {
      await deleteItem(id);
    }
  };

  return (
    <div className="item-creator-page container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className="main-title text-center">Creador de Items</h1>
      </header>

      <div className="card form-container">
        {/* Left Side: Image Uploader & Cropper */}
        <div className="image-section">
          <h3>Imagen del Item</h3>
          <div className="upload-container">
            <div className="crop-controls-wrapper">
              <div className="item-preview-container">
                {imageSrc ? (
                  <div className="cropper-container square">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="rect"
                      showGrid={true}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                ) : editingItem ? (
                  <div className="preview-square current-image">
                    <img src={editingItem.image_url} alt="Current" />
                    <div
                      className="edit-image-overlay"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={30} />
                      <span>Reemplazar</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="preview-square empty"
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
                    Cambiar
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
          </div>
        </div>

        {/* Right Side: Form Fields */}
        <div className="fields-section">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Espada de Plata"
              disabled={uploading}
            />
          </div>
          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el ítem..."
              disabled={uploading}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Daño (Opcional)</label>
            <input
              type="text"
              value={damage}
              onChange={(e) => setDamage(e.target.value)}
              placeholder="Ej. Fue +1"
              disabled={uploading}
            />
          </div>

          {error && <p className="error-message glass">{error}</p>}

          <div className="form-actions-row">
            {editingItem && (
              <button
                className="btn-secondary cancel-btn"
                onClick={resetForm}
                disabled={uploading}
              >
                <X size={18} /> Cancelar
              </button>
            )}
            <button
              className="btn-primary create-btn"
              onClick={handleCreateOrUpdate}
              disabled={
                uploading || !name.trim() || (!editingItem && !imageSrc)
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Guardando...
                </>
              ) : editingItem ? (
                "Actualizar Item"
              ) : (
                "Crear Item"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="created-items-section">
        <h2 className="section-title">Ítems Forjados</h2>
        {loading && items.length === 0 ? (
          <p className="glass empty-text">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="glass empty-text">
            No has forjado ningún ítem todavía.
          </p>
        ) : (
          <div className="admin-items-grid">
            {items.map((item) => (
              <div key={item.id} className="admin-item-card glass">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="item-thumb"
                />
                <div className="item-details">
                  <strong>{item.name}</strong>
                  {item.damage && (
                    <span className="item-damage">{item.damage}</span>
                  )}
                  {item.description && (
                    <p className="item-desc">{item.description}</p>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditClick(item)}
                    title="Editar Ítem"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteClick(item.id!, item.name)}
                    title="Eliminar Ítem"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
