// src/views/Dashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Book, Users, Clock, CheckCircle, AlertTriangle, DollarSign,
  BookOpen, Award, ArrowUpRight, ArrowDownLeft, Layers
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ booksCount = 0, books = [], members = [], transactions = [] }) {
  // ---- Core metrics ----
  const totalMembersCount = members.length.toLocaleString();

  const activeLoansCount = transactions.filter(
    tx => tx.status === 'Issued' || tx.status === 'Overdue'
  ).length.toLocaleString();

  const todayString = new Date().toLocaleDateString();
  const returnedTodayCount = transactions.filter(
    tx => tx.status === 'Returned' && tx.returnDate === todayString
  ).length.toLocaleString();

  const overdueCount = transactions.filter(tx => tx.status === 'Overdue').length;

  const availableBooksCount = books.filter(b => b.status === 'Available').length;

  const feesCollected = transactions.reduce((sum, tx) => {
    const parsed = parseFloat(String(tx.fine || '0').replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  // ---- Genre breakdown (top 5) ----
  const genreCounts = books.reduce((acc, b) => {
    const g = b.genre || 'General';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxGenreCount = topGenres.length > 0 ? topGenres[0][1] : 1;

  // ---- Top borrower ----
  const borrowerCounts = transactions.reduce((acc, tx) => {
    if (!tx.memberName) return acc;
    acc[tx.memberName] = (acc[tx.memberName] || 0) + 1;
    return acc;
  }, {});
  const topBorrowerEntry = Object.entries(borrowerCounts).sort((a, b) => b[1] - a[1])[0];

  // ---- Recent activity (last 5) ----
  const recentActivities = [...transactions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
    .map(tx => ({
      user: tx.memberName,
      action: tx.status === 'Returned'
        ? `returned '${tx.bookTitle}'`
        : tx.status === 'Overdue'
          ? `is overdue on '${tx.bookTitle}'`
          : `borrowed '${tx.bookTitle}'`,
      time: tx.issueDate === todayString ? "Today" : tx.issueDate,
      status: tx.status,
    }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const statusStyle = (status) => {
    if (status === 'Returned') return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', Icon: ArrowDownLeft };
    if (status === 'Overdue') return { color: 'text-rose-400', bg: 'bg-rose-500/10', Icon: AlertTriangle };
    return { color: 'text-amber-400', bg: 'bg-amber-500/10', Icon: ArrowUpRight };
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">System Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time overview of your library operations.</p>
      </motion.div>

      {/* Primary stats row */}
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

      {/* Secondary stats row */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Overdue Loans", value: overdueCount, icon: AlertTriangle, color: "bg-rose-600 shadow-rose-600/20 shadow-lg" },
          { title: "Available Right Now", value: availableBooksCount, icon: BookOpen, color: "bg-teal-600 shadow-teal-600/20 shadow-lg" },
          { title: "Fees Collected", value: `₹${feesCollected.toFixed(2)}`, icon: DollarSign, color: "bg-fuchsia-600 shadow-fuchsia-600/20 shadow-lg" },
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

      {/* Two-column: activity feed + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity — wider column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Recent Book Activities</h2>

          <motion.div variants={containerVariants} className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => {
                const { color, bg, Icon } = statusStyle(activity.status);
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ x: 4, backgroundColor: "rgba(30, 41, 59, 0.6)", borderColor: "rgba(100, 116, 139, 0.3)" }}
                    className="flex justify-between items-center gap-4 text-sm py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-slate-300 truncate">
                        <strong className="text-indigo-400 font-semibold">{activity.user}</strong> {activity.action}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-xs shrink-0">{activity.time}</span>
                  </motion.div>
                );
              })
            ) : (
              <motion.div variants={itemVariants} className="text-slate-500 text-sm italic py-2">
                No recent distribution transactions logged.
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Insights column */}
        <div className="space-y-6">
          {/* Genre breakdown */}
          <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" /> Catalog by Genre
            </h2>
            {topGenres.length > 0 ? (
              <div className="space-y-3">
                {topGenres.map(([genre, count], idx) => (
                  <div key={genre}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">{genre}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900/80 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxGenreCount) * 100}%` }}
                        transition={{ delay: 0.1 + idx * 0.05, duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No books catalogued yet.</p>
            )}
          </motion.div>

          {/* Top borrower */}
          <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Top Borrower
            </h2>
            {topBorrowerEntry ? (
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {topBorrowerEntry[0].slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{topBorrowerEntry[0]}</p>
                  <p className="text-xs text-slate-400">{topBorrowerEntry[1]} book{topBorrowerEntry[1] === 1 ? '' : 's'} borrowed</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No borrowing activity yet.</p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
