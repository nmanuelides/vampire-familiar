import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../store/useCharacterStore";
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
    <div className="character-list-container d-flex flex-col gap-xl w-full">
      {Object.entries(groupedCharacters).map(([chronicle, chars]) => (
        <div key={chronicle} className="chronicle-group w-full">
          <h2
            className="chronicle-title text-center"
            style={{ marginBottom: "1rem", color: "var(--accent)" }}
          >
            Crónica: {chronicle}
          </h2>
          <div className="character-grid">
            {chars.map((char) => (
              <div
                key={char.id}
                className="character-card"
                onClick={() => navigate(`/character/${char.id}`)}
              >
                <div className="character-info">
                  <h3 className="char-name">{char.name}</h3>
                  <span className="char-clan">
                    {char.clan} - {char.generation}ª Generación
                  </span>
                </div>
                <div className="char-stats">
                  <span>❤ Huma: {char.humanity}</span>
                  <span>
                    🩸 Sang: {char.blood_pool_current}/{char.blood_pool}
                  </span>
                  <span>
                    ⚡ Volun: {char.willpower_current}/{char.willpower}
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
