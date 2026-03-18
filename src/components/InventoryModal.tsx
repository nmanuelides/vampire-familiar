import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useItemStore } from "../store/useItemStore";
import "./InventoryModal.scss";

interface Props {
  inventoryIds: string[];
  isAdmin: boolean;
  onClose: () => void;
  onUpdateInventory: (newIds: string[]) => void;
}

export default function InventoryModal({
  inventoryIds,
  isAdmin,
  onClose,
  onUpdateInventory,
}: Props) {
  const { items, fetchItems, loading } = useItemStore();
  const [showAddList, setShowAddList] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Items currently owned by the character (allowing duplicates)
  const ownedItemsList = inventoryIds.map((id, index) => {
    const itemDef = items.find((item) => item.id === id);
    return itemDef ? { ...itemDef, instanceId: `${id}-${index}` } : null;
  }).filter(Boolean) as any[];

  // Items available to add (all items are available, users can add multiple)
  const availableItems = items;

  const handleAddItem = (itemId: string) => {
    onUpdateInventory([...inventoryIds, itemId]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const newIds = [...inventoryIds];
    newIds.splice(indexToRemove, 1);
    onUpdateInventory(newIds);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content inventory-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="text-center main-title">Inventario</h2>

        {loading ? (
          <p className="loading-text">Cargando ítems...</p>
        ) : (
          <>
            <div className="inventory-grid">
              {ownedItemsList.length === 0 ? (
                <p className="empty-text glass">El inventario está vacío.</p>
              ) : (
                ownedItemsList.map((item, index) => (
                  <div key={item.instanceId} className="inventory-item">
                    <div className="item-image-container tooltip-anchor">
                      <img src={item.image_url} alt={item.name} />
                      
                      <div className="tooltip-box item-tooltip">
                        <strong className="item-name">{item.name}</strong>
                        {item.damage && (
                          <span className="item-damage">Daño: {item.damage}</span>
                        )}
                        {item.description && (
                          <p className="item-desc">{item.description}</p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(index)}
                        title="Eliminar del inventario"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {isAdmin && (
              <div className="admin-inventory-controls">
                <button
                  className="btn-primary toggle-add-btn"
                  onClick={() => setShowAddList(!showAddList)}
                >
                  {showAddList ? "Cerrar Lista" : <><Plus size={18} /> Añadir Ítem</>}
                </button>

                {showAddList && (
                  <div className="available-items-list glass">
                    {availableItems.length === 0 ? (
                      <p className="empty-text">No hay más ítems disponibles en la armería.</p>
                    ) : (
                      availableItems.map((item) => (
                        <div key={item.id} className="available-item-row">
                          <img src={item.image_url} alt={item.name} className="tiny-avatar" />
                          <div className="item-info">
                            <strong>{item.name}</strong>
                            <span className="tiny-desc">{item.damage || "Sin daño"}</span>
                          </div>
                          <button
                            className="btn-add-small outline"
                            onClick={() => handleAddItem(item.id!)}
                          >
                            +
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
