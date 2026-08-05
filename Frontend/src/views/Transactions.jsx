// src/views/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, X, Trash2, Pencil, Eye, EyeOff, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function Transactions({ transactions = [], books = [], members = [], onIssueBook, onToggleHomeVisibility }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ bookId: '', memberId: '', dueDate: '', processingFee: '0', status: 'Active' });
  const [loading, setLoading] = useState(false);
  
  // Functional Show/Hide on Home state persisted via localStorage key 'showOperationsOnHome'
  const [showOnHome, setShowOnHome] = useState(() => {
    const saved = localStorage.getItem('showOperationsOnHome');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleHome = () => {
    const nextState = !showOnHome;
    setShowOnHome(nextState);
    
    // 1. Save state to localStorage using key 'showOperationsOnHome'
    localStorage.setItem('showOperationsOnHome', JSON.stringify(nextState));

    // 2. 🚀 Dispatch custom event so Home.jsx updates instantly in the same app window!
    window.dispatchEvent(new Event('visibilityToggle'));

    if (onToggleHomeVisibility) {
      onToggleHomeVisibility(nextState);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ bookId: '', memberId: '', dueDate: '', processingFee: '0', status: 'Active' });
    setShowModal(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingId(tx.id);
    setFormData({
      bookId: tx.book_id || tx.bookId || '',
      memberId: tx.user_id || tx.memberId || '',
      dueDate: tx.due_date ? tx.due_date.split('T')[0] : '',
      processingFee: tx.amount !== undefined ? String(tx.amount) : '0',
      status: tx.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      book_id: Number(formData.bookId),
      user_id: Number(formData.memberId),
      amount: Number(formData.processingFee),
      payment_method: "Cash",
      due_date: formData.dueDate,
      status: formData.status
    };

    try {
      const url = editingId 
        ? `http://localhost:8000/api/holds/${editingId}`
        : "http://localhost:8000/api/holds";
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (onIssueBook) await onIssueBook(); 
        setShowModal(false);
        setEditingId(null);
        setFormData({ bookId: '', memberId: '', dueDate: '', processingFee: '0', status: 'Active' });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to process transaction");
      }
    } catch (err) {
      console.error("Error submitting hold:", err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/revoke this transaction record?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/holds/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        if (onIssueBook) await onIssueBook();
        else window.location.reload();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting hold:", error);
      alert("Network error. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Issue Registry</h1>
          <p className="text-slate-400 mt-1">Track active circulation loans, fees, and critical deadlines.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Functional Show / Unshow Toggle Button */}
          <button 
            onClick={handleToggleHome}
            className={`flex items-center gap-2 font-medium px-4 py-3 rounded-xl cursor-pointer transition-all border ${
              showOnHome 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle visibility of this registry data on the Home/Dashboard page"
          >
            {showOnHome ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showOnHome ? "Visible on Home" : "Hidden on Home"}
          </button>

          <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="h-5 w-5" /> Issue Book
          </button>
        </div>
      </div>

      {/* Issue Registry Table with Edit & Delete */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Book Title</th>
                <th className="p-4">Issued To</th>
                <th className="p-4">Allocation Date</th>
                <th className="p-4">Return Deadline</th>
                <th className="p-4">Fines/Fees</th>
                <th className="p-4">Tracking State</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100">{tx.book_title || tx.bookTitle}</td>
                  <td className="p-4 text-indigo-400 font-medium">{tx.student_name || tx.memberName}</td>
                  <td className="p-4 text-slate-400">
                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    }) : (tx.issueDate || '-')}
                  </td>
                  <td className="p-4 text-slate-400">
                    {tx.due_date ? new Date(tx.due_date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    }) : (tx.dueDate || '-')}
                  </td>
                  <td className="p-4 text-amber-400">
                    {typeof tx.amount === 'number' ? `₹${tx.amount.toFixed(2)}` : (tx.fine || '₹0.00')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Overdue'
                        ? 'bg-rose-500/10 text-rose-400'
                        : tx.status === 'Returned'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {tx.status === 'Overdue' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />} {tx.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(tx)}
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors cursor-pointer inline-block"
                      title="Edit Transaction"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer inline-block"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create / Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative my-8 shadow-2xl">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-xl font-bold text-slate-100 mb-4">
                {editingId ? "Edit Book Allocation" : "New Book Allocation"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Book</label>
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 cursor-pointer" value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})}>
                    <option value="">-- Choose Book --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Member</label>
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 cursor-pointer" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                    <option value="">-- Choose Member --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Return Deadline</label>
                  <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 cursor-pointer" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Processing Fee / Fine (₹)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="0.00" value={formData.processingFee} onChange={e => setFormData({...formData, processingFee: e.target.value})} />
                </div>

                {editingId && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tracking Status</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-700/50 py-3 rounded-xl font-medium transition-all cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50">
                    {loading ? "Saving..." : (editingId ? "Update Allocation" : "Authorize Issue")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}