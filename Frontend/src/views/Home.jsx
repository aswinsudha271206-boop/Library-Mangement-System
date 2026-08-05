// src/views/Home.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Compass, ShieldAlert, Award, Star, ArrowRight, 
  UserPlus, CheckCircle, Database, Users, Bookmark, FileClock, 
  AlertTriangle, Phone, Hash, Calendar, Sparkles, SearchCheck, 
  CheckCircle2, Clock, DollarSign, User, ShieldCheck, Activity, EyeOff,
  CreditCard, Tag, GraduationCap
} from 'lucide-react';

export default function Home({ books = [], members = [], transactions = [], onIssueRequest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showPassModal, setShowPassModal] = useState(false);
  const [passRequested, setPassRequested] = useState(false);
  
  // Internal state to hold backend-fetched transactions if props are empty
  const [fetchedTransactions, setFetchedTransactions] = useState([]);

  // Auto-fetch transactions/holds safely with error suppression
  useEffect(() => {
    const fetchLiveHolds = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/holds');
        if (response.ok) {
          const data = await response.json();
          setFetchedTransactions(data);
        } else {
          setFetchedTransactions([]);
        }
      } catch (err) {
        // Silently catch network errors to keep console clean
      }
    };

    fetchLiveHolds();
  }, []);

  // Merge prop transactions with fetched transactions
  const activeTransactionsList = transactions.length > 0 ? transactions : fetchedTransactions;

  // Read initial visibility toggle state on mount
  const [showTransactionsOnHome, setShowTransactionsOnHome] = useState(() => {
    const saved = localStorage.getItem('showOperationsOnHome');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Synchronize visibility state instantly when toggled
  useEffect(() => {
    const syncVisibility = () => {
      const saved = localStorage.getItem('showOperationsOnHome');
      setShowTransactionsOnHome(saved !== null ? JSON.parse(saved) : true);
    };

    syncVisibility();

    window.addEventListener('storage', syncVisibility);
    window.addEventListener('visibilityToggle', syncVisibility);

    return () => {
      window.removeEventListener('storage', syncVisibility);
      window.removeEventListener('visibilityToggle', syncVisibility);
    };
  }, []);

  // 📋 Student profile form configuration schema
  const [passForm, setPassForm] = useState({ 
    name: '', 
    email: '', 
    rollNumber: '',
    phone: '',
    track: 'bachelor',
    academicYear: '1st Year'
  });

  // Unique profile verification state managers
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState({ text: '', type: '' });

  // Persistent tracking variable to check if the user has a digital pass activation
  const [hasDigitalPass, setHasDigitalPass] = useState(() => {
    return localStorage.getItem("hasDigitalPass") === "true";
  });

  // Local storage profile state framework caching
  const [studentData, setStudentData] = useState(() => {
    const saved = localStorage.getItem("studentPass");
    return saved ? JSON.parse(saved) : null;
  });

  // Hold System State Framework Variables
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [activeBookForHold, setActiveBookForHold] = useState(null);
  const [holdLoading, setHoldLoading] = useState(false);
  const [holdFeedback, setHoldFeedback] = useState('');
  const [holdAmount, setHoldAmount] = useState('2.00');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [holdDueDate, setHoldDueDate] = useState('');
  const [holdUserId, setHoldUserId] = useState('');

  // Once the live roster arrives, verify the cached Digital Pass still points
  // to a real, named member. If that id was deleted, or the backend record
  // has a blank name, keep reusing it silently, which is how you end up with
  // holds and modals stuck showing "Member ID #N" forever. Clear it instead
  // so the person is prompted to register a fresh, valid pass.
  useEffect(() => {
    if (!studentData || members.length === 0) return;
    const matched = members.find((m) => String(m.id) === String(studentData.id));
    if (!matched || !matched.name) {
      console.warn(
        `Digital Pass for member #${studentData.id} is no longer valid (record missing or has a blank name) — clearing it.`
      );
      localStorage.removeItem("hasDigitalPass");
      localStorage.removeItem("studentPass");
      setHasDigitalPass(false);
      setStudentData(null);
    }
  }, [members, studentData]);

  // New states for Enrollment Track and Transaction Type (Book Lending / Book Sales)
  const [enrollmentTrack, setEnrollmentTrack] = useState('bachelor');
  const [transactionType, setTransactionType] = useState('lending');

  // Auto-calculate real-time due date based on selected enrollment track option
  useEffect(() => {
    const today = new Date();
    let daysToAdd = 7;

    if (enrollmentTrack === 'bachelor') {
      daysToAdd = 7;
    } else if (enrollmentTrack === 'master') {
      daysToAdd = 15;
    } else if (enrollmentTrack === 'staff') {
      daysToAdd = 15;
    } else if (enrollmentTrack === 'phd_m_field') {
      daysToAdd = 30;
    }

    const dueDateObj = new Date(today.setDate(today.getDate() + daysToAdd));
    const formattedDate = dueDateObj.toISOString().split('T')[0];
    setHoldDueDate(formattedDate);
  }, [enrollmentTrack]);

  // Auto-update amount based on whether Book Lending or Book Sales is selected
  useEffect(() => {
    if (transactionType === 'lending') {
      setHoldAmount('2.00');
    } else if (transactionType === 'sales') {
      setHoldAmount('450.00');
    }
  }, [transactionType]);

  // 🔔 Animated Access Banner Control States & Re-mounting Key Counter
  const [showAccessAlert, setShowAccessAlert] = useState(false);
  const [alertKey, setAlertKey] = useState(0);

  useEffect(() => {
    if (showAccessAlert) {
      const timer = setTimeout(() => {
        setShowAccessAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showAccessAlert, alertKey]);

  const loggedInUserId = 1; 

  // Resolve a member's display name for a given id: prefer the live roster
  // fetched from the backend (always accurate), then the cached digital pass,
  // and only fall back to a generic label if neither has the record.
  const resolveMemberName = (id) => {
    if (!id) return null;
    const matched = members.find((m) => String(m.id) === String(id));
    if (matched?.name) return matched.name;
    if (studentData?.id && String(studentData.id) === String(id) && studentData?.name) {
      return studentData.name;
    }
    return null;
  };

  const genres = ['All', ...new Set(books.map(b => b.genre || 'General'))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (book.isbn || '').includes(searchTerm);
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleVerifyRollNumber = async () => {
    if (!passForm.rollNumber.trim()) {
      setLookupMessage({ text: '⚠️ Please enter a Roll / Student ID first.', type: 'error' });
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/students/verify/${passForm.rollNumber.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        let matchedTrack = 'bachelor';
        const rawTrack = (data.track || '').toLowerCase();
        if (rawTrack.includes('master') || rawTrack.includes('mca')) matchedTrack = 'master';
        else if (rawTrack.includes('staff')) matchedTrack = 'staff';
        else if (rawTrack.includes('phd') || rawTrack.includes('field')) matchedTrack = 'phd_m_field';
        else if (rawTrack.includes('bachelor') || rawTrack.includes('b.tech') || rawTrack.includes('bca')) matchedTrack = 'bachelor';

        setPassForm({
          name: data.name || '',
          email: data.email || '',
          rollNumber: data.roll_number || passForm.rollNumber,
          phone: data.phone || '',
          track: matchedTrack,
          academicYear: data.academic_year || '1st Year'
        });
        if (data.name && data.name.trim()) {
          setLookupMessage({ text: '✨ Profile verified successfully!', type: 'success' });
        } else {
          setLookupMessage({ text: '⚠️ Found this roll number, but it has no name on file — please type it in below.', type: 'error' });
        }
      } else {
        setLookupMessage({ text: '❌ ID not found in database.', type: 'error' });
      }
    } catch (err) {
      setLookupMessage({ text: '⚠️ Database unreachable.', type: 'error' });
    } finally {
      setLookupLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassRequested(true);
    const completedForm = { ...passForm };

    const finalizePass = (data) => {
      const profile = {
        ...completedForm,
        id: data?.id ?? null,
        name: (data?.name && data.name.trim()) ? data.name : completedForm.name,
        track: data?.track ?? completedForm.track
      };
      localStorage.setItem("hasDigitalPass", "true");
      localStorage.setItem("studentPass", JSON.stringify(profile));
      setStudentData(profile);
      setHasDigitalPass(true);

      setTimeout(() => {
        setShowPassModal(false);
        setPassRequested(false);
        setPassForm({ name: '', email: '', rollNumber: '', phone: '', track: 'bachelor', academicYear: '1st Year' });
        setLookupMessage({ text: '', type: '' });
      }, 2000);
    };

    try {
      const response = await fetch('http://localhost:8000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: passForm.name,
          email: passForm.email,
          roll_number: passForm.rollNumber,
          phone: passForm.phone,
          track: passForm.track,
          academic_year: passForm.academicYear
        })
      });

      if (response.ok) {
        const data = await response.json();
        finalizePass(data);
        return;
      }

      if (response.status === 400 && passForm.rollNumber.trim()) {
        const lookup = await fetch(`http://localhost:8000/api/students/verify/${passForm.rollNumber.trim()}`);
        if (lookup.ok) {
          const existing = await lookup.json();
          finalizePass(existing);
          return;
        }
      }

      throw new Error(`Failed to register student pass (status ${response.status})`);

    } catch (err) {
      console.warn("⚠️ Could not reach backend. Falling back to sandbox pass.", err);
      finalizePass(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hasDigitalPass");
    localStorage.removeItem("studentPass");
    setHasDigitalPass(false);
    setStudentData(null);
  };

  const handleConfirmHoldSubmit = async () => {
    if (!activeBookForHold) return;
    
    setHoldLoading(true);
    setHoldFeedback('');

    try {
      const response = await fetch('http://localhost:8000/api/holds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: activeBookForHold.id,
          user_id: parseInt(holdUserId) || loggedInUserId,
          amount: parseFloat(holdAmount) || 0.0,
          payment_method: paymentMethod,
          enrollment_track: enrollmentTrack,   
          transaction_type: transactionType,
          due_date: holdDueDate ? new Date(holdDueDate).toISOString() : null
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setHoldFeedback('🎉 Reservation placed successfully!');
        
        const newHold = {
          id: responseData.id || Date.now(),
          book_title: activeBookForHold.title,
          student_name: resolveMemberName(holdUserId) || responseData.student_name || 'Verified Member',
          user_id: holdUserId || loggedInUserId,
          amount: parseFloat(holdAmount),
          payment_method: paymentMethod,
          enrollment_track: enrollmentTrack,
          transaction_type: transactionType,
          status: 'Active Hold',
          created_at: new Date().toISOString(),
          due_date: holdDueDate
        };
        setFetchedTransactions(prev => [newHold, ...prev]);

        if (onIssueRequest) onIssueRequest(activeBookForHold);
        
        setTimeout(() => {
          setIsHoldModalOpen(false);
          setActiveBookForHold(null);
          setHoldDueDate('');
          setHoldUserId('');
        }, 1800);
      } else {
        setHoldFeedback(`❌ Hold Failed: ${responseData.detail || 'Server rejected request'}`);
      }
    } catch (error) {
      setHoldFeedback('⚠️ Backend offline. Reservation locked locally.');
      
      const newHold = {
        id: Date.now(),
        book_title: activeBookForHold.title,
        student_name: resolveMemberName(holdUserId) || 'Verified Member',
        user_id: holdUserId || 1,
        amount: parseFloat(holdAmount),
        payment_method: paymentMethod,
        enrollment_track: enrollmentTrack,
        transaction_type: transactionType,
        status: 'Active Hold',
        created_at: new Date().toISOString(),
        due_date: holdDueDate
      };
      setFetchedTransactions(prev => [newHold, ...prev]);

      if (onIssueRequest) onIssueRequest(activeBookForHold);
      
      setTimeout(() => {
        setIsHoldModalOpen(false);
        setActiveBookForHold(null);
        setHoldDueDate('');
        setHoldUserId('');
      }, 1800);
    } finally {
      setHoldLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500/30 relative overflow-x-hidden">
      
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes slideInAlert { 0% { top: -150px; opacity: 0; } 60% { top: 32px; opacity: 1; } 100% { top: 24px; opacity: 1; } }
        @keyframes shake { 0%, 100% { margin-left: 0; } 20%, 60% { margin-left: -6px; } 40%, 80% { margin-left: 6px; } }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-marquee { display: flex; width: max-content; animation: marquee 25s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .animate-alert-banner { animation: slideInAlert 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, shake 0.35s ease-in-out 0.4s 1; }
        .animate-modal-fade { animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {showAccessAlert && (
        <div key={alertKey} className="fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto animate-alert-banner" style={{ top: '-150px' }}>
          <div className="bg-slate-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 rounded-2xl p-4 flex gap-4 items-start backdrop-blur-md">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-100">Membership Token Required</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You must register and secure a digital student access pass profile before interacting with core reservation queues.
              </p>
              <button 
                onClick={() => { setShowAccessAlert(false); setShowPassModal(true); }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 mt-2 inline-flex items-center gap-1 transition-all"
              >
                Claim Free Digital Pass Now &rarr;
              </button>
            </div>
            <button onClick={() => setShowAccessAlert(false)} className="text-slate-500 hover:text-slate-300 text-sm font-bold px-1 transition-colors">&times;</button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-indigo-400" />
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Alexandria Public
            </span>
          </div>

          {hasDigitalPass ? (
            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800/80 pl-4 pr-2 py-1.5 rounded-2xl backdrop-blur-sm shadow-inner animate-modal-fade">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Pass Active
                </span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 max-w-[120px] truncate">
                  {studentData?.name || "Verified Student"}
                </span>
              </div>
              <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-2 rounded-xl text-xs border border-rose-500/20 transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-950/20">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowPassModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
              <UserPlus className="h-4 w-4" /> Get Digital Pass
            </button>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden pt-20 pb-12 border-b border-slate-900/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="h-3.5 w-3.5" /> Your Gateway to Modern Engineering Literature
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            The Digital Shelf for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Next-Gen Developers
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Browse our up-to-date physical catalog collections, check active borrow status indicators, and claim your reading reservation passes instantly.
          </p>

          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN code..."
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Catalog</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{books.length}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Database className="h-5 w-5" /></div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Members</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">1,248</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl"><Users className="h-5 w-5" /></div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">On Active Hold</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1 text-indigo-400">{activeTransactionsList.length || 85}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Bookmark className="h-5 w-5" /></div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Returned Today</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">12</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><CheckCircle className="h-5 w-5" /></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Explore Catalog</h2>
            <p className="text-sm text-slate-400 mt-1">Showing {filteredBooks.length} titles currently indexed</p>
          </div>

          <div className="w-full md:w-2/3 overflow-hidden relative border border-slate-900 bg-slate-950/40 rounded-2xl py-2 shadow-inner">
            <div className="animate-marquee gap-3">
              {genres.map((genre, idx) => (
                <button
                  key={`track1-${genre}-${idx}`}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    selectedGenre === genre 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-h-[560px] overflow-y-auto rounded-2xl p-2 bg-slate-900/10 border border-slate-900/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <div key={book.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-400 text-[10px] font-mono font-bold uppercase">
                        {book.genre || 'General'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        book.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${book.status === 'Available' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {book.status || 'Available'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">by {book.author}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                    <span>ISBN: <span className="font-mono text-slate-400">{book.isbn || 'N/A'}</span></span>
                    
                    {book.status === 'Available' ? (
                      <button 
                        onClick={() => {
                          if (!hasDigitalPass) {
                            setAlertKey(prev => prev + 1);
                            setShowAccessAlert(true);
                            return;
                          }
                          setActiveBookForHold(book);
                          setHoldAmount(book.reservation_fee ? book.reservation_fee.toFixed(2) : '2.00');
                          setHoldUserId(studentData?.id ? String(studentData.id) : '');
                          if (studentData?.track) {
                            setEnrollmentTrack(studentData.track);
                          }
                          setIsHoldModalOpen(true);
                          setHoldFeedback('');
                        }}
                        className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Hold <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-slate-600 font-semibold cursor-not-allowed select-none">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
              <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-400">No titles match your selection</h3>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shrink-0 h-fit text-indigo-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">14-Day Lending Windows</h4>
              <p className="text-sm text-slate-400 mt-1">Standard checkouts allow ample time to review documentation, stack architectures, and study guides.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shrink-0 h-fit text-cyan-400">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Alumni Resources</h4>
              <p className="text-sm text-slate-400 mt-1">Get persistent physical reservation locks directly through custom digital portal pass requests.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shrink-0 h-fit text-indigo-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Daily Catalog Updates</h4>
              <p className="text-sm text-slate-400 mt-1">New hardware handbooks, computing journals, and stack literature are indexed every morning.</p>
            </div>
          </div>
        </div>
      </section>

      {showTransactionsOnHome && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-400" />
                <h2 className="text-2xl font-extrabold text-slate-100">Active Circulation Spotlight</h2>
              </div>
              <p className="text-sm text-slate-400 mt-1">Real-time status cards of active circulation loans, tracks, and return deadlines</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Stream Active
            </span>
          </div>

          {activeTransactionsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTransactionsList.map((tx) => (
                <div 
                  key={tx.id || Math.random()} 
                  className="bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/5 group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        tx.status === 'Overdue'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {tx.status === 'Overdue' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />} {tx.status || 'Active Hold'}
                      </span>
                      <span className={`text-xs font-semibold bg-slate-950 px-2.5 py-1 rounded-lg border ${
                        tx.status === 'Overdue' ? 'text-rose-400 border-rose-900/60' : 'text-amber-400 border-slate-800'
                      }`}>
                        {typeof tx.amount === 'number' ? `₹${tx.amount.toFixed(2)}` : (tx.fine || '₹2.00')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {tx.book_title || tx.bookTitle || 'Clean Code'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mt-1">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>Issued to: <strong className="text-slate-200">{resolveMemberName(tx.user_id) || tx.student_name || tx.memberName || studentData?.name || 'Verified Member'}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-semibold text-slate-300 border border-slate-800">
                        <GraduationCap className="h-3 w-3 text-cyan-400" />
                        {tx.enrollment_track ? tx.enrollment_track.toUpperCase() : 'MCA / MASTER'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-semibold text-slate-300 border border-slate-800">
                        <Tag className="h-3 w-3 text-indigo-400" />
                        {tx.transaction_type === 'sales' ? 'Book Sale' : 'Book Lending'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-semibold text-slate-300 border border-slate-800">
                        <CreditCard className="h-3 w-3 text-emerald-400" />
                        {tx.payment_method || 'UPI'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-850">
                      <p className="text-slate-500 font-medium uppercase text-[9px] tracking-wider">Issued On</p>
                      <p className="text-slate-300 font-mono mt-0.5">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : (tx.issueDate || '7/21/2026')}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-850">
                      <p className="text-slate-500 font-medium uppercase text-[9px] tracking-wider">Return Due</p>
                      <p className="text-indigo-400 font-mono mt-0.5 font-bold">
                        {tx.due_date ? new Date(tx.due_date).toLocaleDateString() : (tx.dueDate || '8/05/2026')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">No active circulation transactions recorded in database.</p>
            </div>
          )}
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900">
        <div className="w-full overflow-hidden relative border border-amber-500/30 bg-amber-500/10 rounded-2xl py-2.5 mb-8 shadow-inner">
          <div className="animate-marquee gap-10 text-xs font-semibold text-amber-200">
            <span className="flex items-center gap-2 shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Notice: After the return deadline ends, a fine of ₹25 will be added for each day overdue. Please ensure timely returns!</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Notice: After the return deadline ends, a fine of ₹25 will be added for each day overdue. Please ensure timely returns!</span>
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900">
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileClock className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recent Catalog Operations</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-xs">
              <p className="text-slate-300"><span className="font-semibold text-indigo-400">{studentData?.name || 'Reo'}</span> reserved allocation for <span className="italic text-slate-200">'Clean Code'</span></p>
              <span className="text-slate-500 font-mono">25 mins ago</span>
            </div>
          </div>
        </div>
      </section>

      {isHoldModalOpen && activeBookForHold && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-modal-fade max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100">Request Book Reservation</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">Confirm adding this volume to your dynamic catalog hold profile tracking.</p>

            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl mb-4">
              <p className="text-sm font-bold text-indigo-400">{activeBookForHold.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">by {activeBookForHold.author}</p>
              <p className="text-[10px] font-mono text-slate-600 mt-2">ISBN: {activeBookForHold.isbn}</p>
            </div>

            <div className="space-y-4 mb-5 text-left">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Member Name / ID (from your Digital Pass)</label>
                <input
                  type="text"
                  placeholder="Verify a Digital Pass to auto-fill this"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-slate-300 select-none cursor-not-allowed text-sm font-mono"
                  value={resolveMemberName(holdUserId) ? `${resolveMemberName(holdUserId)} (ID: ${holdUserId})` : (holdUserId ? `Member ID #${holdUserId}` : 'No Member Linked')}
                  readOnly
                  required
                />
                <p className="text-[10px] text-emerald-400 mt-1">
                  ✓ Automatically linked to your verified pass record ({resolveMemberName(holdUserId) || `Member ID #${holdUserId || 'N/A'}`}).
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Enrollment Track (Locked to Member Profile)</label>
                <input
                  type="text"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-slate-300 select-none cursor-not-allowed text-sm font-mono uppercase"
                  value={enrollmentTrack}
                  readOnly
                  disabled
                />
                <p className="text-[10px] text-indigo-400 mt-1">
                  ℹ️ Role and track configuration are pre-provisioned via the Manage Members registry profile.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Return Deadline</label>
                <input
                  type="date"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-slate-400 select-none cursor-not-allowed text-sm font-mono"
                  value={holdDueDate}
                  readOnly
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('lending')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      transactionType === 'lending'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Book Lending
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('sales')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      transactionType === 'sales'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Book Sales
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Amount ({transactionType === 'sales' ? 'Purchase Price ₹' : 'Reservation Fee ₹'})</label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-slate-400 select-none cursor-not-allowed text-sm font-mono"
                  value={holdAmount}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1 tracking-wider">Payment Method</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI (Google Pay, PhonePe)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>
            </div>

            {holdFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
                holdFeedback.includes('🎉') || holdFeedback.includes('⚠️')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {holdFeedback}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                disabled={holdLoading}
                onClick={() => {
                  setIsHoldModalOpen(false);
                  setActiveBookForHold(null);
                  setHoldDueDate('');
                  setHoldUserId('');
                }} 
                className="flex-1 border border-slate-800 text-slate-400 hover:bg-slate-800/40 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={holdLoading}
                onClick={handleConfirmHoldSubmit}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
              >
                {holdLoading ? 'Processing...' : 'Confirm Hold'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto animate-modal-fade">
            
            {passRequested ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Pass Registered Successfully!</h3>
                <p className="text-sm text-slate-400">Your profile credentials have loaded. You can now use the catalog reservation engine blocks.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-100">Get Digital Library Pass</h2>
                <p className="text-xs text-slate-400 mt-1 mb-4">Submit university credentials to authorize local access profiles.</p>
                
                <form onSubmit={handlePassSubmit} className="space-y-4">
                  <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-2">
                    <label className="block text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Member Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Revaldo Ambrose" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 text-sm font-medium" 
                        value={passForm.name} 
                        onChange={e => setPassForm({...passForm, name: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-2">
                    <label className="block text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input
                        required
                        type="email"
                        placeholder="e.g. revaldo@university.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 text-sm font-medium"
                        value={passForm.email}
                        onChange={e => setPassForm({...passForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-2">
                    <label className="block text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">University Roll / Student ID</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input 
                          required 
                          type="text" 
                          placeholder="e.g. MCA26042 or MCA26001" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 text-sm font-mono tracking-wide" 
                          value={passForm.rollNumber} 
                          onChange={e => setPassForm({...passForm, rollNumber: e.target.value})} 
                        />
                      </div>
                      <button
                        type="button"
                        disabled={lookupLoading}
                        onClick={handleVerifyRollNumber}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {lookupLoading ? 'Checking...' : <><SearchCheck className="h-3.5 w-3.5" /> Verify Profile</>}
                      </button>
                    </div>
                    
                    {lookupMessage.text && (
                      <p className={`text-[11px] font-medium leading-normal pt-1 ${
                        lookupMessage.type === 'success' ? 'text-emerald-400' : 
                        lookupMessage.type === 'error' ? 'text-rose-400' : 'text-indigo-400'
                      }`}>
                        {lookupMessage.text}
                      </p>
                    )}
                  </div>         
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => { setShowPassModal(false); setLookupMessage({ text: '', type: '' }); }} className="flex-1 border border-slate-800 text-slate-400 hover:bg-slate-800/40 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-lg shadow-indigo-600/15">Request Card</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Alexandria Library Consortium. Built for production-grade engineering catalogs.</p>
      </footer>
    </div>
  );
}