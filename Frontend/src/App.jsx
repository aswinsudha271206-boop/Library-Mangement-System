// src/App.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Books from "./views/Books";
import Members from "./views/Members";
import Transactions from "./views/Transactions";
import Home from "./views/Home"; // <-- Import Client Page
import Analytics from "./views/Analytics"; // <-- Externalized Analytics View Component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // <-- 1. Import Routes and Route
import Login from "./views/Login"
// Target endpoint environment configuration mapping
const API_BASE_URL = "http://localhost:8080/api/books";

// Unified Initial Mock Datasets
const INITIAL_BOOKS = [
  {
    id: 1,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    genre: "Tech",
    status: "Available",
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    genre: "Tech",
    status: "Borrowed",
  },
  {
    id: 3,
    title: "Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "978-0135957059",
    genre: "Tech",
    status: "Available",
  },
  {
    id: 4,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262046305",
    genre: "Mathematics",
    status: "Available",
  },
  {
    id: 5,
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    isbn: "978-0134757599",
    genre: "Tech",
    status: "Available",
  },
  {
    id: 6,
    title: "Understanding Distributed Systems",
    author: "Roberto Vitillo",
    isbn: "978-1800566415",
    genre: "Tech",
    status: "Available",
  },
  { 
    id: 7, 
    title: "System Design Interview – An Insider's Guide", 
    author: "Alex Xu", 
    isbn: "978-1736049112", 
    genre: "System Design", 
    status: "Available" 
  },
  { 
    id: 8, 
    title: "Cloud Native Patterns", 
    author: "Cornelia Davis", 
    isbn: "978-1617294297", 
    genre: "Cloud Architecture", 
    status: "Available" 
  },
  { 
    id: 9, 
    title: "Head First Design Patterns", 
    author: "Eric Freeman", 
    isbn: "978-1492078005", 
    genre: "Tech", 
    status: "Borrowed" 
  },
  { 
    id: 10, 
    title: "The Phoenix Project", 
    author: "Gene Kim", 
    isbn: "978-0988262591", 
    genre: "DevOps", 
    status: "Available" 
  },
  { 
    id: 11, 
    title: "Site Reliability Engineering", 
    author: "Betsy Beyer", 
    isbn: "978-1491929124", 
    genre: "DevOps", 
    status: "Available" 
  },
  { 
    id: 12, 
    title: "Clean Architecture", 
    author: "Robert C. Martin", 
    isbn: "978-0134494166", 
    genre: "Tech", 
    status: "Available" 
  },
  { 
    id: 13, 
    title: "SQL Performance Explained", 
    author: "Markus Winand", 
    isbn: "978-3950307825", 
    genre: "Database Systems", 
    status: "Available" 
  },
  { 
    id: 14, 
    title: "Continuous Delivery", 
    author: "Jez Humble", 
    isbn: "978-0321601919", 
    genre: "DevOps", 
    status: "Borrowed" 
  },
  { 
    id: 15, 
    title: "Working Effectively with Legacy Code", 
    author: "Michael Feathers", 
    isbn: "978-0131177055", 
    genre: "Tech", 
    status: "Available" 
  },
  { 
    id: 16, 
    title: "Building Microservices", 
    author: "Sam Newman", 
    isbn: "978-1492034025", 
    genre: "Cloud Architecture", 
    status: "Available" 
  },
  { 
    id: 17, 
    title: "You Don't Know JS Yet: Get Started", 
    author: "Kyle Simpson", 
    isbn: "978-1662234567", 
    genre: "Frontend Engineering", 
    status: "Available" 
  },
  { 
    id: 18, 
    title: "Eloquent JavaScript", 
    author: "Marijn Haverbeke", 
    isbn: "978-1593279509", 
    genre: "Frontend Engineering", 
    status: "Available" 
  },
  { 
    id: 19, 
    title: "Grokking Algorithms", 
    author: "Aditya Bhargava", 
    isbn: "978-1617292231", 
    genre: "Mathematics", 
    status: "Available" 
  },
  { 
    id: 20, 
    title: "The Clean Coder", 
    author: "Robert C. Martin", 
    isbn: "978-0137081073", 
    genre: "Tech", 
    status: "Borrowed" 
  },
  { 
    id: 21, 
    title: "Soft Skills: The software developer's life manual", 
    author: "John Sonmez", 
    isbn: "978-1617292392", 
    genre: "Professional Development", 
    status: "Available" 
  },
  { 
    id: 22, 
    title: "Cracking the Coding Interview", 
    author: "Gayle Laakmann McDowell", 
    isbn: "978-0984782857", 
    genre: "System Design", 
    status: "Available" 
  },
  { 
    id: 23, 
    title: "Compilers: Principles, Techniques, and Tools", 
    author: "Alfred Aho", 
    isbn: "978-0321486813", 
    genre: "Mathematics", 
    status: "Available" 
  },
  { 
    id: 24, 
    title: "Database System Concepts", 
    author: "Abraham Silberschatz", 
    isbn: "978-0078022159", 
    genre: "Database Systems", 
    status: "Available" 
  },
  { 
    id: 25, 
    title: "Kubernetes up and running", 
    author: "Brendan Burns", 
    isbn: "978-1492243519", 
    genre: "Cloud Architecture", 
    status: "Available" 
  },
  { 
    id: 26, 
    title: "The Pragmatic Programmer", 
    author: "David Thomas", 
    isbn: "978-0135957059", 
    genre: "Tech", 
    status: "Available" 
  },
  { 
    id: 27, 
    title: "Effective Java", 
    author: "Joshua Bloch", 
    isbn: "978-0134685991", 
    genre: "Tech", 
    status: "Available" 
  },
  { 
    id: 28, 
    title: "Introduction to the Theory of Computation", 
    author: "Michael Sipser", 
    isbn: "978-1133187790", 
    genre: "Mathematics", 
    status: "Borrowed" 
  },
  { 
    id: 29, 
    title: "Real-World Cryptography", 
    author: "David Wong", 
    isbn: "978-1617296710", 
    genre: "Cybersecurity", 
    status: "Available" 
  },
  { 
    id: 30, 
    title: "Web Scalability for Startup Engineers", 
    author: "Artur Ejsmont", 
    isbn: "978-0071843652", 
    genre: "System Design", 
    status: "Available" 
  }
];

