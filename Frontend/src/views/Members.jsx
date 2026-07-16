// src/views/Members.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, UserCheck, UserX, X } from 'lucide-react';

export default function Members({ members, onAddMember }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', course: 'MCA', status: 'Active' });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMember({ ...formData, id: Date.now() });
    setFormData({ name: '', email: '', course: 'MCA', status: 'Active' });
    setShowModal(false);
  };

  // Orchestration systems layout
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
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Library Members</h1>
          <p className="text-slate-400 mt-1">Authorize and audit student access accounts.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Add Member
        </motion.button>
      </motion.div>

      {/* Search Input field area */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email address..."
          className="w-full bg-slate-800/40 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Main Members Data Grid/Table Wrapper */}
      <motion.div 
        variants={itemVariants} 
        className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Member Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Course Track</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <motion.tbody layout className="divide-y divide-slate-800/60 text-sm text-slate-300">
              <AnimatePresence mode="popLayout">
                {filteredMembers.map(member => (
                  <motion.tr 
                    layout
                    key={member.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">{member.name}</td>
                    <td className="p-4 text-slate-400">{member.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wide border border-slate-700/40">
                        {member.course}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {member.status === 'Active' ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        {member.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Overlay Injection Node */}
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

              <h2 className="text-xl font-bold text-slate-100 mb-4">Register New Student</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <input required type="email" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Course Program</label>
                    <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition-colors" placeholder="e.g. MCA" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status Account</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-700/50 py-3 rounded-xl font-medium transition-all cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all cursor-pointer">Register</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}