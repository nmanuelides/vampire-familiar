import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import CreateVampireCard from "../components/CreateVampireCard";
import CharacterList from "../components/CharacterList";
import AvatarUploadModal from "../components/AvatarUploadModal";
import "./Home.scss";

export default function Home() {
  const { user, signOut } = useAuthStore();
  const { fetchCharacters, loading } = useCharacterStore();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCharacters(user.id);
    }
  }, [user, fetchCharacters]);

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Vampiro";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="title">Vampire Familiar</h1>

        <div className="header-actions">
          <div className="user-profile">
            <div
              className="avatar-circle"
              onClick={() => setShowAvatarModal(true)}
              title="Cambiar Avatar"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <span className="player-name">{userName}</span>
              <button className="logout-btn" onClick={signOut}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAvatarModal && (
        <AvatarUploadModal onClose={() => setShowAvatarModal(false)} />
      )}

      <main className="home-main">
        <CreateVampireCard />

        <div className="characters-section">
          <h2>Tus Vampiros Creados</h2>
          {loading ? (
            <p className="loading-text">Cargando la progiene...</p>
          ) : (
            <CharacterList />
          )}
        </div>
      </main>
    </div>
  );
}
