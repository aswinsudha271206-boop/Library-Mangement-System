// src/views/Members.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, UserCheck, UserX, X, UserPlus, Trash2 } from 'lucide-react';

export default function Members({ members = [], onAddMember, onDeleteMember, setView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    rollId: '', 
    phone: '', 
    track: 'MCA (Computer Applications)', 
    academicYear: '1st Year (Sem 1-2)' 
  });
  const [loading, setLoading] = useState(false);

  const filteredMembers = members.filter(m => 
    (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'track') {
        if (value === 'Staff') {
          updated.academicYear = 'N/A';
        } else if (prev.track === 'Staff') {
          updated.academicYear = '1st Year (Sem 1-2)';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          roll_number: formData.rollId,
          phone: formData.phone,
          track: formData.track,
          academic_year: formData.academicYear
        })
      });

      if (response.ok) {
        const savedStudent = await response.json();
        if (onAddMember) onAddMember(savedStudent);
        setShowModal(false);
        setFormData({ 
          name: '', 
          email: '', 
          rollId: '', 
          phone: '', 
          track: 'MCA (Computer Applications)', 
          academicYear: '1st Year (Sem 1-2)' 
        });
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to register student");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deprovision/delete this member pass?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/students/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        if (onDeleteMember) {
          onDeleteMember(id);
        } else {
          window.location.reload();
        }
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to delete student pass");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Network error. Please try again.");
    }
  };

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

  const isStaff = formData.track === 'Staff';

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Library Members</h1>
          <p className="text-slate-400 mt-1">Authorize and audit student access accounts.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" /> Add Member
          </motion.button>
        </div>
      </motion.div>

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
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
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
                        {member.track || member.course}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <UserCheck className="h-3.5 w-3.5" /> Active
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title="Delete Member Pass"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative my-8"
            >
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-750 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-xl font-bold text-slate-100 mb-4">Register New Student</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Revaldo Ambrose" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <input required type="email" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. revaldo@university.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Roll / Student ID</label>
                    <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="E.G. MCA26042" value={formData.rollId} onChange={e => setFormData({...formData, rollId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Course Program / Track</label>
                  <select name="track" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer" value={formData.track} onChange={handleModalChange}>
                    <option value="MCA (Computer Applications)">MCA (Computer Applications)</option>
                    <option value="Bachelor (B.Tech / BCA)">Bachelor (B.Tech / BCA)</option>
                    <option value="Master (M.Tech / M.Sc)">Master (M.Tech / M.Sc)</option>
                    <option value="PhD & Research">PhD & Research</option>
                    <option value="Staff">Staff (Faculty / Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Academic Year</label>
                  <select 
                    name="academicYear"
                    value={formData.academicYear} 
                    onChange={handleModalChange}
                    disabled={isStaff}
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer ${
                      isStaff ? 'opacity-40 cursor-not-allowed bg-slate-950/50' : ''
                    }`}
                  >
                    {isStaff ? (
                      <option value="N/A">N/A (Staff Member)</option>
                    ) : (
                      <>
                        <option value="1st Year (Sem 1-2)">1st Year (Sem 1-2)</option>
                        <option value="2nd Year (Sem 3-4)">2nd Year (Sem 3-4)</option>
                        <option value="3rd Year (Sem 5-6)">3rd Year (Sem 5-6)</option>
                        <option value="4th Year (Sem 7-8)">4th Year (Sem 7-8)</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-700/50 py-3 rounded-xl font-medium transition-all cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50">
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}