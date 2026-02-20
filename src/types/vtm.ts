export type Clan =
  | "Assamite"
  | "Brujah"
  | "Followers of Set"
  | "Gangrel"
  | "Giovanni"
  | "Lasombra"
  | "Malkavian"
  | "Nosferatu"
  | "Ravnos"
  | "Toreador"
  | "Tremere"
  | "Tzimisce"
  | "Ventrue";

export interface VTMCharacter {
  id?: string;
  user_id?: string;
  name: string;
  player: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  concept: string;
  generation: number;
  sire: string;
  clan: Clan;

  attributes: {
    physical: {
      strength: number;
      dexterity: number;
      stamina: number;
    };
    social: {
      charisma: number;
      manipulation: number;
      appearance: number;
    };
    mental: {
      perception: number;
      intelligence: number;
      wits: number;
    };
  };

  abilities: {
    talents: {
      alertness: number;
      athletics: number;
      brawl: number;
      dodge: number;
      empathy: number;
      expression: number;
      intimidation: number;
      leadership: number;
      streetwise: number;
      subterfuge: number;
    };
    skills: {
      animalKen: number;
      crafts: number;
      drive: number;
      etiquette: number;
      firearms: number;
      melee: number;
      performance: number;
      security: number;
      stealth: number;
      survival: number;
    };
    knowledges: {
      academics: number;
      computer: number;
      finance: number;
      investigation: number;
      law: number;
      linguistics: number;
      medicine: number;
      occult: number;
      politics: number;
      science: number;
    };
  };

  advantages: {
    disciplines: Record<string, number>;
    backgrounds: Record<string, number>;
    virtues: {
      conscience: number;
      selfControl: number;
      courage: number;
    };
  };

  humanity: number;
  willpower: number;
  willpower_current: number;
  blood_pool: number;
  blood_pool_current: number;

  health: {
    bruised: boolean;
    hurt: boolean;
    injured: boolean;
    wounded: boolean;
    mauled: boolean;
    crippled: boolean;
    incapacitated: boolean;
  };

  created_at?: string;
  creator_name?: string;
  creator_avatar_url?: string;
}
