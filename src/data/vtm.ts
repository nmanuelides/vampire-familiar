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
  Haven: "Refugio",

  // Virtues
  conscience: "Conciencia / Convicción",
  selfControl: "Autocontrol / Instintos",
  courage: "Coraje",

  // Health
  bruised: "Magullado",
  hurt: "Lastimado (-1)",
  injured: "Lesionado (-1)",
  wounded: "Herido (-2)",
  mauled: "Malherido (-2)",
  crippled: "Tullido (-5)",
  incapacitated: "Incapacitado",

  // Clans
  Assamite: "Assamita",
  Brujah: "Brujah",
  "Followers of Set": "Seguidores de Set",
  Gangrel: "Gangrel",
  Giovanni: "Giovanni",
  Lasombra: "Lasombra",
  Malkavian: "Malkavian",
  Nosferatu: "Nosferatu",
  Ravnos: "Ravnos",
  Toreador: "Toreador",
  Tremere: "Tremere",
  Tzimisce: "Tzimisce",
  Ventrue: "Ventrue",
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
  // Virtudes
  conscience: 1,
  selfControl: 2,
  courage: 3,
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

  // Abilities - Talents
  alertness: {
    desc: "Tus sentidos básicos y percepción general del entorno.",
    levels: [
      "1: Novato.",
      "2: Practicante.",
      "3: Competente.",
      "4: Experto.",
      "5: Maestro.",
    ],
  },
  athletics: {
    desc: "Capacidad atlética general, correr, saltar, nadar.",
    levels: [
      "1: Activo.",
      "2: Deportista.",
      "3: Atleta profesional.",
      "4: Nivel Olímpico.",
      "5: Récord mundial.",
    ],
  },
  brawl: {
    desc: "Pelea sin armas, forcejeos y artes marciales.",
    levels: [
      "1: Sabes dar un golpe.",
      "2: Matón.",
      "3: Luchador experimentado.",
      "4: Peleador experto.",
      "5: Campeón mundial.",
    ],
  },
  dodge: {
    desc: "Tu capacidad para esquivar ataques o peligros.",
    levels: [
      "1: Sabes agacharte.",
      "2: Rápido.",
      "3: Ágil.",
      "4: Difícil de tocar.",
      "5: Intocable.",
    ],
  },
  empathy: {
    desc: "Comprender y relacionarte con los sentimientos de otros.",
    levels: [
      "1: Entiendes emociones.",
      "2: Hombro para llorar.",
      "3: Psicólogo.",
      "4: Empatía profunda.",
      "5: Lector de almas.",
    ],
  },
  expression: {
    desc: "Habilidad para expresar pensamientos de forma convincente.",
    levels: [
      "1: Locuaz.",
      "2: Buen orador.",
      "3: Escritor competente.",
      "4: Autor de éxito.",
      "5: Visionario.",
    ],
  },
  intimidation: {
    desc: "Infundir miedo mediante amenazas o tu mera presencia.",
    levels: [
      "1: Amenazante.",
      "2: Matón.",
      "3: Sargento instructor.",
      "4: Da miedo verte.",
      "5: Aterrador.",
    ],
  },
  leadership: {
    desc: "Capacidad para dirigir e inspirar a grupos de personas.",
    levels: [
      "1: Capitán de equipo.",
      "2: Delegado.",
      "3: Directivo.",
      "4: Gobernador.",
      "5: Dictador/Mesías.",
    ],
  },
  streetwise: {
    desc: "Conocer los bajos fondos y cómo desenvolverse en ellos.",
    levels: [
      "1: Sabes dónde comprar.",
      "2: Tienes contactos.",
      "3: Miembro de banda.",
      "4: Jefe criminal.",
      "5: Rey de los bajos fondos.",
    ],
  },
  subterfuge: {
    desc: "Ocultar tus verdaderos motivos, mentir y manipular.",
    levels: [
      "1: Mientes sin sonrojarte.",
      "2: Mentiroso habitual.",
      "3: Seductor.",
      "4: Espía.",
      "5: Engañas a los inmortales.",
    ],
  },

  // Abilities - Skills
  animalKen: {
    desc: "Trato y domesticación de animales.",
    levels: [
      "1: Te gustan.",
      "2: Paseador.",
      "3: Adiestrador.",
      "4: Encantador de bestias.",
      "5: Dominas a lo salvaje.",
    ],
  },
  crafts: {
    desc: "Habilidad param crear o reparar obras de artesanía o mecánica.",
    levels: [
      "1: Chapuzas.",
      "2: Arreglas averías.",
      "3: Mecánico/Artista.",
      "4: Profesional reconocido.",
      "5: Maestro artesano.",
    ],
  },
  drive: {
    desc: "Manejo de vehículos terrestres en situaciones extremas.",
    levels: [
      "1: Sabes conducir.",
      "2: Conductor hábil.",
      "3: Taxista.",
      "4: Piloto de carreras.",
      "5: Haces trucos imposibles.",
    ],
  },
  etiquette: {
    desc: "Conocimiento de las normas sociales y diplomacia vampírica.",
    levels: [
      "1: Sabes qué cubierto usar.",
      "2: Diplomático.",
      "3: Miembro de la alta sociedad.",
      "4: Político consumado.",
      "5: Árbitro de la Corte.",
    ],
  },
  firearms: {
    desc: "Uso, mantenimiento y reparación de armas de fuego.",
    levels: [
      "1: Has disparado.",
      "2: Cazador.",
      "3: Policía.",
      "4: Francotirador.",
      "5: Maestro asesino.",
    ],
  },
  melee: {
    desc: "Combate con armas cuerpo a cuerpo (espadas, cuchillos).",
    levels: [
      "1: Sabes apuñalar.",
      "2: Pandillero.",
      "3: Esgrimista.",
      "4: Guerrero letal.",
      "5: Semidiós de la espada.",
    ],
  },
  performance: {
    desc: "Habilidades artísticas de actuación, música o baile.",
    levels: [
      "1: Canto de ducha.",
      "2: Actor aficionado.",
      "3: Profesional de club.",
      "4: Músico famoso.",
      "5: Ídolo de masas.",
    ],
  },
  security: {
    desc: "Forzar cerraduras, desactivar alarmas y eludir seguridad.",
    levels: [
      "1: Quitar el pestillo.",
      "2: Ladrón de coches.",
      "3: Lanza cajas fuertes.",
      "4: Experto en sistemas.",
      "5: Irrompible.",
    ],
  },
  stealth: {
    desc: "Moverse en silencio y evitar ser detectado.",
    levels: [
      "1: Caminas en silencio.",
      "2: Te escondes bien.",
      "3: Sombra.",
      "4: Ninja.",
      "5: Invisible.",
    ],
  },
  survival: {
    desc: "Sobrevivir en entornos hostiles, rastrear y cazar.",
    levels: [
      "1: Boy Scout.",
      "2: Acampador.",
      "3: Rastreador.",
      "4: Superviviente nato.",
      "5: Rey de la selva.",
    ],
  },

  // Abilities - Knowledges
  academics: {
    desc: "Conocimiento general en humanidades (historia, literatura).",
    levels: [
      "1: Bachillerato.",
      "2: Universitario.",
      "3: Licenciado.",
      "4: Doctorado.",
      "5: Eminencia mundial.",
    ],
  },
  computer: {
    desc: "Programación, hackeo y sistemas informáticos.",
    levels: [
      "1: Usuario.",
      "2: Informático.",
      "3: Programador jefe.",
      "4: Hacker de élite.",
      "5: Creas IA.",
    ],
  },
  finance: {
    desc: "Manejo de dinero, inversiones y contabilidad.",
    levels: [
      "1: Llevas las cuentas.",
      "2: Inversor local.",
      "3: Corredor de bolsa.",
      "4: Magnate.",
      "5: Mueves economías nacionales.",
    ],
  },
  investigation: {
    desc: "Búsqueda de pistas, análisis forense y resolución.",
    levels: [
      "1: Observador.",
      "2: Detective aficionado.",
      "3: Policía forense.",
      "4: Agente federal.",
      "5: Sherlock Holmes.",
    ],
  },
  law: {
    desc: "Leyes mortales, procedimientos judiciales y burocracia.",
    levels: [
      "1: Estudiante de leyes.",
      "2: Pasante.",
      "3: Abogado.",
      "4: Fiscal o Juez.",
      "5: Redactas la Constitución.",
    ],
  },
  linguistics: {
    desc: "Comprensión de múltiples idiomas y lingüística.",
    levels: [
      "1: Un idioma extra.",
      "2: Dos idiomas.",
      "3: Cuatro idiomas.",
      "4: Ocho idiomas.",
      "5: Dieciséis idiomas u oscuros.",
    ],
  },
  medicine: {
    desc: "Conocimientos de anatomía y primeros auxilios.",
    levels: [
      "1: Primeros auxilios.",
      "2: Paramédico.",
      "3: Médico general.",
      "4: Cirujano especialista.",
      "5: Milagros médicos.",
    ],
  },
  occult: {
    desc: "Conocimiento sobre rituales, ocultismo y criaturas mágicas.",
    levels: [
      "1: Lector esotérico.",
      "2: Teórico.",
      "3: Investigador nato.",
      "4: Adepto del misticismo.",
      "5: Maestro de lo invisible.",
    ],
  },
  politics: {
    desc: "Conocimiento del tejemaneje del poder político.",
    levels: [
      "1: Activista.",
      "2: Sindicalista.",
      "3: Político regional.",
      "4: Senador.",
      "5: Presidente.",
    ],
  },
  science: {
    desc: "Química, física, biología y matemáticas.",
    levels: [
      "1: Sabes fórmulas.",
      "2: Universitario.",
      "3: Científico investigador.",
      "4: Premio destacado.",
      "5: Premio Nobel.",
    ],
  },

  // Virtues
  conscience: {
    desc: "Discernir lo correcto de lo incorrecto y sentir remordimiento.",
    levels: [
      "1: Inhumano.",
      "2: Normal.",
      "3: Moral.",
      "4: Ético.",
      "5: Intachable.",
    ],
  },
  selfControl: {
    desc: "Resistir la Bestia, el Frenesí y tus oscuros instintos.",
    levels: [
      "1: Inestable.",
      "2: Normal.",
      "3: Disciplinado.",
      "4: Férreo.",
      "5: Imperturbable.",
    ],
  },
  courage: {
    desc: "Entereza frente al miedo, fuego, luz del sol y el Rötschreck.",
    levels: [
      "1: Cobarde.",
      "2: Normal.",
      "3: Valiente.",
      "4: Intrépido.",
      "5: Heroico.",
    ],
  },

  // Core Stats
  humanity: {
    desc: "Tu vínculo con la moralidad mortal y distancia de la Bestia.",
    levels: [
      "1-3: Monstruo.",
      "4-6: Vampiro típico.",
      "7: Mortal normal.",
      "8-9: Humano ejemplar.",
      "10: Mártir / Santo.",
    ],
  },
  willpower: {
    desc: "Tu fuerza mental para superar obstáculos y forzar éxitos.",
    levels: [
      "1-3: Débil.",
      "4-5: Normal.",
      "6-7: Fuerte.",
      "8-9: Voluntad de Hierro.",
      "10: Inquebrantable.",
    ],
  },

  // Backgrounds
  Allies: {
    desc: "Confederados humanos, normalmente familiares o amigos.",
    levels: [],
  },
  Contacts: {
    desc: "Personas de quienes sacar información y favores.",
    levels: [],
  },
  Fame: {
    desc: "Lo conocido que es el personaje entre la sociedad de los mortales.",
    levels: [],
  },
  Generation: {
    desc: "Lo alejado que está el personaje de Caín.",
    levels: [],
  },
  Herd: {
    desc: "Mortales dispuestos a darte de beber de forma segura.",
    levels: [],
  },
  Influence: {
    desc: "El poder político del personaje en la sociedad mortal.",
    levels: [],
  },
  Mentor: {
    desc: "El patrón vampírico que aconseja y apoya al personaje.",
    levels: [],
  },
  Resources: {
    desc: "Riqueza y posesiones mensuales del personaje.",
    levels: [],
  },
  Retainers: {
    desc: "Seguidores, guardias y sirvientes.",
    levels: [],
  },
  Status: {
    desc: "La condición del personaje en la sociedad vampírica.",
    levels: [],
  },
  Haven: {
    desc: "Un lugar donde esconderse, con acceso franco y seguro.",
    levels: [],
  },

  // Disciplines
  Animalism: {
    desc: "Comunicación y control sobre Bestias y la Bestia interior.",
    levels: [
      "1: Susurros Salvajes.",
      "2: La Llamada.",
      "3: Apaciguar a la Bestia.",
      "4: Comunión de Espíritus.",
      "5: Extraer a la Bestia.",
    ],
  },
  Auspex: {
    desc: "Sentidos sobrenaturales, lectura de auras y telepatía.",
    levels: [
      "1: Sentidos Agudizados.",
      "2: Percepción del Aura.",
      "3: El Toque del Espíritu.",
      "4: Telepatía.",
      "5: Proyección Astral.",
    ],
  },
  Celerity: {
    desc: "Velocidad sobrenatural y acciones adicionales por turno.",
    levels: ["Otorga 1 acción adicional por punto gastando 1 Punto de Sangre."],
  },
  Chimerstry: {
    desc: "Creación de ilusiones y engaños sensoriales casi reales.",
    levels: [
      "1: Fuego Fatuo.",
      "2: Fata Morgana.",
      "3: Aparición.",
      "4: Permanencia.",
      "5: Horrenda Realidad.",
    ],
  },
  Dementation: {
    desc: "Infundir locura y demencia en las mentes ajenas.",
    levels: [
      "1: Íncubo de Pasión.",
      "2: Inquietar el Alma.",
      "3: Ojos del Caos.",
      "4: Voz de la Locura.",
      "5: Demencia Total.",
    ],
  },
  Dominate: {
    desc: "Control mental directo, lavado de cerebro y borrar memoria.",
    levels: [
      "1: El Comando.",
      "2: Hipnotismo.",
      "3: La Mente Olvidadiza.",
      "4: Condicionamiento.",
      "5: Posesión.",
    ],
  },
  Fortitude: {
    desc: "Resistencia mística al daño extremo, el fuego y el sol.",
    levels: [
      "Añade 1 dado por punto para absorber daño (incluyendo letal y agravado).",
    ],
  },
  Necromancy: {
    desc: "El dominio esotérico de los muertos y espectros.",
    levels: [
      "1: Visión del Sepulcro.",
      "2: Ojos del Muerto.",
      "3: El Toque del Aura.",
      "4: Llamar al Espíritu.",
      "5: Tormento.",
    ],
  },
  Obfuscate: {
    desc: "Magia mental para esconderse, ser ignorado o cambiar de aspecto.",
    levels: [
      "1: La Capa de las Sombras.",
      "2: Presencia Invisible.",
      "3: Máscara de las Mil Caras.",
      "4: Desvanecimiento.",
      "5: Cubrir a la Multitud.",
    ],
  },
  Obtenebration: {
    desc: "Manipulación de las sombras, oscuridad y el Abismo.",
    levels: [
      "1: Juego de Sombras.",
      "2: Mortaja de la Noche.",
      "3: Brazos del Abismo.",
      "4: Metamorfosis Oscura.",
      "5: Forma Tenebrosa.",
    ],
  },
  Potence: {
    desc: "Fuerza sobrenatural masiva para dominar físicamente.",
    levels: ["Añade 1 éxito automático en tiradas de Fuerza por nivel."],
  },
  Presence: {
    desc: "Manipulación emocional intensa, devoción o terror reverencial.",
    levels: [
      "1: Fascinación.",
      "2: La Mirada Aterradora.",
      "3: Entuerto.",
      "4: Invocación.",
      "5: Majestad.",
    ],
  },
  Protean: {
    desc: "Cambio de forma fluído, garras letales y fundirse con la tierra.",
    levels: [
      "1: Ojos de la Bestia.",
      "2: Garras de la Bestia.",
      "3: Fusión con la Tierra.",
      "4: La Forma de la Bestia.",
      "5: Forma de Niebla.",
    ],
  },
  Quietus: {
    desc: "Magia de sangre asesina de los Assamitas, envenenar Vitae.",
    levels: [
      "1: Silencio de Muerte.",
      "2: Debilidad.",
      "3: Enfermedad.",
      "4: Veneno de Sangre.",
      "5: Gusto a Sangre.",
    ],
  },
  Serpentis: {
    desc: "Corrupción corporal serpentina de los Seguidores de Set.",
    levels: [
      "1: Ojos de la Serpiente.",
      "2: La Lengua de la Serpiente.",
      "3: Piel de la Serpiente.",
      "4: Forma de la Serpiente.",
      "5: El Corazón de la Serpiente.",
    ],
  },
  Thaumaturgy: {
    desc: "Magia de sangre muy versátil de los Tremere. Magia pura.",
    levels: [
      "Senda de la Sangre:",
      "1: Sabor de la Sangre.",
      "2: Furia de la Sangre.",
      "3: Sangre de Potencia.",
      "4: Robo de Vitae.",
      "5: Caldero de Sangre.",
    ],
  },
  Vicissitude: {
    desc: "Moldeo antinatural de hueso y carne, como arcilla roja.",
    levels: [
      "1: Semblante Maleable.",
      "2: Moldear Carne.",
      "3: Moldear Hueso.",
      "4: Forma Horrenda.",
      "5: Despertar la Forma Zulo.",
    ],
  },

  // Health
  bruised: {
    desc: "Rasguños ligeros. Sin penalización a ninguna acción.",
    levels: [],
  },
  hurt: {
    desc: "Dolor leve. Pierdes 1 dado de tu reserva máxima.",
    levels: [],
  },
  injured: { desc: "Heridas moderadas. Pierdes 1 dado.", levels: [] },
  wounded: { desc: "Heridas graves y dolorosas. Pierdes 2 dados.", levels: [] },
  mauled: {
    desc: "Huesos rotos, músculos desgarrados. Pierdes 2 dados.",
    levels: [],
  },
  crippled: {
    desc: "Al borde de caer. Pierdes 5 dados, apenas te arrastras.",
    levels: [],
  },
  incapacitated: {
    desc: "Inconsciente e inminente letargo. Ninguna acción posible.",
    levels: [],
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
  "Haven",
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
