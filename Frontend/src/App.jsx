// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Books from "./views/Books";
import Members from "./views/Members";
import Transactions from "./views/Transactions";
import Home from "./views/Home";
import Analytics from "./views/Analytics";
import AddStudent from "./views/AddStudent";

const API_BASE = "http://localhost:8000";

// Helper: make an authenticated API request with the stored JWT token
const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

export default function App() {
  const navigate = useNavigate();

  const [appMode, setAppMode] = useState(() => localStorage.getItem("appMode") || "client");
  const [view, setView] = useState("dashboard");

  // All data sourced from backend
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await apiFetch("/api/books");
      if (!res.ok) throw new Error(`Books fetch failed: ${res.status}`);
      setBooks(await res.json());
    } catch (err) {
      console.error("fetchBooks:", err);
      setError("Could not load books from backend.");
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await apiFetch("/api/students");
      if (!res.ok) throw new Error(`Students fetch failed: ${res.status}`);
      const data = await res.json();
      setMembers(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          course: s.track || s.academic_year || "-",
          status: "Active",
          roll_number: s.roll_number,
          phone: s.phone,
        }))
      );
    } catch (err) {
      console.error("fetchStudents:", err);
    }
  }, []);

  const fetchHolds = useCallback(async () => {
    try {
      const res = await apiFetch("/api/holds");
      if (!res.ok) throw new Error(`Holds fetch failed: ${res.status}`);
      const data = await res.json();
      setTransactions(
        data.map((h) => ({
          id: h.id,
          bookTitle: h.book_title || `Book #${h.book_id}`,
          memberName: h.student_name || `Student #${h.user_id}`,
          issueDate: h.created_at ? new Date(h.created_at).toLocaleDateString() : "-",
          dueDate: h.due_date ? new Date(h.due_date).toLocaleDateString() : "-",
          returnDate: h.returned_at ? new Date(h.returned_at).toLocaleDateString() : null,
          status: h.status === "Active" ? "Issued" : h.status,
          fine: h.amount && h.amount > 0 ? `$${Number(h.amount).toFixed(2)}` : "$0.00",
        }))
      );
    } catch (err) {
      console.error("fetchHolds:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchBooks(), fetchStudents(), fetchHolds()]);
      setLoading(false);
    };
    load();
  }, [fetchBooks, fetchStudents, fetchHolds]);

  const handleAddMember = useCallback(async () => {
    await fetchStudents();
  }, [fetchStudents]);

  const handleIssueBook = useCallback(async () => {
    await Promise.all([fetchHolds(), fetchBooks()]);
  }, [fetchHolds, fetchBooks]);

  const handleLogout = () => {
    localStorage.removeItem("appMode");
    localStorage.removeItem("token");
    localStorage.removeItem("authUsername");
    localStorage.removeItem("authRole");
    setAppMode("client");
    navigate("/");
  };

  return (
    <div className="relative">
      {appMode === "client" && (
        <div className="bg-indigo-950/60 border-b border-indigo-900/60 text-indigo-300 py-2 px-4 text-xs font-semibold flex justify-between items-center z-50">
          <span>Currently in <strong>{appMode.toUpperCase()} VIEW</strong></span>
          <button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md transition-all">Go to Login</button>
        </div>
      )}

      {appMode === "client" && <Home books={books} />}

      {appMode === "admin" && (
        <div className="flex bg-slate-950 text-slate-100 min-h-screen">
          <Sidebar currentView={view} setView={setView} onLogout={handleLogout} />
          <main className="flex-1 p-8">
            {error && <div className="text-amber-400 text-xs mb-6">{error}</div>}
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <span className="text-sm animate-pulse">Loading data from backend...</span>
              </div>
            ) : (
              <>
                {view === "dashboard" && (
                  <Dashboard
                    booksCount={books.length}
                    members={members}
                    transactions={transactions}
                  />
                )}
                {view === "books" && <Books books={books} onRefresh={fetchBooks} />}
                {view === "members" && (
                  <Members
                    members={members}
                    onAddMember={handleAddMember}
                    setView={setView}
                  />
                )}
                {view === "issueRegistry" && (
                  <Transactions
                    transactions={transactions}
                    books={books}
                    members={members}
                    onIssueBook={handleIssueBook}
                  />
                )}
                {view === "addStudent" && <AddStudent setView={setView} onAddMember={handleAddMember} />}
                {view === "analytics" && (
                  <Analytics
                    booksCount={books.length}
                    membersCount={members.length}
                    transactionsCount={transactions.length}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}