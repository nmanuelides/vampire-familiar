import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabase";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Optionally show "Check your email" or auto login depending on Supabase settings.
        alert(
          "Registro exitoso. Si tu cuenta requiere confirmación, revisa tu correo electrónico.",
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex items-center justify-center flex-col">
      <h1 className="title text-center">Vampire Familiar</h1>
      <div className="card login-card">
        <h2 className="text-center">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="d-flex flex-col gap-md">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vampire@masquerade.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Entrar" : "Crear Cuenta"}
          </button>
        </form>

        <p className="toggle-text text-center">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </span>
        </p>
      </div>
    </div>
  );
}
