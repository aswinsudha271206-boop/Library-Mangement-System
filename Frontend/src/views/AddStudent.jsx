// src/views/AddStudent.jsx
import React, { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function AddStudent({ setView, onAddMember }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollId: '',
    phone: '',
    course: 'MCA',
    academicYear: '1st Year (Sem 1-2)'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        track: formData.course,
        academic_year: formData.academicYear
      }),
    });

    if (!response.ok) throw new Error("Failed to provision student.");

    const savedStudent = await response.json();
    onAddMember(savedStudent); // Propagate changes[cite: 5]
    alert(`Successfully committed ${savedStudent.name} to database.`);
    setView("dashboard");
  } catch (err) {
    console.error(err);
    alert("Backend error: Could not commit student to database.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button 
        onClick={() => setView("members")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Members
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Provision Student Profile Pass</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manually register new student identities directly into the system table index.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Revaldo Ambrose"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">University Verification Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. revaldo@university.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Roll / Student ID</label>
              <input 
                type="text" 
                name="rollId"
                value={formData.rollId}
                onChange={handleChange}
                placeholder="E.G. MCA26042"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enrollment Track</label>
              <select 
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="MCA">MCA (Computer Applications)</option>
                <option value="BTech">BTech (Information Technology)</option>
                <option value="MSc">MSc (Data Science)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
              <select 
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="1st Year (Sem 1-2)">1st Year (Sem 1-2)</option>
                <option value="2nd Year (Sem 3-4)">2nd Year (Sem 3-4)</option>
                <option value="3rd Year (Sem 5-6)">3rd Year (Sem 5-6)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800/60 mt-6">
            <button 
              type="button"
              onClick={() => setView("dashboard")}
              className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-3 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-cyan-600/10 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Commit Student Pass"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}