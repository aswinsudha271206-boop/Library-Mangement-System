// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Books from "./views/Books";
import Members from "./views/Members";
import Transactions from "./views/Transactions";
import Home from "./views/Home";
import Analytics from "./views/Analytics";


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

  // Mirrors `members` without being a useCallback dependency, so fetchHolds
  // can read the latest roster while keeping a stable identity (see below).
  const membersRef = useRef([]);
  useEffect(() => { membersRef.current = members; }, [members]);

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
      const mapped = data.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        course: s.track || s.academic_year || "-",
        status: "Active",
        roll_number: s.roll_number,
        phone: s.phone,
      }));
      setMembers(mapped);
      return mapped;
    } catch (err) {
      console.error("fetchStudents:", err);
      return [];
    }
  }, []);

  // Accepts an optional freshly-fetched students list so it never relies on
  // a stale roster. Otherwise reads membersRef (NOT the `members` state
  // directly) — using `members` here would recreate this callback every time
  // the roster updates, which would retrigger the load effect below and
  // cause an infinite fetch loop.
  const fetchHolds = useCallback(async (studentsList) => {
    try {
      const res = await apiFetch("/api/holds");
      if (!res.ok) throw new Error(`Holds fetch failed: ${res.status}`);
      const data = await res.json();
      const roster = studentsList || membersRef.current;
      setTransactions(
        data.map((h) => {
          const matchedStudent = roster.find((m) => String(m.id) === String(h.user_id));
          return {
            id: h.id,
            bookTitle: h.book_title || `Book #${h.book_id}`,
            memberName: matchedStudent?.name || h.student_name || `Student #${h.user_id}`,
            issueDate: h.created_at ? new Date(h.created_at).toLocaleDateString() : "-",
            dueDate: h.due_date ? new Date(h.due_date).toLocaleDateString() : "-",
            returnDate: h.returned_at ? new Date(h.returned_at).toLocaleDateString() : null,
            status: h.status === "Active" ? "Issued" : h.status,
            fine: h.amount && h.amount > 0 ? `₹${Number(h.amount).toFixed(2)}` : "₹0.00",
          };
        })
      );
    } catch (err) {
      console.error("fetchHolds:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [studentsList] = await Promise.all([fetchStudents(), fetchBooks()]);
      await fetchHolds(studentsList);
      setLoading(false);
    };
    load();
  }, [fetchBooks, fetchStudents, fetchHolds]);

  const handleAddMember = useCallback(async () => {
    const studentsList = await fetchStudents();
    await fetchHolds(studentsList);
  }, [fetchStudents, fetchHolds]);

  // 📚 Book CRUD handlers — Books.jsx expects onAddBook/onUpdateBook/onDeleteBook,
  // but App.jsx previously never passed them (only `onRefresh`, which Books.jsx
  // doesn't even read). That left BookCard's delete/edit buttons calling
  // `undefined(...)`, crashing with "onDelete is not a function".
  const handleAddBook = useCallback(async (bookData) => {
    // Strip the client-only placeholder `id` (Date.now()) — the backend assigns the real one.
    const { id, ...payload } = bookData;
    try {
      const res = await apiFetch("/api/books", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          reservation_fee: parseFloat(payload.reservation_fee) || 2.0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Add book failed: ${res.status}`);
      }
      await fetchBooks();
    } catch (err) {
      console.error("handleAddBook:", err);
      setError(err.message || "Could not add book.");
    }
  }, [fetchBooks]);

  const handleUpdateBook = useCallback(async (bookId, bookData) => {
    try {
      const res = await apiFetch(`/api/books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...bookData,
          reservation_fee: parseFloat(bookData.reservation_fee) || 2.0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Update book failed: ${res.status}`);
      }
      await fetchBooks();
    } catch (err) {
      console.error("handleUpdateBook:", err);
      setError(err.message || "Could not update book.");
    }
  }, [fetchBooks]);

  const handleDeleteBook = useCallback(async (bookId) => {
    try {
      const res = await apiFetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Delete book failed: ${res.status}`);
      }
      await fetchBooks();
    } catch (err) {
      console.error("handleDeleteBook:", err);
      setError(err.message || "Could not delete book.");
    }
  }, [fetchBooks]);

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

      {appMode === "client" && (
        <Home
          books={books}
          members={members}
          transactions={transactions}
          onIssueRequest={handleIssueBook}
        />
      )}

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
                    books={books}
                    members={members}
                    transactions={transactions}
                  />
                )}
                {view === "books" && (
                  <Books
                    books={books}
                    onAddBook={handleAddBook}
                    onUpdateBook={handleUpdateBook}
                    onDeleteBook={handleDeleteBook}
                  />
                )}
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
