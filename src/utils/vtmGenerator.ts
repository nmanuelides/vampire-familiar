import type { VTMCharacter, Clan } from "../types/vtm";
import {
  CLAN_DISCIPLINES,
  COMMON_BACKGROUNDS,
  getMaxTraitRating,
  getMaxBloodPool,
} from "../data/vtm";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distributeDots(
  obj: Record<string, number>,
  points: number,
  maxPerStat: number,
) {
  const keys = Object.keys(obj);
  let remaining = points;

  while (remaining > 0) {
    const randomKey = keys[getRandomInt(0, keys.length - 1)];
    if (obj[randomKey] < maxPerStat) {
      obj[randomKey]++;
      remaining--;
    }
  }
}

export function generateRandomVTMCharacter(
  name: string,
  clan: Clan,
  generation: number,
  chronicle: string,
  userId?: string,
): VTMCharacter {
  const maxTrait = getMaxTraitRating(generation);
  const maxBlood = getMaxBloodPool(generation);

  // 1. Base Attributes (everyone starts with 1 dot in each attribute)
  const attributes = {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, appearance: 1 },
    mental: { perception: 1, intelligence: 1, wits: 1 },
  };

  // Assign 7/5/3 randomly to the three categories
  const attrPoints = [7, 5, 3];
  // shuffle attrPoints
  for (let i = attrPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [attrPoints[i], attrPoints[j]] = [attrPoints[j], attrPoints[i]];
  }

  distributeDots(attributes.physical, attrPoints[0], maxTrait);
  distributeDots(attributes.social, attrPoints[1], maxTrait);
  distributeDots(attributes.mental, attrPoints[2], maxTrait);

  // 2. Abilities (start at 0)
  const abilities = {
    talents: {
      alertness: 0,
      athletics: 0,
      brawl: 0,
      dodge: 0,
      empathy: 0,
      expression: 0,
      intimidation: 0,
      leadership: 0,
      streetwise: 0,
      subterfuge: 0,
    },
    skills: {
      animalKen: 0,
      crafts: 0,
      drive: 0,
      etiquette: 0,
      firearms: 0,
      melee: 0,
      performance: 0,
      security: 0,
      stealth: 0,
      survival: 0,
    },
    knowledges: {
      academics: 0,
      computer: 0,
      finance: 0,
      investigation: 0,
      law: 0,
      linguistics: 0,
      medicine: 0,
      occult: 0,
      politics: 0,
      science: 0,
    },
  };

  const abilityPoints = [13, 9, 5];
  for (let i = abilityPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [abilityPoints[i], abilityPoints[j]] = [abilityPoints[j], abilityPoints[i]];
  }

  // max 3 points in any ability during character creation
  const abilityMaxGen = Math.min(3, maxTrait);
  distributeDots(abilities.talents, abilityPoints[0], abilityMaxGen);
  distributeDots(abilities.skills, abilityPoints[1], abilityMaxGen);
  distributeDots(abilities.knowledges, abilityPoints[2], abilityMaxGen);

  // 3. Disciplines (3 points in clan disciplines)
  const clanDisciplines = CLAN_DISCIPLINES[clan];
  const disciplines: Record<string, number> = {};
  clanDisciplines.forEach((d) => {
    disciplines[d] = 0;
  });
  distributeDots(disciplines, 3, maxTrait);

  // 4. Backgrounds (5 points)
  const backgroundsObj: Record<string, number> = {};
  COMMON_BACKGROUNDS.forEach((b) => {
    backgroundsObj[b] = 0;
  });
  distributeDots(backgroundsObj, 5, maxTrait);

  // Filter out 0 value backgrounds
  const backgrounds: Record<string, number> = {};
  for (const [key, val] of Object.entries(backgroundsObj)) {
    if (val > 0) backgrounds[key] = val;
  }

  // 5. Virtues (7 points to distribute, but start at 1)
  const virtues = {
    conscience: 1,
    selfControl: 1,
    courage: 1,
  };
  distributeDots(virtues, 7, maxTrait);

  // 6. Humanity & Willpower
  const humanity = virtues.conscience + virtues.selfControl;
  const willpower = virtues.courage;

  return {
    user_id: userId,
    name,
    player: "NPC",
    chronicle,
    nature: "Survivor", // We could randomize these later
    demeanor: "Bravo",
    concept: "Drifter",
    generation,
    sire: "Unknown",
    clan,
    attributes,
    abilities,
    advantages: {
      disciplines,
      backgrounds,
      virtues,
    },
    humanity,
    willpower,
    willpower_current: willpower,
    blood_pool: maxBlood,
    blood_pool_current: maxBlood,
    health: {
      bruised: false,
      hurt: false,
      injured: false,
      wounded: false,
      mauled: false,
      crippled: false,
      incapacitated: false,
    },
    created_at: new Date().toISOString(),
  };
}
