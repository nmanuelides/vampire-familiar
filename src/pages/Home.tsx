import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import CreateVampireCard from "../components/CreateVampireCard";
import CharacterList from "../components/CharacterList";
import "./Home.scss";

export default function Home() {
  const { user, signOut } = useAuthStore();
  const { fetchCharacters, loading } = useCharacterStore();

  useEffect(() => {
    if (user) {
      fetchCharacters(user.id);
    }
  }, [user, fetchCharacters]);

  return (
    <div className="home-container container flex-col items-center">
      <header className="home-header d-flex justify-between items-center w-full">
        <h1 className="title">Vampire Familiar</h1>
        <button className="logout-btn" onClick={signOut}>
          Cerrar Sesión
        </button>
      </header>

      <main className="home-main w-full d-flex flex-col gap-xl">
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
