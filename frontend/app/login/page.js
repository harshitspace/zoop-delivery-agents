"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const TEST_USER = "admin";
const TEST_PASS = "admin123";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fillTestCreds = () => {
    setUsername(TEST_USER);
    setPassword(TEST_PASS);
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <form className="form-grid" onSubmit={submit}>
          {error && <div className="alert error">{error}</div>}
          <div>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="test-creds">
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowCreds((s) => !s)}
          >
            {showCreds ? "Hide test credentials" : "Use test credentials"}
          </button>
          {showCreds && (
            <div className="creds-box">
              <p>Username: <code>{TEST_USER}</code></p>
              <p>Password: <code>{TEST_PASS}</code></p>
              <button type="button" className="btn" onClick={fillTestCreds}>
                Autofill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
