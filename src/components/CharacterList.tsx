import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../store/useCharacterStore";
import { useAuthStore } from "../store/useAuthStore";
import { VTM_TRANSLATIONS } from "../data/vtm";
import "./CharacterList.scss";

export default function CharacterList() {
  const { characters } = useCharacterStore();
  const { user } = useAuthStore();
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
                className={`character-card ${char.user_id !== user?.id ? "is-shared" : ""}`}
                onClick={() => navigate(`/character/${char.id}`)}
              >
                <div className="card-main">
                  <div className="character-info">
                    <div className="card-header">
                      <h3 className="char-name">{char.name}</h3>
                      <img
                        src={
                          new URL(
                            `../assets/clans/${char.clan}.png`,
                            import.meta.url,
                          ).href
                        }
                        alt={`${char.clan} logo`}
                        className="clan-icon"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.dataset.triedFallback) {
                            target.style.display = "none";
                            return;
                          }
                          if (char.clan === "Tzimisce") {
                            target.dataset.triedFallback = "true";
                            target.src = new URL(
                              "../assets/clans/Tzimice.png",
                              import.meta.url,
                            ).href;
                          } else {
                            target.style.display = "none";
                          }
                        }}
                      />
                    </div>

                    <div className="char-details">
                      {char.user_id !== user?.id && char.creator_name && (
                        <div
                          className="creator-badge"
                          title={`Creado por ${char.creator_name}`}
                        >
                          {char.creator_avatar_url ? (
                            <img
                              src={char.creator_avatar_url}
                              alt={char.creator_name}
                              className="creator-avatar"
                            />
                          ) : (
                            <div className="creator-avatar-placeholder">
                              {char.creator_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="creator-name">
                            {char.creator_name}
                          </span>
                        </div>
                      )}
                      <span className="char-clan">
                        {VTM_TRANSLATIONS[char.clan] || char.clan} -{" "}
                        {char.generation}ª Generación
                      </span>
                    </div>
                  </div>
                </div>
                <div className="char-stats-footer">
                  <div className="stat-group">
                    <span className="stat-icon">🩸</span>
                    <span className="stat-label">Sangre:</span>
                    <span className="stat-value">
                      {char.blood_pool_current}/{char.blood_pool}
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-icon">✚</span>
                    <span className="stat-label">Salud:</span>
                    <span className="stat-value">
                      {(() => {
                        const healthLevels = [
                          "incapacitated",
                          "crippled",
                          "mauled",
                          "wounded",
                          "injured",
                          "hurt",
                          "bruised",
                        ];
                        const current = healthLevels.find(
                          (l) => char.health[l as keyof typeof char.health],
                        );
                        return current
                          ? VTM_TRANSLATIONS[current]
                          : "Saludable";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
