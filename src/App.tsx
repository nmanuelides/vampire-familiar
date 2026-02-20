import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CharacterSheet from "./pages/CharacterSheet";
import "./styles/global.scss"; // Ensure global styles are loaded

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div
        className="d-flex justify-center items-center"
        style={{ height: "100vh" }}
      >
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/character/:id"
          element={
            <ProtectedRoute>
              <CharacterSheet />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
