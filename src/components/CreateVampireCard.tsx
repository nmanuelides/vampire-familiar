import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import { generateRandomVTMCharacter } from "../utils/vtmGenerator";
import { CLANS, VTM_TRANSLATIONS } from "../data/vtm";
import type { Clan } from "../types/vtm";
import "./CreateVampireCard.scss";

export default function CreateVampireCard() {
  const { user } = useAuthStore();
  const { characters, addCharacter, loading } = useCharacterStore();

  const [name, setName] = useState("");
  const [clan, setClan] = useState<Clan>("Brujah");
  const [generation, setGeneration] = useState(13);
  const [chronicle, setChronicle] = useState("");
  const [isNewChronicle, setIsNewChronicle] = useState(false);
  const [isNPC, setIsNPC] = useState(false);

  const existingChronicles = Array.from(
    new Set(characters.map((c) => c.chronicle)),
  ).filter(Boolean);

  const forceNew = existingChronicles.length === 0;
  const showNewInput = forceNew || isNewChronicle;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (generation < 4 || generation > 13) {
      alert("La generación debe estar entre 4 y 13.");
      return;
    }

    let finalChronicle = chronicle.trim();
    if (!showNewInput && !finalChronicle && existingChronicles.length > 0) {
      finalChronicle = existingChronicles[0];
    }
    finalChronicle = finalChronicle || "Vampire Familiar";

    const playerName = isNPC
      ? "NPC"
      : user.user_metadata?.full_name || user.email || "Unknown";

    const newChar = generateRandomVTMCharacter(
      name,
      playerName,
      clan,
      generation,
      finalChronicle,
      user.id,
    );
    await addCharacter(newChar);

    // Reset form on success
    setName("");
    setChronicle("");
    setIsNewChronicle(false);
    setIsNPC(false);
  };

  return (
    <div className="card create-card">
      <form onSubmit={handleCreate} className="vampire-form">
        <h2 className="title-center">Crear Nuevo Vampiro</h2>

        <div className="form-group w-full">
          <label>Nombre del Vampiro</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduce un nombre..."
          />
        </div>

        <div className="form-group w-full">
          <label>Crónica</label>
          {!showNewInput ? (
            <select
              value={chronicle || existingChronicles[0]}
              onChange={(e) => {
                if (e.target.value === "___NEW___") {
                  setIsNewChronicle(true);
                  setChronicle("");
                } else {
                  setChronicle(e.target.value);
                }
              }}
            >
              {existingChronicles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="___NEW___">+ Crear nueva crónica...</option>
            </select>
          ) : (
            <div className="chronicle-input-group">
              <input
                type="text"
                required
                value={chronicle}
                onChange={(e) => setChronicle(e.target.value)}
                placeholder="Nombre de la nueva crónica..."
              />
              {!forceNew && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsNewChronicle(false);
                    setChronicle("");
                  }}
                  title="Seleccionar crónica existente"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Clan</label>
            <select
              value={clan}
              onChange={(e) => setClan(e.target.value as Clan)}
            >
              {CLANS.map((c) => (
                <option key={c} value={c}>
                  {VTM_TRANSLATIONS[c] || c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Generación (4 - 13)</label>
            <input
              type="number"
              required
              min={4}
              max={13}
              value={generation}
              onChange={(e) => setGeneration(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group npc-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isNPC}
              onChange={(e) => setIsNPC(e.target.checked)}
            />
            <span>NPC</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Generando Abrazado..." : "Crear Vampiro"}
        </button>
      </form>
    </div>
  );
}
