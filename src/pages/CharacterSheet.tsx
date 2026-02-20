import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCharacterStore } from "../store/useCharacterStore";
import DotTracker from "../components/DotTracker";
import type { VTMCharacter } from "../types/vtm";
import {
  getMaxTraitRating,
  VTM_TRANSLATIONS,
  ATTR_SORT_ORDER,
  ATTR_DESCRIPTIONS,
} from "../data/vtm";
import "./CharacterSheet.scss";

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { characters, updateCharacter, deleteCharacter } = useCharacterStore();
  const [character, setCharacter] = useState<VTMCharacter | null>(null);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found);
    } else {
      navigate("/");
    }
  }, [id, characters, navigate]);

  if (!character)
    return <div className="loading-text">Cargando hoja de personaje...</div>;

  const maxDots = getMaxTraitRating(character.generation);

  // Helper to update deeply nested properties
  const handleUpdate = (path: string[], value: any) => {
    if (!character || !character.id) return;

    // Create a deep copy using JSON parse/stringify for simplicity (no functions in our state)
    const updatedChar = JSON.parse(JSON.stringify(character));

    let current = updatedChar;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    updateCharacter(character.id, updatedChar);
  };

  const handleDelete = async () => {
    if (!character.id) return;
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este vampiro para siempre?",
      )
    ) {
      await deleteCharacter(character.id);
      navigate("/");
    }
  };

  const renderSection = (
    title: string,
    data: Record<string, number>,
    pathPrefix: string[],
  ) => (
    <div className="sheet-section">
      <h3 className="section-title text-center">{title}</h3>
      <div className="traits-list">
        {Object.entries(data)
          .sort(([keyA], [keyB]) => {
            const rankA = ATTR_SORT_ORDER[keyA];
            const rankB = ATTR_SORT_ORDER[keyB];

            if (rankA !== undefined && rankB !== undefined) {
              return rankA - rankB;
            }

            const labelA = VTM_TRANSLATIONS[keyA] || keyA;
            const labelB = VTM_TRANSLATIONS[keyB] || keyB;
            return labelA.localeCompare(labelB);
          })
          .map(([key, val]) => (
            <DotTracker
              key={key}
              label={VTM_TRANSLATIONS[key] || key}
              value={val}
              max={maxDots}
              onChange={(v) => handleUpdate([...pathPrefix, key], v)}
              tooltip={ATTR_DESCRIPTIONS[key]}
            />
          ))}
      </div>
    </div>
  );

  return (
    <div className="character-sheet-container container">
      <header className="sheet-header d-flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate("/")}>
          &larr; Volver
        </button>
        <h1 className="title">Vampiro: La Mascarada</h1>
        <button className="delete-btn" onClick={handleDelete}>
          Destruir
        </button>
      </header>

      <div className="sheet-body card" data-clan={character.clan}>
        <div className="top-info bg-dark">
          <div className="info-group">
            <span>Nombre:</span> {character.name}
          </div>
          <div className="info-group">
            <span>Jugador:</span> {character.player}
          </div>
          <div className="info-group">
            <span>Crónica:</span> {character.chronicle}
          </div>
          <div className="info-group">
            <span>Naturaleza:</span> {character.nature}
          </div>
          <div className="info-group">
            <span>Conducta:</span> {character.demeanor}
          </div>
          <div className="info-group">
            <span>Concepto:</span> {character.concept}
          </div>
          <div className="info-group">
            <span>Clan:</span>{" "}
            {VTM_TRANSLATIONS[character.clan] || character.clan}
          </div>
          <div className="info-group">
            <span>Generación:</span> {character.generation}ª
          </div>
          <div className="info-group">
            <span>Sire:</span> {character.sire}
          </div>
        </div>

        <div className="sheet-grid">
          {/* Attributes */}
          <div className="grid-section attributes">
            <h2 className="main-title text-center">— Atributos —</h2>
            <div className="d-flex justify-between gap-md stack-mobile">
              {renderSection("Físicos", character.attributes.physical, [
                "attributes",
                "physical",
              ])}
              {renderSection("Sociales", character.attributes.social, [
                "attributes",
                "social",
              ])}
              {renderSection("Mentales", character.attributes.mental, [
                "attributes",
                "mental",
              ])}
            </div>
          </div>

          {/* Abilities */}
          <div className="grid-section abilities">
            <h2 className="main-title text-center">— Habilidades —</h2>
            <div className="d-flex justify-between gap-md stack-mobile">
              {renderSection("Talentos", character.abilities.talents, [
                "abilities",
                "talents",
              ])}
              {renderSection("Técnicas", character.abilities.skills, [
                "abilities",
                "skills",
              ])}
              {renderSection("Conocimientos", character.abilities.knowledges, [
                "abilities",
                "knowledges",
              ])}
            </div>
          </div>

          {/* Advantages */}
          <div className="grid-section advantages">
            <h2 className="main-title text-center">— Ventajas —</h2>
            <div className="d-flex justify-between gap-md stack-mobile">
              {renderSection("Trasfondos", character.advantages.backgrounds, [
                "advantages",
                "backgrounds",
              ])}
              {renderSection("Disciplinas", character.advantages.disciplines, [
                "advantages",
                "disciplines",
              ])}
              {renderSection("Virtudes", character.advantages.virtues, [
                "advantages",
                "virtues",
              ])}
            </div>
          </div>

          {/* Core Stats Overlay */}
          <div className="grid-section core-stats d-flex justify-between stack-mobile gap-lg">
            <div className="status-col flex-col items-center">
              <h3 className="section-title">Humanidad</h3>
              <DotTracker
                label=""
                value={character.humanity}
                max={10}
                onChange={(v) => handleUpdate(["humanity"], v)}
              />

              <h3 className="section-title" style={{ marginTop: "2rem" }}>
                Voluntad
              </h3>
              <DotTracker
                label="Permanente"
                value={character.willpower}
                max={10}
                onChange={(v) => handleUpdate(["willpower"], v)}
              />
              <DotTracker
                label="Actual"
                value={character.willpower_current}
                max={10}
                onChange={(v) => handleUpdate(["willpower_current"], v)}
              />
            </div>

            <div className="status-col flex-col items-center">
              <h3 className="section-title">Reserva de Sangre</h3>
              <div className="blood-pool-grid">
                {Array.from({ length: character.blood_pool }).map((_, i) => (
                  <div
                    key={i}
                    className={`blood-box ${i < character.blood_pool_current ? "filled" : ""}`}
                    onClick={() => {
                      const newVal =
                        i + 1 === character.blood_pool_current ? i : i + 1;
                      handleUpdate(["blood_pool_current"], newVal);
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="status-col health-section flex-col items-center">
              <h3 className="section-title">Salud</h3>
              <div className="health-tracker">
                {Object.entries(character.health).map(([level, isChecked]) => (
                  <div
                    key={level}
                    className="health-level d-flex justify-between items-center w-full"
                  >
                    <span className="health-label">
                      {VTM_TRANSLATIONS[level] || level}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        handleUpdate(["health", level], e.target.checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
