// src/views/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Invalid username or password.");
      }

      const data = await response.json();

      // Persist session data in localStorage
      localStorage.setItem("appMode", "admin");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("authUsername", data.username);
      localStorage.setItem("authRole", data.role);

      // Navigate to admin dashboard
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen items-center justify-center font-sans antialiased px-4">
      <div className="w-full max-w-md bg-slate-900 border border-indigo-950/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* ⬅️ Sleek Back Navigation Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-slate-400 hover:text-indigo-400 p-2 rounded-xl bg-slate-950/40 border border-indigo-950/30 hover:border-indigo-500/30 transition-all z-20 cursor-pointer group"
          title="Return to Catalog"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Decorative subtle backdrop glows */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>

        {/* Branding header area */}
        <div className="text-center mb-8 relative z-10 pt-2">
          <div className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white mb-2">
            <span className="text-indigo-500 font-extrabold">|||</span> Alexandria
          </div>
          <p className="text-xs text-slate-400">
            Access secure system gateway &amp; authentication terminal
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs mb-6 font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="w-full bg-slate-950 border border-indigo-900/40 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-950 border border-indigo-900/40 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
          >
            {loading ? "Authenticating..." : "Authenticate Profile"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 relative z-10">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("appMode", "client");
              navigate("/");
            }}
            className="hover:text-indigo-400 transition-colors underline cursor-pointer"
          >
            Return to Public Catalog View
          </button>
        </div>
      </div>
    </div>
  );
}