const INITIAL_MEMBERS = [
  {
    id: 101,
    name: "Reo",
    email: "reo@academy.edu",
    course: "MCA",
    status: "Active",
  },
  {
    id: 102,
    name: "Sarah Jenkins",
    email: "sarah.j@academy.edu",
    course: "BTech",
    status: "Active",
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 201,
    bookTitle: "Clean Code",
    memberName: "Reo",
    issueDate: "05/10/2026",
    dueDate: "05/24/2026",
    status: "Issued",
  },
  {
    id: 202,
    bookTitle: "Designing Data-Intensive Applications",
    memberName: "Sarah Jenkins",
    issueDate: "04/01/2026",
    dueDate: "04/15/2026",
    status: "Overdue",
  },
];

export default function App() {
  const navigate = useNavigate();

  // Navigation mode switcher: 'client' or 'admin'
  const [appMode, setAppMode] = useState("client");
  const [view, setView] = useState("dashboard");

  // Application Data States
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Operational Network Loading/Error Handlers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 📡 Hook to activate live backend database synchronizations
  useEffect(() => {
    // Un-comment this call when your server API endpoints are online:
    // fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch library catalog");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Book Management Core Operations
  const handleAddBook = async (newBookData) => {
    const localNewBook = { ...newBookData, id: Date.now() };
    setBooks([localNewBook, ...books]);
  };

  const handleDeleteBook = async (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  // 👥 Member Management Operations
  const handleAddMember = (newMember) => {
    setMembers([newMember, ...members]);
  };

  // 🔄 Circulation / Transaction Operations
  const handleIssueBook = (newTx) => {
    setTransactions([newTx, ...transactions]);
    setBooks(
      books.map((b) =>
        b.title === newTx.bookTitle ? { ...b, status: "Borrowed" } : b,
      ),
    );
  };

  // 🛡️ Handles hold request from client side catalog view
  const handleClientIssueRequest = (bookToHold) => {
    const simulatedTx = {
      id: Date.now(),
      bookTitle: bookToHold.title,
      memberName: "Online Visitor",
      issueDate: new Date().toLocaleDateString(),
      dueDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(), // 14 days later
      status: "Issued",
    };
    handleIssueBook(simulatedTx);
  };

  return (
    <div className="relative">
      {/* 🚀 Quick Admin / Client Mode Toggle Banner (Top Level Utility) */}
      <div className="bg-indigo-950/60 border-b border-indigo-900/60 text-indigo-300 py-2 px-4 text-xs font-semibold flex justify-between items-center z-50">
        <span>
          Currently experiencing the{" "}
          <strong>{appMode.toUpperCase()} VIEW</strong> interface.
        </span>
        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          Go to Login
        </button>
      </div>

      {/* 🌐 Client Mode Interface View */}
      {appMode === "client" && (
        <Home books={books} onIssueRequest={handleClientIssueRequest} />
      )}

      {/* ⚙️ Admin Mode Interface View */}
      {appMode === "admin" && (
        <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans antialiased w-full">
          {/* Structural Sidebar Navigation */}
          <Sidebar currentView={view} setView={setView} />

          {/* Workspace App Layout View Render Engine */}
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {loading && (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
                <strong>Network Sync Error:</strong> {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {view === "dashboard" && (
                  <Dashboard booksCount={books.length} />
                )}

                {view === "books" && (
                  <Books
                    books={books}
                    onAddBook={handleAddBook}
                    onDeleteBook={handleDeleteBook}
                  />
                )}

                {view === "members" && (
                  <Members members={members} onAddMember={handleAddMember} />
                )}

                {/* 🔄 Issue Registry View mapped to 'issueRegistry' view state key */}
                {view === "issueRegistry" && (
                  <Transactions
                    transactions={transactions}
                    books={books}
                    members={members}
                    onIssueBook={handleIssueBook}
                  />
                )}

                {/* 📊 Analytics View mapped to 'analytics' view state key */}
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

return (
    <Router>
      <Routes>
        {/* Dedicated standalone auth page route layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Fallback route mounting core student system catalog views */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}