// src/views/Dashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Clock, CheckCircle } from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ booksCount = 0, members = [], transactions = [] }) {
  // Dynamically compute tracking metrics based on real application states
  const totalMembersCount = members.length.toLocaleString();
  
  const activeLoansCount = transactions.filter(
    tx => tx.status === 'Issued' || tx.status === 'Overdue'
  ).length.toLocaleString();

  // Count returns processed today (matching the current local date format)
  const todayString = new Date().toLocaleDateString();
  const returnedTodayCount = transactions.filter(
    tx => tx.status === 'Returned' && tx.returnDate === todayString
  ).length.toLocaleString();

  // Stagger configurations for parent container container elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  // Smooth slide up for individual components
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // Extract the 3 most recent records for the activity log output stream
  const recentActivities = [...transactions]
    .sort((a, b) => b.id - a.id) // Sort by descending timestamp IDs
    .slice(0, 3)
    .map(tx => ({
      user: tx.memberName,
      action: tx.status === 'Returned' ? `returned '${tx.bookTitle}'` : `borrowed '${tx.bookTitle}'`,
      time: tx.issueDate === todayString ? "Today" : tx.issueDate
    }));

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">System Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time overview of your library operations.</p>
      </motion.div>

      {/* Grid Summary Cards Matrix */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Books", value: booksCount, icon: Book, color: "bg-indigo-600 shadow-indigo-600/20 shadow-lg" },
          { title: "Active Members", value: totalMembersCount, icon: Users, color: "bg-cyan-600 shadow-cyan-600/20 shadow-lg" },
          { title: "Books Borrowed", value: activeLoansCount, icon: Clock, color: "bg-amber-600 shadow-amber-600/20 shadow-lg" },
          { title: "Returned Today", value: returnedTodayCount || "0", icon: CheckCircle, color: "bg-emerald-600 shadow-emerald-600/20 shadow-lg" }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <StatsCard title={card.title} value={card.value} icon={card.icon} color={card.color} />
          </motion.div>
        ))}
      </motion.div>

      {/* Data Engine Stream Logger Log Output Component */}
      <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Recent Book Activities</h2>
        
        <motion.div variants={containerVariants} className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ x: 4, backgroundColor: "rgba(30, 41, 59, 0.6)", borderColor: "rgba(100, 116, 139, 0.3)" }}
                className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/30 transition-colors duration-200"
              >
                <span className="text-slate-300">
                  <strong className="text-indigo-400 font-semibold">{activity.user}</strong> {activity.action}
                </span>
                <span className="text-slate-500 font-mono text-xs">{activity.time}</span>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-slate-500 text-sm italic py-2">
              No recent distribution transactions logged.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}