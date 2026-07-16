// src/views/Transactions.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, AlertCircle, CheckCircle2, DollarSign, X } from 'lucide-react';

export default function Transactions({ transactions = [], books = [], members = [], onIssueBook }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ bookId: '', memberId: '', dueDate: '', processingFee: '0' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedBook = books.find(b => b.id === Number(formData.bookId));
    const selectedMember = members.find(m => m.id === Number(formData.memberId));
    
    if (!selectedBook || !selectedMember) return;

    onIssueBook({
      id: Date.now(),
      bookTitle: selectedBook.title,
      memberName: selectedMember.name,
      issueDate: new Date().toLocaleDateString(),
      dueDate: new Date(formData.dueDate).toLocaleDateString(),
      status: 'Issued',
      fine: Number(formData.processingFee) > 0 ? `$${Number(formData.processingFee).toFixed(2)}` : '$0.00'
    });
    
    setFormData({ bookId: '', memberId: '', dueDate: '', processingFee: '0' });
    setShowModal(false);
  };

  // Orchestration animations system configuration layouts
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* View Header section */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Issue Registry</h1>
          <p className="text-slate-400 mt-1">Track active circulation loans, fees, and critical deadlines.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Issue Book
        </motion.button>
      </motion.div>

      {/* Main Transactions Log Ledger Data Window */}
      <motion.div 
        variants={itemVariants} 
        className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="w-full overflow-x-auto">
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
            <motion.tbody layout className="divide-y divide-slate-800/60 text-sm text-slate-300">
              <AnimatePresence mode="popLayout">
                {transactions.map(tx => (
                  <motion.tr 
                    layout
                    key={tx.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">{tx.bookTitle}</td>
                    <td className="p-4 text-indigo-400 font-medium">{tx.memberName}</td>
                    <td className="p-4 text-slate-400">{tx.issueDate}</td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" /> {tx.dueDate}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-mono font-medium ${tx.fine && tx.fine !== '$0.00' ? 'text-amber-400' : 'text-slate-500'}`}>
                        {tx.fine || '$0.00'}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'Overdue' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tx.status === 'Overdue' ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {tx.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Pop-up Transaction Creation Modal Context */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-750 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-xl font-bold text-slate-100 mb-4">New Book Allocation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Book</label>
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})}>
                    <option value="">-- Choose Book --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Student Member</label>
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                    <option value="">-- Choose Member --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Due Return Date</label>
                    <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Processing Fee ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <input type="number" min="0" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-8 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.processingFee} onChange={e => setFormData({...formData, processingFee: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-700/50 py-3 rounded-xl font-medium transition-all cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all cursor-pointer">Authorize Issue</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}