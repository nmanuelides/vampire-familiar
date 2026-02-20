import type { Clan } from "../types/vtm";

export const CLANS: Clan[] = [
  "Assamite",
  "Brujah",
  "Followers of Set",
  "Gangrel",
  "Giovanni",
  "Lasombra",
  "Malkavian",
  "Nosferatu",
  "Ravnos",
  "Toreador",
  "Tremere",
  "Tzimisce",
  "Ventrue",
];

export const VTM_TRANSLATIONS: Record<string, string> = {
  // Attributes
  strength: "Fuerza",
  dexterity: "Destreza",
  stamina: "Resistencia",
  charisma: "Carisma",
  manipulation: "Manipulación",
  appearance: "Apariencia",
  perception: "Percepción",
  intelligence: "Inteligencia",
  wits: "Astucia",

  // Abilities - Talents
  alertness: "Alerta",
  athletics: "Atletismo",
  brawl: "Pelea",
  dodge: "Esquivar",
  empathy: "Empatía",
  expression: "Expresión",
  intimidation: "Intimidación",
  leadership: "Liderazgo",
  streetwise: "Callejeo",
  subterfuge: "Subterfugio",

  // Abilities - Skills
  animalKen: "Trato con Animales",
  crafts: "Artesanía",
  drive: "Conducir",
  etiquette: "Etiqueta",
  firearms: "Armas de Fuego",
  melee: "Pelea con Armas",
  performance: "Interpretación",
  security: "Seguridad",
  stealth: "Sigilo",
  survival: "Supervivencia",

  // Abilities - Knowledges
  academics: "Academicismo",
  computer: "Informática",
  finance: "Finanzas",
  investigation: "Investigación",
  law: "Leyes",
  linguistics: "Lingüística",
  medicine: "Medicina",
  occult: "Ocultismo",
  politics: "Política",
  science: "Ciencias",

  // Disciplines
  Animalism: "Animalismo",
  Auspex: "Auspex",
  Celerity: "Celeridad",
  Chimerstry: "Quimerismo",
  Dementation: "Dementación",
  Dominate: "Dominación",
  Fortitude: "Fortaleza",
  Necromancy: "Nigromancia",
  Obfuscate: "Ofuscación",
  Obtenebration: "Obtenebración",
  Potence: "Potencia",
  Presence: "Presencia",
  Protean: "Protean",
  Quietus: "Extinción", // or Quietus in spanish
  Serpentis: "Serpentis",
  Thaumaturgy: "Taumaturgia",
  Vicissitude: "Vicisitud",

  // Backgrounds
  Allies: "Aliados",
  Contacts: "Contactos",
  Fame: "Fama",
  Generation: "Generación",
  Herd: "Rebaño",
  Influence: "Influencia",
  Mentor: "Mentor",
  Resources: "Recursos",
  Retainers: "Criados",
  Status: "Posición",

  // Virtues
  conscience: "Conciencia",
  selfControl: "Autocontrol",
  courage: "Coraje",

  // Health
  bruised: "Magullado",
  hurt: "Lastimado",
  injured: "Lesionado",
  wounded: "Herido",
  mauled: "Malherido",
  crippled: "Tullido",
  incapacitated: "Incapacitado",
};

export const ATTR_SORT_ORDER: Record<string, number> = {
  // Físicos
  strength: 1,
  dexterity: 2,
  stamina: 3,
  // Sociales
  charisma: 1,
  manipulation: 2,
  appearance: 3,
  // Mentales
  perception: 1,
  intelligence: 2,
  wits: 3,
};

export const ATTR_DESCRIPTIONS: Record<
  string,
  { desc: string; levels: string[] }
