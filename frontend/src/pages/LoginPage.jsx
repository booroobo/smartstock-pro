import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const demoAccounts = [
  ["Admin", "admin@smartstock.com"],
  ["Manajer Gudang", "manager@smartstock.com"],
  ["Staf Gudang", "staff@smartstock.com"],
  ["Viewer", "viewer@smartstock.com"],
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("admin@smartstock.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SmartStock Pro</h1>
        <p>Masuk menggunakan akun internal perusahaan.</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="Masukkan email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              placeholder="Masukkan password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>

        <div className="demo-accounts">
          <strong>Akun Demo</strong>
          {demoAccounts.map(([role, accountEmail]) => (
            <button
              key={accountEmail}
              type="button"
              onClick={() => {
                setEmail(accountEmail);
                setPassword("password123");
              }}
            >
              <span>{role}</span>
              <code>{accountEmail}</code>
            </button>
          ))}
          <small>Password semua akun: <code>password123</code></small>
        </div>
      </div>
    </div>
  );
}
