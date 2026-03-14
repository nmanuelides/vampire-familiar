import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import DotTracker from "../components/DotTracker";
import CustomSelect from "../components/CustomSelect";
import type { VTMCharacter } from "../types/vtm";
import {
  getMaxTraitRating,
  getMaxBloodPool,
  VTM_TRANSLATIONS,
  ATTR_DESCRIPTIONS,
  COMMON_BACKGROUNDS,
  CLAN_DISCIPLINES,
  EXP_COSTS,
  ARCHETYPES,
  ARCHETYPE_DESCRIPTIONS,
  CLANS,
} from "../data/vtm";
import { Lock, LockOpen, Save, ChevronDown, ChevronUp } from "lucide-react";
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

  const isAdmin =
    user?.email === "magatsu82@gmail.com" ||
    user?.email === "magatsu83@gmail.com";
  const canEditExperience = user?.email === "magatsu82@gmail.com";
  const isLocked = characterFromStore?.is_locked ?? true;
  const isOwner = characterFromStore?.user_id === user?.id;

  const [localChar, setLocalChar] = useState<VTMCharacter | null>(null);
  const [spendingError, setSpendingError] = useState<string | null>(null);
  const [isNewNature, setIsNewNature] = useState(false);
  const [isNewDemeanor, setIsNewDemeanor] = useState(false);
  const [isNewChronicle, setIsNewChronicle] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  const allArchetypes = Array.from(
    new Set([
      ...ARCHETYPES,
      ...characters.map((c) => c.nature),
      ...characters.map((c) => c.demeanor),
    ])
  )
    .filter(Boolean)
    .sort() as string[];

  const allChronicles = Array.from(
    new Set([
      ...characters.map((c) => c.chronicle),
    ])
  )
    .filter(Boolean)
    .sort() as string[];

  // DELTA COST CALCULATION
  // To avoid "cost shuffling", we strictly calculate the exact cost of the difference
  // between the baseline character (characterFromStore) and the current localChar.
  const calculateDeltaCosts = (
    baseChar: VTMCharacter | null,
    currentChar: VTMCharacter | null
  ) => {
    if (!baseChar || !currentChar) return { freebiesSpent: 0, expSpent: 0, expRemaining: 0, baseFreebiesTotal: 0 };

    interface DiffDot {
      type: string;
      label: string;
      level: number;
      freebieCost: number;
      expCost: number;
      poolCategory: string; // E.g., "physical", "talents"
    }

    const addedDots: DiffDot[] = [];

    // Helper to compare arbitrary number records
    const compareRecords = (
      base: Record<string, number>,
      current: Record<string, number>,
      type: string,
      freebieCost: number,
      calcExp: (level: number, label: string) => number,
      poolCategory: string
    ) => {
      Object.keys(current).forEach(key => {
        const baseLevel = base[key] || 0;
        const currentLevel = current[key] || 0;
        for (let i = baseLevel + 1; i <= currentLevel; i++) {
          addedDots.push({
            type,
            label: key,
            level: i,
            freebieCost,
            expCost: calcExp(i, key),
            poolCategory
          });
        }
      });
    };


  // 1. Attributes
    const getAttrBase = (key: string) => (currentChar.clan === "Nosferatu" && key === "appearance" ? 0 : 1);
    const compareAttr = (base: Record<string, number>, current: Record<string, number>, poolCategory: string) => {
      Object.keys(current).forEach(key => {
        const baseLevel = Math.max(base[key] || 0, getAttrBase(key));
        const currentLevel = current[key] || 0;
        for (let i = baseLevel + 1; i <= currentLevel; i++) {
          addedDots.push({
            type: "attr",
            label: key,
            level: i,
            freebieCost: 5,
            expCost: (i - 1) * EXP_COSTS.ATTRIBUTE_MULT,
            poolCategory
          });
        }
      });
    };
    compareAttr(baseChar.attributes.physical, currentChar.attributes.physical, "phys");
    compareAttr(baseChar.attributes.social, currentChar.attributes.social, "soc");
    compareAttr(baseChar.attributes.mental, currentChar.attributes.mental, "ment");

    // 2. Abilities
    const calcAbilExp = (level: number) => level === 1 ? EXP_COSTS.NEW_ABILITY : (level - 1) * EXP_COSTS.ABILITY_MULT;
    compareRecords(baseChar.abilities.talents, currentChar.abilities.talents, "abil", 2, calcAbilExp, "tal");
    compareRecords(baseChar.abilities.skills, currentChar.abilities.skills, "abil", 2, calcAbilExp, "ski");
    compareRecords(baseChar.abilities.knowledges, currentChar.abilities.knowledges, "abil", 2, calcAbilExp, "kno");

    // 3. Disciplines
    const clanDisciplines = CLAN_DISCIPLINES[currentChar.clan] || [];
    const calcDiscExp = (level: number, label: string) => {
      if (level === 1) return EXP_COSTS.NEW_DISCIPLINE;
      return clanDisciplines.includes(label) 
        ? (level - 1) * EXP_COSTS.CLAN_DISCIPLINE_MULT
        : (level - 1) * EXP_COSTS.OTHER_DISCIPLINE_MULT;
    };
    compareRecords(baseChar.advantages.disciplines, currentChar.advantages.disciplines, "disc", 7, calcDiscExp, "disc");

    // 4. Backgrounds
    const calcBackExp = () => Infinity; 
    compareRecords(baseChar.advantages.backgrounds || {}, currentChar.advantages.backgrounds || {}, "back", 1, calcBackExp, "back");

    // 5. Virtues (Minimum 1)
    const getVirtueBase = (val: number | undefined) => Math.max(val || 0, 1);
    Object.keys(currentChar.advantages.virtues).forEach(key => {
      const baseLvl = getVirtueBase((baseChar.advantages.virtues as any)[key]);
      const curLvl = (currentChar.advantages.virtues as any)[key];
      for (let i = baseLvl + 1; i <= curLvl; i++) {
        addedDots.push({ type: "virtue", label: key, level: i, freebieCost: 2, expCost: (i - 1) * EXP_COSTS.VIRTUE_MULT, poolCategory: "virtue" });
      }
    });

    // 6. Humanity & Willpower
    for (let i = baseChar.humanity + 1; i <= currentChar.humanity; i++) {
        addedDots.push({ type: "humanity", label: "humanity", level: i, freebieCost: 1, expCost: (i - 1) * EXP_COSTS.HUMANITY_MULT, poolCategory: "humanity" });
    }
    for (let i = baseChar.willpower + 1; i <= currentChar.willpower; i++) {
        addedDots.push({ type: "wp", label: "willpower", level: i, freebieCost: 1, expCost: (i - 1) * EXP_COSTS.WILLPOWER_MULT, poolCategory: "wp" });
    }

    // Sort added dots predictably so stable additions behave correctly
    addedDots.sort((a, b) => a.level - b.level);

    // Calculate how many pool dots were ALREADY used in the BASE character
    const isNosf = currentChar.clan === "Nosferatu";
    const getBaseAttr = (key: string) => (isNosf && key === "appearance" ? 0 : 1);
    
    // We calculate available pools based on the BASE character.
    // However, Attributes and Abilities have dynamic 7/5/3 and 15/9/5 allocation.
    // To strictly support creation, we sort the BASE usage to figure out which pool went where.
    const baseAttrs = [
      Object.entries(baseChar.attributes.physical).reduce((s, [k,v]) => s + Math.max(0, v - getBaseAttr(k)), 0),
      Object.entries(baseChar.attributes.social).reduce((s, [k,v]) => s + Math.max(0, v - getBaseAttr(k)), 0),
      Object.entries(baseChar.attributes.mental).reduce((s, [k,v]) => s + Math.max(0, v - getBaseAttr(k)), 0)
    ];
    // We map categories to their dynamic sizes by checking which one currently uses the most in BASE
    // But since session additions might cross thresholds, we track global Remaining Pool space for each tier type
    
    // Simpler and more accurate: Base Pools act as global "Free Spaces" per tier
    const getBaseSum = (data: Record<string, number>, baseValue = 0) => Object.values(data).reduce((s, v) => s + Math.max(0, v - baseValue), 0);
    
    let attrPoolRemaining = Math.max(0, 15 - (baseAttrs[0] + baseAttrs[1] + baseAttrs[2])); // 7+5+3 = 15 total attributes
    
    const baseAbilsTotal = getBaseSum(baseChar.abilities.talents) + getBaseSum(baseChar.abilities.skills) + getBaseSum(baseChar.abilities.knowledges);
    let abilPoolRemaining = Math.max(0, 29 - baseAbilsTotal); // 15+9+5 = 29
    
    let discPoolRemaining = Math.max(0, 3 - getBaseSum(baseChar.advantages.disciplines));
    let backPoolRemaining = Math.max(0, 5 - getBaseSum(baseChar.advantages.backgrounds || {}));
    
    let virtBaseSum = Object.values(baseChar.advantages.virtues).reduce((s, v) => s + Math.max(0, v - 1), 0);
    let virtPoolRemaining = Math.max(0, 7 - virtBaseSum);

    // First pass: Consume Pools
    const finalDots: DiffDot[] = [];
    addedDots.forEach(dot => {
      let absorbed = false;
      if (dot.type === "attr" && attrPoolRemaining > 0) {
        attrPoolRemaining--; absorbed = true;
      } else if (dot.type === "abil" && abilPoolRemaining > 0) {
        abilPoolRemaining--; absorbed = true;
      } else if (dot.type === "disc" && discPoolRemaining > 0) {
        discPoolRemaining--; absorbed = true;
      } else if (dot.type === "back" && backPoolRemaining > 0) {
        backPoolRemaining--; absorbed = true;
      } else if (dot.type === "virtue" && virtPoolRemaining > 0) {
        virtPoolRemaining--; absorbed = true;
      } else if (dot.type === "humanity" && dot.level <= (currentChar.advantages.virtues.conscience + currentChar.advantages.virtues.selfControl)) {
        absorbed = true;
      } else if (dot.type === "wp" && dot.level <= currentChar.advantages.virtues.courage) {
        absorbed = true;
      }
      if (!absorbed) finalDots.push(dot);
    });

    // We must calculate how many freebies the BASE character has already used.
    let baseGlobalFreebies = calculateBaseAbsoluteFreebies(baseChar);
    let freebiesLeft = Math.max(0, 15 - baseGlobalFreebies);
    
    let sessionExpSpent = 0;
    let sessionFreebiesSpent = 0;

    finalDots.forEach(dot => {
        if (freebiesLeft >= dot.freebieCost) {
            freebiesLeft -= dot.freebieCost;
            sessionFreebiesSpent += dot.freebieCost;
        } else {
            sessionExpSpent += dot.expCost;
        }
    });

    return {
        baseFreebiesTotal: baseGlobalFreebies,
        freebiesSpent: sessionFreebiesSpent,
        expSpent: sessionExpSpent,
        expRemaining: (currentChar.experience || 0) - sessionExpSpent
    };
  };

  // Helper to calculate total freebies used up by the base character state
  const calculateBaseAbsoluteFreebies = (char: VTMCharacter) => {
      let spent = 0;
      
      // Attr: Base is 1 (except Nosferatu Appearance is 0). Pools are 7/5/3 Extra Dots.
      const getAttrDots = (data: Record<string, number>, isNosferatu: boolean) => {
          let extraDots = 0;
          Object.entries(data).forEach(([key, val]) => {
              const base = isNosferatu && key === "appearance" ? 0 : 1;
              extraDots += Math.max(0, val - base);
          });
          return extraDots;
      };
      const isNosf = char.clan === "Nosferatu";
      const attrCategories = [
          getAttrDots(char.attributes.physical, isNosf),
          getAttrDots(char.attributes.social, isNosf),
          getAttrDots(char.attributes.mental, isNosf)
      ].sort((a,b)=>b-a);
      
      spent += Math.max(0, attrCategories[0] - 7) * 5;
      spent += Math.max(0, attrCategories[1] - 5) * 5;
      spent += Math.max(0, attrCategories[2] - 3) * 5;

      // Abil: Base is 0. Pools 15/9/5.
      const getAbilDots = (data: Record<string, number>) => Object.values(data).reduce((a,b)=>a+b,0);
      const abilCategories = [
          getAbilDots(char.abilities.talents),
          getAbilDots(char.abilities.skills),
          getAbilDots(char.abilities.knowledges)
      ].sort((a,b)=>b-a);
      
      spent += Math.max(0, abilCategories[0] - 15) * 2;
      spent += Math.max(0, abilCategories[1] - 9) * 2;
      spent += Math.max(0, abilCategories[2] - 5) * 2;

      // Disc: Base is 0. Pool 3.
      spent += Math.max(0, Object.values(char.advantages.disciplines).reduce((a,b)=>a+b,0) - 3) * 7;
      
      // Back: Base is 0. Pool 5.
      spent += Math.max(0, Object.values(char.advantages.backgrounds || {}).reduce((a,b)=>a+b,0) - 5) * 1;
      
      // Virtues: Base is 1. Pool 7.
      let virtDots = 0;
      Object.values(char.advantages.virtues).forEach(v => virtDots += Math.max(0, v - 1));
      spent += Math.max(0, virtDots - 7) * 2;
      
      // Humanity/WP base
      const baseHum = char.advantages.virtues.conscience + char.advantages.virtues.selfControl;
      spent += Math.max(0, char.humanity - baseHum) * 1;
      const baseWp = char.advantages.virtues.courage;
      spent += Math.max(0, char.willpower - baseWp) * 1;

      // We only care about the absolute 15 freebies. Everything functionally above 15 is EXP math.
      // This strict cap guarantees we never show negative freebies in the UI.
      return Math.min(15, spent);
  };

  useEffect(() => {
    // The previous delta baseline setter is no longer necessary
    // because baseline is natively tracked via `characterFromStore` vs `localChar`.
  }, [isLocked, characterFromStore]);

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
      (path[0] === "advantages" &&
        path[1] === "backgrounds" &&
        path[2] === "Generation")
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
    // 3. Update Humanity/Willpower when Virtues change (Initial creation pool logic)
    if (path[0] === "advantages" && path[1] === "virtues") {
      const v = updatedChar.advantages.virtues;
      // Derived stats are updated automatically to match virtue sums/values
      updatedChar.humanity = v.conscience + v.selfControl;
      updatedChar.willpower = v.courage;
      updatedChar.willpower_current = updatedChar.willpower;
    }

    // 4. Validate costs (Using strict Delta from Store)
    const projectedCosts = calculateDeltaCosts(characterFromStore, updatedChar);
    
    // STRICT BLOCK: Never allow session expRemaining to go negative
    const projectedExpRemaining = (updatedChar.experience || 0) - projectedCosts.expSpent;
    const isNowNegative = projectedExpRemaining < 0;

    // Total freebies = base global + session delta
    const totalFreebies = projectedCosts.baseFreebiesTotal + projectedCosts.freebiesSpent;
    const isExceedingFreebies = totalFreebies > 15;

    const isValid = !isNowNegative && !isExceedingFreebies;

    // Determine if we are improving (removing dots to recover EXP/Freebies)
    const currentCosts = calculateDeltaCosts(characterFromStore, localChar);
    const isImproving =
      projectedExpRemaining > ((localChar.experience || 0) - currentCosts.expSpent) ||
      totalFreebies < (currentCosts.baseFreebiesTotal + currentCosts.freebiesSpent);

    if (!isValid && !isImproving) {
      // Trigger error animation on the specific dot being changed
      const traitKey = path[path.length - 1];
      console.log("Validation Failed: ", traitKey, " Project EXP Details:", projectedCosts);
      
      // Use a unique string including a timestamp to ensure every click registers a state change
      setSpendingError(`${traitKey}-${Date.now()}`);
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

    // Calculate strictly the session delta EXP
    const deltaCosts = calculateDeltaCosts(characterFromStore, localChar);
    
    // Deduct only what was newly spent in this session
    const updatedChar = {
      ...localChar,
      experience: Math.max(0, (localChar.experience || 0) - deltaCosts.expSpent),
      is_locked: true,
    };

    // Save all changes and re-lock
    await updateCharacter(characterFromStore.id, updatedChar);
    setLocalChar(updatedChar);
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

  const costDetails = calculateDeltaCosts(characterFromStore, localChar);
  const totalFreebiesUsed = costDetails.baseFreebiesTotal + costDetails.freebiesSpent;

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
              flashing={spendingError?.startsWith(`${key}-`) ? spendingError : ""}
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
        <div className={`top-info bg-dark ${!isInfoExpanded ? "collapsed" : ""}`}>
          <div className="bio-info-grid">
            <div className="info-group">
            <span>Nombre:</span> {localChar.name}
          </div>
          <div className="info-group">
            <span>Jugador:</span> {localChar.player}
          </div>
          <div className="info-group">
            <span>Crónica:</span>
            {!isNewChronicle && !isLocked ? (
              <CustomSelect
                value={localChar.chronicle || ""}
                options={allChronicles}
                placeholder="Seleccionar..."
                onChange={(val) => {
                  if (val === "___NEW___") {
                    setIsNewChronicle(true);
                  } else {
                    handleUpdate(["chronicle"], val);
                  }
                }}
              />
            ) : (
              <div className="input-with-cancel">
                <input
                  type="text"
                  value={localChar.chronicle || ""}
                  onChange={(e) => handleUpdate(["chronicle"], e.target.value)}
                  className="inline-input"
                  placeholder="Crónica..."
                  readOnly={isLocked}
                  autoFocus={isNewChronicle}
                />
                {isNewChronicle && !isLocked && (
                  <button
                    className="cancel-small"
                    onClick={() => setIsNewChronicle(false)}
                    title="Cancelar"
                  >
                    &times;
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="info-group">
            <div className="tooltip-anchor">
              <span>Naturaleza:</span>
              {localChar.nature && ARCHETYPE_DESCRIPTIONS[localChar.nature] && (
                <div className="tooltip-box">
                  <p className="tooltip-desc">{localChar.nature}</p>
                  <p>{ARCHETYPE_DESCRIPTIONS[localChar.nature]}</p>
                </div>
              )}
            </div>
            {!isNewNature && !isLocked ? (
              <CustomSelect
                value={localChar.nature || ""}
                options={allArchetypes}
                descriptions={ARCHETYPE_DESCRIPTIONS}
                onChange={(val) => {
                  if (val === "___NEW___") {
                    setIsNewNature(true);
                  } else {
                    handleUpdate(["nature"], val);
                  }
                }}
              />
            ) : (
              <div className="input-with-cancel">
                <input
                  type="text"
                  value={localChar.nature || ""}
                  onChange={(e) => handleUpdate(["nature"], e.target.value)}
                  className="inline-input"
                  placeholder="Naturaleza..."
                  readOnly={isLocked}
                  autoFocus={isNewNature}
                />
                {isNewNature && !isLocked && (
                  <button
                    className="cancel-small"
                    onClick={() => {
                      setIsNewNature(false);
                    }}
                    title="Volver a lista"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="info-group">
            <div className="tooltip-anchor">
              <span>Conducta:</span>
              {localChar.demeanor && ARCHETYPE_DESCRIPTIONS[localChar.demeanor] && (
                <div className="tooltip-box">
                  <p className="tooltip-desc">{localChar.demeanor}</p>
                  <p>{ARCHETYPE_DESCRIPTIONS[localChar.demeanor]}</p>
                </div>
              )}
            </div>
            {!isNewDemeanor && !isLocked ? (
              <CustomSelect
                value={localChar.demeanor || ""}
                options={allArchetypes}
                descriptions={ARCHETYPE_DESCRIPTIONS}
                onChange={(val) => {
                  if (val === "___NEW___") {
                    setIsNewDemeanor(true);
                  } else {
                    handleUpdate(["demeanor"], val);
                  }
                }}
              />
            ) : (
              <div className="input-with-cancel">
                <input
                  type="text"
                  value={localChar.demeanor || ""}
                  onChange={(e) => handleUpdate(["demeanor"], e.target.value)}
                  className="inline-input"
                  placeholder="Conducta..."
                  readOnly={isLocked}
                  autoFocus={isNewDemeanor}
                />
                {isNewDemeanor && !isLocked && (
                  <button
                    className="cancel-small"
                    onClick={() => {
                      setIsNewDemeanor(false);
                    }}
                    title="Volver a lista"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
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
            <span>Clan:</span>
            {!isLocked ? (
              <CustomSelect
                value={localChar.clan || ""}
                options={CLANS as string[]}
                translations={VTM_TRANSLATIONS}
                showNewOption={false}
                onChange={(val) => handleUpdate(["clan"], val)}
              />
            ) : (
              <span className="gen-display">
                {VTM_TRANSLATIONS[localChar.clan] || localChar.clan}
              </span>
            )}
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
        </div>

        <button 
          className="info-toggle-btn"
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          title={isInfoExpanded ? "Contraer información" : "Expandir información"}
        >
          {isInfoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
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
            readOnly={isLocked || !canEditExperience}
          />
        </div>
        {!isLocked && (
          <>
            <div
              className={`freebie-badge ${costDetails.expRemaining < 0 ? "negative" : ""}`}
            >
              Puntos Gratuitos: {Math.max(0, 15 - totalFreebiesUsed)}
            </div>
            {costDetails.expSpent > 0 && (
              <div
                className={`freebie-badge exp-badge ${costDetails.expRemaining < 0 ? "negative" : ""}`}
              >
                Exp Gastada: {costDetails.expSpent} | Restante:{" "}
                {costDetails.expRemaining}
              </div>
            )}
          </>
        )}
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
                "(pool: 5 | no se suben con exp)",
                false,
                false,
                false,
                getPointsSpent(localChar.advantages.backgrounds || {}, "other"),
              )}
              {renderSection(
                "Disciplinas",
                localChar.advantages.disciplines,
                ["advantages", "disciplines"],
                "(pool: 3 | costo extra: 7)",
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
                {Array.from({ length: localChar.blood_pool || 10 }).map(
                  (_, i) => (
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
                  ),
                )}
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