> = {
  strength: {
    desc: "Tu capacidad física para levantar peso, golpear y causar daño.",
    levels: [
      "1: Malo (Padeces debilidad).",
      "2: Normal (Levantas unos 50 kg).",
      "3: Bueno (Levantas unos 125 kg).",
      "4: Excepcional (Levantas unos 200 kg).",
      "5: Sobresaliente (Levantas unos 325 kg).",
    ],
  },
  dexterity: {
    desc: "Agilidad, velocidad y coordinación.",
    levels: [
      "1: Malo (Torpe).",
      "2: Normal (No sueles tropezar).",
      "3: Bueno (Buena capacidad atlética).",
      "4: Excepcional (Acróbata).",
      "5: Sobresaliente (Movimientos líquidos e impecables).",
    ],
  },
  stamina: {
    desc: "Salud general, aguante y recuperación.",
    levels: [
      "1: Malo (Frágil).",
      "2: Normal (Estás en buena forma y puedes aguantar un par de puñetazos).",
      "3: Bueno (En muy buena forma física).",
      "4: Excepcional (Puedes correr una maratón y quizas ganarla).",
      "5: Sobresaliente (Tu constitucion es realmente hercúlea).",
    ],
  },
  charisma: {
    desc: "Tu encanto, magnetismo personal e influencia.",
    levels: [
      "1: Malo (Desagradable, deja de meterte el dedo en la nariz).",
      "2: Normal (Sueles caer bien y tienes algunos amigos).",
      "3: Bueno (La gente confía en ti).",
      "4: Excepcional (Atraes a las masas, posees un gran magnetismo personal).",
      "5: Sobresaliente (Líder nato, culturas enteras podrian seguir tu luz).",
    ],
  },
  manipulation: {
    desc: "Tu capacidad para convencer o engañar a los demás.",
    levels: [
      "1: Malo (Una persona de pocas e ineficaces palabras).",
      "2: Normal (A veces puedes salirte con la tuya, como todo el mundo).",
      "3: Bueno (Siempre consigues descuentos).",
      "4: Excepcional (Podrías ser político o líder de un culto).",
      "5: Sobresaliente (Dominas a voluntad a casi cualquiera).",
    ],
  },
  appearance: {
    desc: "Atractivo físico y presencia visual.",
    levels: [
      "1: Malo (Muy feo).",
      "2: Normal (Común).",
      "3: Bueno (Llamas la atención, los extraños te pagan bebidas en los bares).",
      "4: Excepcional (Eres lo suficientemente atractivo para ser modelo, la gente hace todo tipo de cosas por ti).",
      "5: Sobresaliente (Belleza sobrehumana, la gente se detiene a mirarte por la calle).",
    ],
  },
  perception: {
    desc: "Tu capacidad de observar y notar detalles del entorno.",
    levels: [
      "1: Malo (Ignorante del entorno, no detectas ni las cosas mas evidentes).",
      "2: Normal (Ves lo obvio, lo sutil se te escapa).",
      "3: Bueno (Percibes ambientes, texturas y cambios minúsculos en tu entorno).",
      "4: Excepcional (Nada escapa a tus sentidos).",
      "5: Sobresaliente (Observas inmediatamente cosas casi imperceptibles para los sentidos humanos).",
    ],
  },
  intelligence: {
    desc: "Capacidad de razonamiento, memoria y aprendizaje.",
    levels: [
      "1: Malo (Lento de entendederas).",
      "2: Normal (Coeficiente Intelectual normal).",
      "3: Bueno (Inteligente y ágil mentalmente).",
      "4: Excepcional (Eres brillante).",
      "5: Sobresaliente (Genio de clase mundial).",
    ],
  },
  wits: {
    desc: "Capacidad de reaccionar rápidamente ante situaciones imprevistas.",
    levels: [
      "1: Malo (Te quedas en blanco a menudo).",
      "2: Normal (Reaccionas con normalidad).",
      "3: Bueno (Rápido y astuto).",
      "4: Excepcional (Siempre tienes una respuesta o plan B).",
      "5: Sobresaliente (Reacción casi instintiva e impecable).",
    ],
  },
};

export const CLAN_DISCIPLINES: Record<Clan, string[]> = {
  Assamite: ["Celerity", "Obfuscate", "Quietus"],
  Brujah: ["Celerity", "Potence", "Presence"],
  "Followers of Set": ["Obfuscate", "Presence", "Serpentis"],
  Gangrel: ["Animalism", "Fortitude", "Protean"],
  Giovanni: ["Dominate", "Necromancy", "Potence"],
  Lasombra: ["Dominate", "Obtenebration", "Potence"],
  Malkavian: ["Auspex", "Dementation", "Obfuscate"],
  Nosferatu: ["Animalism", "Obfuscate", "Potence"],
  Ravnos: ["Animalism", "Chimerstry", "Fortitude"],
  Toreador: ["Auspex", "Celerity", "Presence"],
  Tremere: ["Auspex", "Dominate", "Thaumaturgy"],
  Tzimisce: ["Animalism", "Auspex", "Vicissitude"],
  Ventrue: ["Dominate", "Fortitude", "Presence"],
};

export const COMMON_BACKGROUNDS = [
  "Allies",
  "Contacts",
  "Fame",
  "Generation",
  "Herd",
  "Influence",
  "Mentor",
  "Resources",
  "Retainers",
  "Status",
];

export const MAX_TRAIT_RATING = 5; // Basic limit for generation >= 8

export function getMaxTraitRating(generation: number) {
  if (generation >= 8) return 5;
  if (generation === 7) return 6;
  if (generation === 6) return 7;
  if (generation === 5) return 8;
  if (generation === 4) return 9;
  return 10;
}

export function getMaxBloodPool(generation: number) {
  switch (generation) {
    case 13:
      return 10;
    case 12:
      return 11;
    case 11:
      return 12;
    case 10:
      return 13;
    case 9:
      return 14;
    case 8:
      return 15;
    case 7:
      return 20;
    case 6:
      return 30;
    case 5:
      return 40;
    case 4:
      return 50;
    default:
      return 10;
  }
}
