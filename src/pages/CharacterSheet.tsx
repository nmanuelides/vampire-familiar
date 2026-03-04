import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import DotTracker from "../components/DotTracker";
import type { VTMCharacter } from "../types/vtm";
import {
  getMaxTraitRating,
  VTM_TRANSLATIONS,
  ATTR_DESCRIPTIONS,
  COMMON_BACKGROUNDS,
} from "../data/vtm";
import "./CharacterSheet.scss";

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    characters,
    updateCharacter,
    deleteCharacter,
    fetchCharacters,
    loading,
  } = useCharacterStore();
  const [character, setCharacter] = useState<VTMCharacter | null>(null);

  // Fetch characters if list is empty (e.g. on direct link or refresh)
  useEffect(() => {
    if (user && characters.length === 0 && !loading) {
      fetchCharacters(user.id);
    }
  }, [user, characters.length, fetchCharacters, loading]);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found);
    } else if (!loading && characters.length > 0) {
      // Only redirect if we're not loading and the character is truly not in the non-empty list
      navigate("/");
    }
  }, [id, characters, navigate, loading]);

  if (!character || (loading && characters.length === 0))
    return <div className="loading-text">Cargando hoja de personaje...</div>;

  const maxDots = getMaxTraitRating(character.generation);

  // Helper to update deeply nested properties
  const handleUpdate = (path: string[], value: any) => {
    if (!character || !character.id) return;

    // Deep-clone the character to avoid direct mutation
    const updatedChar: any = JSON.parse(JSON.stringify(character));

    // Walk the path and set the new value
    let current = updatedChar;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    // Only send the top-level key that changed to Supabase.
    const topLevelKey = path[0] as keyof VTMCharacter;
    const partialUpdate: Partial<VTMCharacter> = {
      [topLevelKey]: updatedChar[topLevelKey],
    };

    updateCharacter(character.id, partialUpdate);
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
    alignLeft = false,
    alignRight = false,
    cost?: string,
  ) => (
    <div className="sheet-section">
      <h3 className="section-title text-center">{title}</h3>
      {cost && <div className="section-cost text-center">{cost}</div>}
      <div className="traits-list">
        {Object.entries(data)
          .sort(([keyA], [keyB]) => {
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
              alignLeft={alignLeft}
              alignRight={alignRight}
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
            <span>Naturaleza:</span>
            <input
              type="text"
              value={character.nature || ""}
              onChange={(e) => handleUpdate(["nature"], e.target.value)}
              className="inline-input"
              placeholder="Naturaleza..."
            />
          </div>
          <div className="info-group">
            <span>Conducta:</span>
            <input
              type="text"
              value={character.demeanor || ""}
              onChange={(e) => handleUpdate(["demeanor"], e.target.value)}
              className="inline-input"
              placeholder="Conducta..."
            />
          </div>
          <div className="info-group">
            <span>Concepto:</span>
            <input
              type="text"
              value={character.concept || ""}
              onChange={(e) => handleUpdate(["concept"], e.target.value)}
              className="inline-input"
              placeholder="Concepto..."
            />
          </div>
          <div className="info-group">
            <span>Clan:</span>{" "}
            {VTM_TRANSLATIONS[character.clan] || character.clan}
          </div>
          <div className="info-group">
            <span>Generación:</span>
            <input
              type="number"
              min="3"
              max="15"
              value={character.generation || 13}
              onChange={(e) =>
                handleUpdate(["generation"], parseInt(e.target.value) || 13)
              }
              className="inline-input number-input"
            />
          </div>
          <div className="info-group">
            <span>Sire:</span>
            <input
              type="text"
              value={character.sire || ""}
              onChange={(e) => handleUpdate(["sire"], e.target.value)}
              className="inline-input"
              placeholder="Sire..."
            />
          </div>
          <div className="info-group experience-group">
            <span>Experiencia:</span>
            <input
              type="number"
              min="0"
              value={character.experience || 0}
              onChange={(e) =>
                handleUpdate(["experience"], parseInt(e.target.value) || 0)
              }
              className="inline-input number-input"
            />
          </div>
        </div>

        <div className="sheet-grid">
          {/* Attributes */}
          <div className="grid-section attributes">
            <h2 className="main-title text-center">— Atributos —</h2>
            <div className="section-cost text-center">
              (costo: 5 por círculo)
            </div>
            <div className="trait-grid">
              {renderSection("Físicos", character.attributes.physical, [
                "attributes",
                "physical",
              ])}
              {renderSection(
                "Sociales",
                character.attributes.social,
                ["attributes", "social"],
                false,
                false,
              )}
              {renderSection(
                "Mentales",
                character.attributes.mental,
                ["attributes", "mental"],
                true,
                false,
              )}
            </div>
          </div>

          {/* Abilities */}
          <div className="grid-section abilities">
            <h2 className="main-title text-center">— Habilidades —</h2>
            <div className="section-cost text-center">
              (costo: 2 por círculo)
            </div>
            <div className="trait-grid">
              {renderSection("Talentos", character.abilities.talents, [
                "abilities",
                "talents",
              ])}
              {renderSection(
                "Técnicas",
                character.abilities.skills,
                ["abilities", "skills"],
                false,
                false,
              )}
              {renderSection(
                "Conocimientos",
                character.abilities.knowledges,
                ["abilities", "knowledges"],
                true,
                false,
              )}
            </div>
          </div>

          {/* Advantages */}
          <div className="grid-section advantages">
            <h2 className="main-title text-center">— Ventajas —</h2>
            <div className="trait-grid">
              {renderSection(
                "Trasfondos",
                {
                  ...COMMON_BACKGROUNDS.reduce(
                    (acc, bg) => ({ ...acc, [bg]: 0 }),
                    {},
                  ),
                  ...(character.advantages.backgrounds || {}),
                },
                ["advantages", "backgrounds"],
                true,
                false,
                "(costo: 1 por círculo)",
              )}
              {renderSection(
                "Disciplinas",
                character.advantages.disciplines,
                ["advantages", "disciplines"],
                false,
                false,
                "(costo: 7 por círculo)",
              )}
              {renderSection(
                "Virtudes",
                character.advantages.virtues,
                ["advantages", "virtues"],
                true,
                false,
                "(costo: 2 por círculo)",
              )}
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
              <h3 className="status-title">Humanidad</h3>
              <div className="section-cost text-center">
                (costo: 1 por círculo)
              </div>
              <div className="status-tracker-container">
                <DotTracker
                  label=""
                  value={character.humanity}
                  max={10}
                  onChange={(v) => handleUpdate(["humanity"], v)}
                  tooltip={ATTR_DESCRIPTIONS["humanity"]}
                />
              </div>

              <h3 className="status-title" style={{ marginTop: "2rem" }}>
                Fuerza de Voluntad Permanente
              </h3>
              <div className="section-cost text-center">
                (costo: 1 por círculo)
              </div>
              <div className="status-tracker-container">
                <DotTracker
                  label="Permanente"
                  value={character.willpower}
                  max={10}
                  onChange={(v) => handleUpdate(["willpower"], v)}
                  tooltip={ATTR_DESCRIPTIONS["willpower"]}
                  alignLeft={true}
                />
                <DotTracker
                  label="Actual"
                  value={character.willpower_current}
                  max={10}
                  onChange={(v) => handleUpdate(["willpower_current"], v)}
                />
              </div>
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
                {(
                  [
                    "bruised",
                    "hurt",
                    "injured",
                    "wounded",
                    "mauled",
                    "crippled",
                    "incapacitated",
                  ] as const
                )
                  .map(
                    (level) =>
                      [level, character.health[level]] as [string, boolean],
                  )
                  .map(([level, isChecked]) => (
                    <div key={level} className="health-level">
                      <div className="dot-label-container">
                        <span className="health-label">
                          {VTM_TRANSLATIONS[level] || level}
                        </span>
                        {ATTR_DESCRIPTIONS[level] && (
                          <div className="tooltip-box align-left">
                            <p className="tooltip-desc">
                              {ATTR_DESCRIPTIONS[level].desc}
                            </p>
                          </div>
                        )}
                      </div>
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
