import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fireConfetti } from "../hooks/useConfetti.js";

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      await login(loginForm.email, loginForm.password);
      setLoginForm({ email: "", password: "" });
      onClose();
      fireConfetti();
    } catch (err) {
      setLoginError(err.message || "Login failed.");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterError("");
    try {
      await register(registerForm.name, registerForm.email, registerForm.password);
      setRegisterForm({ name: "", email: "", password: "" });
      onClose();
      fireConfetti();
    } catch (err) {
      setRegisterError(err.message || "Registration failed.");
    }
  }

  return (
    <div className={`modal ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="modal-tabs">
          <button type="button" className={`modal-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Log in</button>
          <button type="button" className={`modal-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Sign up</button>
        </div>

        {tab === "login" && (
          <form className="form" onSubmit={handleLogin}>
            <label><span>Email</span>
              <input type="email" required placeholder="you@email.com"
                value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
            </label>
            <label><span>Password</span>
              <input type="password" required placeholder="••••••••"
                value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
            </label>
            <button className="btn big" type="submit">Log in</button>
            <p className="form-result" role="status" aria-live="polite">{loginError}</p>
          </form>
        )}

        {tab === "register" && (
          <form className="form" onSubmit={handleRegister}>
            <label><span>Your name</span>
              <input type="text" required placeholder="Alex Rossi"
                value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
            </label>
            <label><span>Email</span>
              <input type="email" required placeholder="you@email.com"
                value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
            </label>
            <label><span>Password</span>
              <input type="password" required minLength={6} placeholder="At least 6 characters"
                value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
            </label>
            <button className="btn big" type="submit">Create account</button>
            <p className="form-result" role="status" aria-live="polite">{registerError}</p>
          </form>
        )}
      </div>
    </div>
  );
}
