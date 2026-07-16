// src/views/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Simple validation rule matching your mock user profile data
    if (email === "reo@academy.edu" && password === "password123") {
      // Set application view session state to admin before shifting routing target
      localStorage.setItem("appMode", "admin");
      // Navigate back to the main workspace (Admin dashboard view)
      navigate("/");
    } else {
      setError("Invalid credential details. Please check your username or password.");
    }
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen items-center justify-center font-sans antialiased px-4">
      <div className="w-full max-w-md bg-slate-900 border border-indigo-950/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative subtle backdrop glows */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>

        {/* Branding header area */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white mb-2">
            <span className="text-indigo-500 font-extrabold">|||</span> Alexandria
          </div>
          <p className="text-xs text-slate-400">
            Access secure system gateway & authentication terminal
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reo@academy.edu"
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
          >
            Authenticate Profile
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