import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import DotTracker from "../components/DotTracker";
import type { VTMCharacter } from "../types/vtm";
import {
  getMaxTraitRating,
  getMaxBloodPool,
  VTM_TRANSLATIONS,
  ATTR_DESCRIPTIONS,
  COMMON_BACKGROUNDS,
  CLAN_DISCIPLINES,
  EXP_COSTS,
} from "../data/vtm";
import { Lock, LockOpen, Save } from "lucide-react";
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
    subscribeToCharacterUpdates,
    loading,
  } = useCharacterStore();

  const characterFromStore = characters.find((c) => c.id === id);
  const [localChar, setLocalChar] = useState<VTMCharacter | null>(null);
  const [spendingError, setSpendingError] = useState<string | null>(null);

  const isAdmin =
    user?.email === "magatsu82@gmail.com" ||
    user?.email === "magatsu83@gmail.com";
  const isLocked = characterFromStore?.is_locked ?? true;
  const isOwner = characterFromStore?.user_id === user?.id;

  // Fetch characters if list is empty (e.g. on direct link or refresh)
  useEffect(() => {
    if (user && characters.length === 0 && !loading) {
      fetchCharacters(user.id);
    }
  }, [user, characters.length, fetchCharacters, loading]);

  // Real-time subscription for the current character
  useEffect(() => {
    if (id) {
      const unsubscribe = subscribeToCharacterUpdates(id);
      return () => unsubscribe();
    }
  }, [id, subscribeToCharacterUpdates]);

  const prevLockedRef = useRef(characterFromStore?.is_locked);

  useEffect(() => {
    if (characterFromStore) {
      // Initialize or re-sync localChar if lock status changes to UNLOCKED
      if (
        !localChar ||
        characterFromStore.is_locked !== prevLockedRef.current
      ) {
        setLocalChar(JSON.parse(JSON.stringify(characterFromStore)));
      }
      prevLockedRef.current = characterFromStore.is_locked;
    } else if (!loading && characters.length > 0) {
      navigate("/");
    }
  }, [id, characterFromStore, navigate, loading]);

  if (!characterFromStore || !localChar || (loading && characters.length === 0))
    return <div className="loading-text">Cargando hoja de personaje...</div>;

  const maxDots = getMaxTraitRating(localChar.generation);

  // Helper to update local buffer
  const handleUpdate = (path: string[], value: any) => {
    if (!localChar || isLocked) return;

    const updatedChar: any = JSON.parse(JSON.stringify(localChar));
    let current = updatedChar;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    // Special case: Update generation and blood pool when Generation background changes
    if (
      path.join(".") === "advantages.backgrounds.Generation" ||
      (path[0] === "advantages" && path[1] === "backgrounds" && path[2] === "Generation")
    ) {
      const genDots = value;
      const newGen = 13 - genDots;
      updatedChar.generation = newGen;
      const newMaxBlood = getMaxBloodPool(newGen);
      if (newMaxBlood !== undefined) {
        updatedChar.blood_pool = newMaxBlood;
        if (updatedChar.blood_pool_current > newMaxBlood) {
          updatedChar.blood_pool_current = newMaxBlood;
        }
      }
    }

    // 2. Validate costs
    const currentCosts = calculateDetailedCosts(localChar);
    const projectedCosts = calculateDetailedCosts(updatedChar);
    
    // STRICT BLOCK: Never allow expRemaining to go negative
    const isNowNegative = projectedCosts.expRemaining < 0;
    
    // Also block exceeding 15 freebies
    const isExceedingFreebies = projectedCosts.freebiesSpent > 15;
    
    // We only allow the update if:
    // 1. The result is valid (both exp and freebies are within limits)
    // 2. OR we are in an invalid state but the change is IMPROVING it (decreasing freebies or increasing exp)
    const isValid = !isNowNegative && !isExceedingFreebies;
    
    const isImproving = (projectedCosts.expRemaining > currentCosts.expRemaining) || 
                        (projectedCosts.freebiesSpent < currentCosts.freebiesSpent);

    if (!isValid && !isImproving) {
      // Trigger error animation on the specific dot being changed
      const traitKey = path[path.length - 1];
      setSpendingError(traitKey);
      setTimeout(() => setSpendingError(null), 1000);
      return; // DO NOT update localChar
    }

    setLocalChar(updatedChar);
  };

  const handleToggleLock = async () => {
    if (!characterFromStore?.id || !isAdmin) return;
    const newLockStatus = !isLocked;
    await updateCharacter(characterFromStore.id, { is_locked: newLockStatus });
  };

  const handleSave = async () => {
    if (!characterFromStore?.id || !localChar || isLocked) return;
    // Save all changes and re-lock
    await updateCharacter(characterFromStore.id, {
      ...localChar,
      is_locked: true,
    });
  };

  const handleDelete = async () => {
    if (!characterFromStore?.id) return;
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este vampiro para siempre?",
      )
    ) {
      await deleteCharacter(characterFromStore.id);
      navigate("/");
    }
  };

  const getPointsSpent = (
    data: Record<string, number>,
    type: "attribute" | "ability" | "virtue" | "other",
  ) => {
    return Object.entries(data).reduce((acc, [key, val]) => {
      if (type === "attribute") {
        if (localChar.clan === "Nosferatu" && key === "appearance") {
          return acc + val;
        }
        return acc + Math.max(0, val - 1);
      }
      if (type === "virtue") {
        return acc + Math.max(0, val - 1);
      }
      return acc + val;
    }, 0);
  };

  const calculateDetailedCosts = (char = localChar) => {
    if (!char) return { freebiesSpent: 0, expSpent: 0, expRemaining: 0 };
    interface IncrementalDot {
      label: string;
      level: number;
      freebieCost: number;
      expCost: number;
      type: "attr" | "abil" | "back" | "disc" | "virtue" | "humanity" | "wp";
    }
    // 1. Attributes - Stable Calculation
    // Multiplier for Attributes is 3 (Standard: 4, User: 4-1=3)
    const getAttrDots = (data: Record<string, number>): IncrementalDot[] => {
      const dots: IncrementalDot[] = [];
      Object.entries(data).forEach(([key, val]) => {
        const base = (char.clan === "Nosferatu" && key === "appearance") ? 0 : 1;
        for (let i = base + 1; i <= val; i++) {
          dots.push({
            label: key,
            level: i,
            freebieCost: 5,
            // Rating * Multiplier. i-1 is the rating BEFORE this dot.
            expCost: (i - 1) * EXP_COSTS.ATTRIBUTE_MULT,
            type: "attr",
          });
        }
      });
      return dots;
    };

    const physDots = getAttrDots(char.attributes.physical);
    const socDots = getAttrDots(char.attributes.social);
    const mentDots = getAttrDots(char.attributes.mental);

    // Calculate which category is Primary (7), Secondary (5), Tertiary (3)
    // based on which has MOST dots to maximize pool usage.
    const attrCategories = [
      { dots: physDots, name: "Physical" },
      { dots: socDots, name: "Social" },
      { dots: mentDots, name: "Mental" },
    ].sort((a,b) => b.dots.length - a.dots.length);

    const pools = [7, 5, 3];
    const attrExcess: IncrementalDot[] = [];
    attrCategories.forEach((cat, idx) => {
      const poolSize = pools[idx];
      // Create dots are always the LOWEST levels.
      const sorted = [...cat.dots].sort((a,b) => a.level - b.level);
      attrExcess.push(...sorted.slice(poolSize));
    });


    // 2. Abilities - STABLE POOLS (Talents: 15, Skills: 9, Knowledges: 5)
    // Re-sorting (15/9/5) also causes jumps. Fixed order: Talents > Skills > Knowledges.
    const getAbilDots = (data: Record<string, number>): IncrementalDot[] => {
      const dots: IncrementalDot[] = [];
      Object.entries(data).forEach(([key, val]) => {
        for (let i = 1; i <= val; i++) {
          dots.push({
            label: key,
            level: i,
            freebieCost: 2,
            // (Level - 1) * Mult. (e.g. Level 3 costs 2 * 1 = 2)
            expCost: i === 1 ? EXP_COSTS.NEW_ABILITY : (i - 1) * EXP_COSTS.ABILITY_MULT,
            type: "abil",
          });
        }
      });
      return dots;
    };

    // 2. Abilities - Stable Calculation
    // Multiplier for Abilities is 1 (Standard: 2, User: 2-1=1)
    const talDots = getAbilDots(char.abilities.talents);
    const skiDots = getAbilDots(char.abilities.skills);
    const knoDots = getAbilDots(char.abilities.knowledges);

    const abilCategories = [
      { dots: talDots, name: "Talents" },
      { dots: skiDots, name: "Skills" },
      { dots: knoDots, name: "Knowledges" },
    ].sort((a,b) => b.dots.length - a.dots.length);

    const abilPools = [15, 9, 5];
    const abilExcess: IncrementalDot[] = [];
    abilCategories.forEach((cat, idx) => {
      const poolSize = abilPools[idx];
      const sorted = [...cat.dots].sort((a,b) => a.level - b.level);
      abilExcess.push(...sorted.slice(poolSize));
    });


    // 3. Backgrounds (Trasfondos)
    const backDots: IncrementalDot[] = [];
    Object.entries(char.advantages.backgrounds || {}).forEach(([key, val]) => {
      for (let i = 1; i <= val; i++) {
        backDots.push({
          label: key,
          level: i,
          freebieCost: 1,
          expCost: 1, 
          type: "back",
        });
      }
    });
    // For backgrounds, we sort by level to ensure the pool covers the first 5 dots.
    const sortedBack = [...backDots].sort((a, b) => a.level - b.level);
    const backExcess = sortedBack.slice(5);

    // 4. Disciplines
    const discDots: IncrementalDot[] = [];
    const clanDisciplines = CLAN_DISCIPLINES[char.clan] || [];
    
    Object.entries(char.advantages.disciplines).forEach(([key, val]) => {
      const isClan = clanDisciplines.includes(key);
      for (let i = 1; i <= val; i++) {
        let exp;
        if (i === 1) exp = EXP_COSTS.NEW_DISCIPLINE;
        else {
          if (isClan) exp = (i - 1) * EXP_COSTS.CLAN_DISCIPLINE_MULT;
          else exp = (i - 1) * EXP_COSTS.OTHER_DISCIPLINE_MULT;
        }
        discDots.push({
          label: key,
          level: i,
          freebieCost: 7,
          expCost: exp,
          type: "disc",
        });
      }
    });
    const sortedDisc = [...discDots].sort((a, b) => a.level - b.level);
    const discExcess = sortedDisc.slice(4);

    // 5. Virtues
    const virtDots: IncrementalDot[] = [];
    Object.entries(char.advantages.virtues).forEach(([key, val]) => {
      // Virtues have a base of 1.
      for (let i = 2; i <= val; i++) {
        virtDots.push({
          label: key,
          level: i,
          freebieCost: 2,
          // (Level - 1) * Mult.
          expCost: (i - 1) * EXP_COSTS.VIRTUE_MULT,
          type: "virtue",
        });
      }
    });
    const sortedVirt = [...virtDots].sort((a, b) => a.level - b.level);
    const virtExcess = sortedVirt.slice(7);

    // 6. Humanity & Willpower
    const baseHum = char.advantages.virtues.conscience + char.advantages.virtues.selfControl;
    const humanityExcess: IncrementalDot[] = [];
    for (let i = baseHum + 1; i <= char.humanity; i++) {
      humanityExcess.push({
        label: "Humanity",
        level: i,
        freebieCost: 1,
        expCost: (i - 1) * EXP_COSTS.HUMANITY_MULT,
        type: "humanity",
      });
    }

    const baseWP = char.advantages.virtues.courage;
    const wpExcess: IncrementalDot[] = [];
    for (let i = baseWP + 1; i <= char.willpower; i++) {
      wpExcess.push({
        label: "Willpower",
        level: i,
        freebieCost: 1,
        // For WP, the incremental cost is usually 1 (or current rating).
        // If current rating, it's (i-1) * 1.
        expCost: (i - 1) * EXP_COSTS.WILLPOWER_MULT,
        type: "wp",
      });
    }

    // Allocation of Freebies/EXP
    const allCandidates = [
      ...attrExcess,
      ...abilExcess,
      ...backExcess,
      ...discExcess,
      ...virtExcess,
      ...humanityExcess,
      ...wpExcess,
    ];

    // Greedy sorting for Freebies (Best Value = Highest EXP cost)
    allCandidates.sort((a, b) => b.expCost - a.expCost);

    let freebiesLeft = 15;
    let expSpent = 0;
    let freebiesSpent = 0;

    console.log("--- COST CALCULATION LOG ---");
    allCandidates.forEach((dot, idx) => {
      if (freebiesLeft >= dot.freebieCost) {
        console.log(`[FREEBIE] ${dot.label} (Level ${dot.level}): Cost 0 EXP (Used Freebie ${dot.freebieCost})`);
        freebiesLeft -= dot.freebieCost;
        freebiesSpent += dot.freebieCost;
      } else {
        console.log(`[EXP] ${dot.label} (Level ${dot.level}): Cost ${dot.expCost} EXP`);
        expSpent += dot.expCost;
      }
    });
    console.log(`TOTALS: Freebies Spent: ${freebiesSpent} | EXP Spent: ${expSpent}`);

    console.log("FINAL TOTALS:", { freebiesSpent, expSpent, expRemaining: (char.experience || 0) - expSpent });

    return {
      freebiesSpent,
      expSpent,
      expRemaining: (char.experience || 0) - expSpent,
    };
  };

  const costDetails = calculateDetailedCosts();

  const renderSection = (
    title: string,
    data: Record<string, number>,
    pathPrefix: string[],
    cost?: string,
    isDiscipline = false,
    mobileAlignRight = false,
    desktopAlignRight = false,
    spentPoints?: number,
  ) => (
    <div className="sheet-section">
      <h3 className="section-title text-center">
        {title} {spentPoints !== undefined && `(${spentPoints})`}
      </h3>
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
              mobileAlignRight={mobileAlignRight}
              desktopAlignRight={desktopAlignRight}
              isDiscipline={isDiscipline}
              readOnly={isLocked}
              flashing={spendingError === key}
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
          {localChar.creator_avatar_url ? (
            <img
              src={localChar.creator_avatar_url}
              alt={localChar.creator_name || localChar.player}
              className="header-avatar"
            />
          ) : (
            <div className="header-avatar-placeholder">
              {(localChar.creator_name || localChar.player || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <span>
            {localChar.name} - {localChar.player}
          </span>
        </div>
      </header>

      <div className="sheet-body card" data-clan={localChar.clan}>
        <div className="top-info bg-dark">
          <div className="info-group">
            <span>Nombre:</span> {localChar.name}
          </div>
          <div className="info-group">
            <span>Jugador:</span> {localChar.player}
          </div>
          <div className="info-group">
            <span>Crónica:</span> {localChar.chronicle}
          </div>
          <div className="info-group">
            <span>Naturaleza:</span>
            <input
              type="text"
              value={localChar.nature || ""}
              onChange={(e) => handleUpdate(["nature"], e.target.value)}
              className="inline-input"
              placeholder="Naturaleza..."
              readOnly={isLocked}
            />
          </div>
          <div className="info-group">
            <span>Conducta:</span>
            <input
              type="text"
              value={localChar.demeanor || ""}
              onChange={(e) => handleUpdate(["demeanor"], e.target.value)}
              className="inline-input"
              placeholder="Conducta..."
              readOnly={isLocked}
            />
          </div>
          <div className="info-group">
            <span>Concepto:</span>
            <input
              type="text"
              value={localChar.concept || ""}
              onChange={(e) => handleUpdate(["concept"], e.target.value)}
              className="inline-input"
              placeholder="Concepto..."
              readOnly={isLocked}
            />
          </div>
          <div className="info-group">
            <span>Clan:</span>{" "}
            {VTM_TRANSLATIONS[localChar.clan] || localChar.clan}
          </div>
          <div className="info-group">
            <span>Generación:</span>
            <span className="gen-display">{localChar.generation}.ª</span>
          </div>
          <div className="info-group">
            <span>Sire:</span>
            <input
              type="text"
              value={localChar.sire || ""}
              onChange={(e) => handleUpdate(["sire"], e.target.value)}
              className="inline-input"
              placeholder="Sire..."
              readOnly={isLocked}
            />
          </div>
          <div className="info-group experience-group">
            <div className="exp-item">
              <span>Experiencia:</span>
              <input
                type="number"
                min="0"
                value={localChar.experience || 0}
                onChange={(e) =>
                  handleUpdate(["experience"], parseInt(e.target.value) || 0)
                }
                className="inline-input number-input"
                readOnly={isLocked}
              />
            </div>
            <div className={`freebie-badge ${(15 - costDetails.freebiesSpent) < 0 || costDetails.expRemaining < 0 ? "negative" : ""}`}>
              Puntos Gratuitos: {15 - costDetails.freebiesSpent}
            </div>
            {costDetails.expSpent > 0 && (
              <div className={`freebie-badge exp-badge ${costDetails.expRemaining < 0 ? "negative" : ""}`}>
                Exp Gastada: {costDetails.expSpent} | Restante: {costDetails.expRemaining}
              </div>
            )}
          </div>
        </div>

        <div className="sheet-grid">
          {/* Attributes */}
          <div className="grid-section attributes">
            <h2 className="main-title text-center">— Atributos —</h2>
            <div className="section-cost text-center">
              (pools: 7/5/3 | costo extra: 5)
            </div>
            <div className="trait-grid">
              {renderSection(
                "Físicos",
                localChar.attributes.physical,
                ["attributes", "physical"],
                undefined,
                false,
                false,
                false,
                getPointsSpent(localChar.attributes.physical, "attribute"),
              )}
              {renderSection(
                "Sociales",
                localChar.attributes.social,
                ["attributes", "social"],
                undefined,
                false,
                true, // mobileAlignRight
                false,
                getPointsSpent(localChar.attributes.social, "attribute"),
              )}
              {renderSection(
                "Mentales",
                localChar.attributes.mental,
                ["attributes", "mental"],
                undefined,
                false,
                false,
                true, // desktopAlignRight
                getPointsSpent(localChar.attributes.mental, "attribute"),
              )}
            </div>
          </div>

          {/* Abilities */}
          <div className="grid-section abilities">
            <h2 className="main-title text-center">— Habilidades —</h2>
            <div className="section-cost text-center">
              (pools: 15/9/5 | costo extra: 2)
            </div>
            <div className="trait-grid">
              {renderSection(
                "Talentos",
                localChar.abilities.talents,
                ["abilities", "talents"],
                undefined,
                false,
                false,
                false,
                getPointsSpent(localChar.abilities.talents, "ability"),
              )}
              {renderSection(
                "Técnicas",
                localChar.abilities.skills,
                ["abilities", "skills"],
                undefined,
                false,
                true, // mobileAlignRight
                false,
                getPointsSpent(localChar.abilities.skills, "ability"),
              )}
              {renderSection(
                "Conocimientos",
                localChar.abilities.knowledges,
                ["abilities", "knowledges"],
                undefined,
                false,
                false,
                true, // desktopAlignRight
                getPointsSpent(localChar.abilities.knowledges, "ability"),
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
                  ...(localChar.advantages.backgrounds || {}),
                },
                ["advantages", "backgrounds"],
                "(pool: 5 | costo extra: 1)",
                false,
                false,
                false,
                getPointsSpent(localChar.advantages.backgrounds || {}, "other"),
              )}
              {renderSection(
                "Disciplinas",
                localChar.advantages.disciplines,
                ["advantages", "disciplines"],
                "(pool: 4 | costo extra: 7)",
                true,
                true, // mobileAlignRight
                false,
                getPointsSpent(localChar.advantages.disciplines, "other"),
              )}
              {renderSection(
                "Virtudes",
                localChar.advantages.virtues,
                ["advantages", "virtues"],
                "(pool: 7 | costo extra: 2)",
                false,
                false,
                true, // desktopAlignRight
                getPointsSpent(localChar.advantages.virtues, "virtue"),
              )}
            </div>
          </div>

          {/* Merits and Flaws */}
          <div className="grid-section merits-flaws">
            <h2 className="main-title text-center">— Méritos y Defectos —</h2>
            <div className="merits-flaws-container">
              {!isLocked && (
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
                            ...(localChar.merits_and_flaws || []),
                            {
                              name: nameInput.value.trim(),
                            },
                          ];
                          handleUpdate(["merits_and_flaws"], newList);
                          nameInput.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    className="add-mf-btn"
                    onClick={() => {
                      const nameInput = document.getElementById(
                        "new-mf-name",
                      ) as HTMLInputElement;
                      if (nameInput.value.trim()) {
                        const newList = [
                          ...(localChar.merits_and_flaws || []),
                          {
                            name: nameInput.value.trim(),
                          },
                        ];
                        handleUpdate(["merits_and_flaws"], newList);
                        nameInput.value = "";
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              )}
              <div className="merits-flaws-list">
                {(localChar.merits_and_flaws || []).map((mf, idx) => (
                  <div key={idx} className="mf-item">
                    <span className="mf-name">{mf.name}</span>
                    {!isLocked && (
                      <button
                        className="mf-remove"
                        onClick={() => {
                          const newList = (
                            localChar.merits_and_flaws || []
                          ).filter((_, i) => i !== idx);
                          handleUpdate(["merits_and_flaws"], newList);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status and Health */}
          <div className="status-grid">
            <div className="status-col">
              <h3 className="status-title">Estado</h3>
              <div className="section-cost text-center">
                (costo: 1 por círculo)
              </div>
              <div className="status-tracker-container">
                <DotTracker
                  label="Humanidad"
                  value={localChar.humanity}
                  max={10}
                  onChange={(v) => handleUpdate(["humanity"], v)}
                  tooltip={ATTR_DESCRIPTIONS["humanity"]}
                  readOnly={isLocked}
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
                  value={localChar.willpower}
                  max={10}
                  onChange={(v) => handleUpdate(["willpower"], v)}
                  tooltip={ATTR_DESCRIPTIONS["willpower"]}
                  readOnly={isLocked}
                />
                <DotTracker
                  label="Actual"
                  value={localChar.willpower_current}
                  max={10}
                  onChange={(v) => handleUpdate(["willpower_current"], v)}
                  readOnly={isLocked}
                />
              </div>
            </div>

            <div className="status-col">
              <h3 className="section-title">Reserva de Sangre</h3>
              <div className="blood-pool-grid">
                {Array.from({ length: localChar.blood_pool || 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`blood-box ${i < localChar.blood_pool_current ? "filled" : ""}`}
                    onClick={() => {
                      if (isLocked) return;
                      const newVal =
                        i + 1 === localChar.blood_pool_current ? i : i + 1;
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
                      [level, localChar.health[level]] as [string, boolean],
                  )
                  .map(([level, isChecked]) => (
                    <div key={level} className="health-level">
                      <div className="tooltip-anchor">
                        <span className="health-label">
                          {VTM_TRANSLATIONS[level] || level}
                        </span>
                        {ATTR_DESCRIPTIONS[level] && (
                          <div className="tooltip-box desktop-align-right">
                            <p className="tooltip-desc">
                              {ATTR_DESCRIPTIONS[level].desc}
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (isLocked) return;
                          handleUpdate(["health", level], e.target.checked);
                        }}
                        disabled={isLocked}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fab-container">
        {isAdmin && (
          <button
            className={`fab-button ${isLocked ? "locked" : ""}`}
            onClick={handleToggleLock}
            title={isLocked ? "Desbloquear Ficha" : "Bloquear Ficha"}
          >
            {isLocked ? <Lock /> : <LockOpen />}
          </button>
        )}
        {!isLocked && (isAdmin || isOwner) && (
          <button
            className="fab-button save"
            onClick={handleSave}
            title="Guardar Cambios"
          >
            <Save />
          </button>
        )}
      </div>

      <div className="sheet-navigation" style={{ justifyContent: "center" }}>
        {isAdmin && (
          <button className="delete-btn" onClick={handleDelete}>
            Eliminar Personaje
          </button>
        )}
      </div>
    </div>
  );
}
