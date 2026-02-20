import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../store/useCharacterStore";
import { VTM_TRANSLATIONS } from "../data/vtm";
import "./CharacterList.scss";

export default function CharacterList() {
  const { characters } = useCharacterStore();
  const navigate = useNavigate();

  if (characters.length === 0) {
    return (
      <p className="no-characters">
        Aún no hay ningún vampiro en tu progenie. Crea uno arriba.
      </p>
    );
  }

  const groupedCharacters = characters.reduce(
    (acc, char) => {
      const chronicle = char.chronicle || "Desconocida";
      if (!acc[chronicle]) {
        acc[chronicle] = [];
      }
      acc[chronicle].push(char);
      return acc;
    },
    {} as Record<string, typeof characters>,
  );

  return (
    <div className="character-list-wrapper">
      {Object.entries(groupedCharacters).map(([chronicle, chars]) => (
        <div key={chronicle} className="chronicle-group w-full">
          <h2 className="chronicle-title">Crónica: {chronicle}</h2>
          <div className="character-grid">
            {chars.map((char) => (
              <div
                key={char.id}
                className="character-card"
                onClick={() => navigate(`/character/${char.id}`)}
              >
                <div className="character-info">
                  <div className="card-header">
                    <h3 className="char-name">{char.name}</h3>
                    <img
                      src={`/src/assets/clans/${char.clan}.png`}
                      alt={`${char.clan} logo`}
                      className="clan-icon"
                      onError={(e) => {
                        // Fallback check for Tzimisce/Tzimice or missing files
                        const target = e.target as HTMLImageElement;
                        if (
                          char.clan === "Tzimisce" &&
                          !target.src.includes("Tzimice.png")
                        ) {
                          target.src = "/src/assets/clans/Tzimice.png";
                        } else {
                          target.style.display = "none";
                        }
                      }}
                    />
                  </div>
                  <span className="char-clan">
                    {VTM_TRANSLATIONS[char.clan] || char.clan} -{" "}
                    {char.generation}ª Generación
                  </span>
                </div>
                <div className="char-stats">
                  <span>❤ Humanidad: {char.humanity}</span>
                  <span>
                    🩸 Sangre: {char.blood_pool_current}/{char.blood_pool}
                  </span>
                  <span>
                    ⚡ Voluntad: {char.willpower_current}/{char.willpower}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
