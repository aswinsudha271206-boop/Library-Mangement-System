// src/views/Transactions.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, AlertCircle, CheckCircle2, DollarSign, X } from 'lucide-react';

export default function Transactions({ transactions = [], books = [], members = [], onIssueBook }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ bookId: '', memberId: '', dueDate: '', processingFee: '0' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Prepare data structure for the backend API
    const newHold = {
      book_id: Number(formData.bookId),
      user_id: Number(formData.memberId),
      amount: Number(formData.processingFee),
      payment_method: "Cash", // Defaulting to Cash
      due_date: formData.dueDate
    };

    try {
      // 2. Post to your actual backend API
      const response = await fetch("http://localhost:8000/api/holds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newHold)
      });

      if (response.ok) {
        // 3. Trigger refresh in App.jsx
        await onIssueBook(); 
        setFormData({ bookId: '', memberId: '', dueDate: '', processingFee: '0' });
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to issue book");
      }
    } catch (err) {
      console.error("Error submitting hold:", err);
      alert("Network error. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Issue Registry</h1>
          <p className="text-slate-400 mt-1">Track active circulation loans, fees, and critical deadlines.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer">
          <Plus className="h-5 w-5" /> Issue Book
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6">Book Title</th>
              <th className="p-4">Issued To</th>
              <th className="p-4">Allocation Date</th>
              <th className="p-4">Return Deadline</th>
              <th className="p-4">Fines/Fees</th>
              <th className="p-4 pr-6">Tracking State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 pl-6 font-semibold text-slate-100">{tx.bookTitle}</td>
                <td className="p-4 text-indigo-400 font-medium">{tx.memberName}</td>
                <td className="p-4 text-slate-400">{tx.issueDate}</td>
                <td className="p-4 text-slate-400">{tx.dueDate}</td>
                <td className="p-4 text-amber-400">{tx.fine}</td>
                <td className="p-4 pr-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">New Book Allocation</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})}>
                  <option value="">-- Choose Book --</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                  <option value="">-- Choose Member --</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="Fee" value={formData.processingFee} onChange={e => setFormData({...formData, processingFee: e.target.value})} />
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl font-medium">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium">Authorize Issue</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}