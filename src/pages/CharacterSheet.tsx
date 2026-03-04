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
      <header className="sheet-navigation">
        <button className="back-btn" onClick={() => navigate("/")}>
          &larr; Volver
        </button>
        <div className="title character-header-title">
          {character.creator_avatar_url ? (
            <img
              src={character.creator_avatar_url}
              alt={character.creator_name || character.player}
              className="header-avatar"
            />
          ) : (
            <div className="header-avatar-placeholder">
              {(character.creator_name || character.player || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <span>
            {character.name} - {character.player}
          </span>
        </div>
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
            <div className="trait-grid">
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
            <div className="trait-grid">
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
            <div className="trait-grid">
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

          {/* Merits and Flaws */}
          <div className="grid-section merits-flaws">
            <h2 className="main-title text-center">— Méritos y Defectos —</h2>
            <div className="merits-flaws-container">
              <div className="mf-add-row">
                <input
                  type="text"
                  placeholder="Añadir mérito o defecto (ej: Sentidos Agudos 1)..."
                  id="new-mf-name"
                  onKeyPress={(e: any) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const nameInput = document.getElementById(
                        "new-mf-name",
                      ) as HTMLInputElement;
                      if (nameInput.value.trim()) {
                        const newList = [
                          ...(character.meritsAndFlaws || []),
                          {
                            name: nameInput.value.trim(),
                          },
                        ];
                        handleUpdate(["meritsAndFlaws"], newList);
                        nameInput.value = "";
                      }
                    }
                  }}
                />
                <button
                  className="add-mf-btn"
                  title="Añadir Mérito/Defecto"
                  onClick={() => {
                    const nameInput = document.getElementById(
                      "new-mf-name",
                    ) as HTMLInputElement;
                    if (nameInput.value.trim()) {
                      const newList = [
                        ...(character.meritsAndFlaws || []),
                        {
                          name: nameInput.value.trim(),
                        },
                      ];
                      handleUpdate(["meritsAndFlaws"], newList);
                      nameInput.value = "";
                    }
                  }}
                >
                  +
                </button>
              </div>

              {character.meritsAndFlaws &&
                character.meritsAndFlaws.length > 0 && (
                  <div className="merits-flaws-list">
                    {character.meritsAndFlaws.map((mf, index) => (
                      <div key={index} className="mf-item">
                        <span className="mf-name">{mf.name}</span>
                        <button
                          className="mf-remove"
                          title="Eliminar"
                          onClick={() => {
                            const newList = (
                              character.meritsAndFlaws || []
                            ).filter((_, i) => i !== index);
                            handleUpdate(["meritsAndFlaws"], newList);
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Core Stats Overlay */}
          <div className="status-grid">
            <div className="status-col">
              <h3 className="section-title">Humanidad</h3>
              <DotTracker
                label=""
                value={character.humanity}
                max={10}
                onChange={(v) => handleUpdate(["humanity"], v)}
              />

              <h3 className="section-title" style={{ marginTop: "2rem" }}>
                Fierza de Voluntad
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

            <div className="status-col">
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

            <div className="status-col health-section">
              <h3 className="section-title">Salud</h3>
              <div className="health-tracker">
                {Object.entries(character.health).map(([level, isChecked]) => (
                  <div key={level} className="health-level">
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
