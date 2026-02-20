import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import { generateRandomVTMCharacter } from "../utils/vtmGenerator";
import { CLANS, VTM_TRANSLATIONS } from "../data/vtm";
import type { Clan } from "../types/vtm";

export default function CreateVampireCard() {
  const { user } = useAuthStore();
  const { characters, addCharacter, loading } = useCharacterStore();

  const [name, setName] = useState("");
  const [clan, setClan] = useState<Clan>("Brujah");
  const [generation, setGeneration] = useState(13);
  const [chronicle, setChronicle] = useState("");
  const [isNewChronicle, setIsNewChronicle] = useState(false);

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

    const newChar = generateRandomVTMCharacter(
      name,
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
  };

  return (
    <div className="card create-card">
      <form
        onSubmit={handleCreate}
        className="d-flex flex-col gap-lg items-center"
      >
        <h2 className="text-center w-full">Crear Nuevo Vampiro</h2>

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
            <div className="d-flex gap-sm w-full">
              <input
                type="text"
                required
                value={chronicle}
                onChange={(e) => setChronicle(e.target.value)}
                placeholder="Nombre de la nueva crónica..."
                style={{ flex: 1 }}
              />
              {!forceNew && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewChronicle(false);
                    setChronicle("");
                  }}
                  style={{ backgroundColor: "#555", padding: "0 1rem" }}
                  title="Seleccionar crónica existente"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="d-flex gap-md w-full">
          <div className="form-group" style={{ flex: 1 }}>
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

          <div className="form-group" style={{ flex: 1 }}>
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

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: "1rem", fontSize: "1.2rem" }}
        >
          {loading ? "Generando Abrazado..." : "Crear Vampiro"}
        </button>
      </form>
    </div>
  );
}
