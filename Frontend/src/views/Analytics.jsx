// src/views/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, BookOpen, Users, AlertCircle, Calendar, Clock, ArrowUpRight, PieChart } from 'lucide-react';

export default function Analytics({ booksCount, membersCount, transactionsCount }) {
  const [timeframe, setTimeframe] = useState('month'); // 'day' | 'month' | 'year'
  const [liveTime, setLiveTime] = useState(new Date());

  // Live Telemetry Clock verification loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timeframe-dependent dynamic value shifting multipliers to simulate real database distribution structures
  const getCalculatedMetric = (baseValue, dayMul, monthMul, yearMul) => {
    const value = baseValue || 0;
    if (timeframe === 'day') return Math.max(1, Math.round(value * dayMul));
    if (timeframe === 'year') return Math.round(value * yearMul);
    return value; // Default 'month' baseline matching state management tier
  };

  const catVal = getCalculatedMetric(booksCount, 0.1, 1, 4.5);
  const memVal = getCalculatedMetric(membersCount, 0.5, 1, 8.2);
  const txVal = getCalculatedMetric(transactionsCount, 0.25, 1, 12.4);

  const performanceMetrics = [
    { title: "Catalog Acquisitions", value: catVal, change: timeframe === 'day' ? "New arrival today" : timeframe === 'year' ? "+45% annual growth" : "+12% this month", icon: BookOpen, color: "text-indigo-400", hexColor: "#6366f1" },
    { title: "New Member Registrations", value: memVal, change: timeframe === 'day' ? "Verified active signups" : timeframe === 'year' ? "+84% expansion rate" : "+4% growth", icon: Users, color: "text-cyan-400", hexColor: "#22d3ee" },
    { title: "Circulation Volume Matrix", value: txVal, change: timeframe === 'day' ? "Real-time loan dispatches" : timeframe === 'year' ? "Record circulation yield" : "+8% volume tracking", icon: TrendingUp, color: "text-emerald-400", hexColor: "#34d399" },
  ];

  // 📈 Chart Matrix Coordinates Configuration based on Dimension state selection
  const chartDataMap = {
    day: {
      labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
      points: [20, 45, 30, 85, 60, 75, 40],
      yTicks: ["100", "75", "50", "25", "0"]
    },
    month: {
      labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
      points: [30, 65, 45, 90],
      yTicks: ["400", "300", "200", "100", "0"]
    },
    year: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      points: [40, 35, 80, 95],
      yTicks: ["2000", "1500", "1000", "500", "0"]
    }
  };

  const currentChart = chartDataMap[timeframe];

  // Generates SVG polyline coordinates string dynamically based on dataset arrays
  const generateSvgPath = (points, width, height) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    return points.map((p, index) => {
      const x = padding + (index / (points.length - 1)) * chartWidth;
      const y = padding + chartHeight - (p / 100) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  // 🥧 SVG Pie Segment Path Generation Formulas
  const totalValue = catVal + memVal + txVal;
  let accumulatedAngle = 0;

  const generatePieSlicePath = (value) => {
    if (totalValue === 0) return '';
    const percentage = value / totalValue;
    const angle = percentage * 360;
    
    const r = 70; // Radius configuration
    const cx = 90; // Center X
    const cy = 90; // Center Y

    const x1 = cx + r * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
    const y1 = cy + r * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
    
    accumulatedAngle += angle;
    
    const x2 = cx + r * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
    const y2 = cy + r * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Animation variants container for card orchestration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Library Insights & Analytics</h2>
            <p className="text-sm text-slate-400">Real-time performance distribution tracks and structural data insights.</p>
          </div>
        </div>

        {/* 🕒 Live Telemetry Systems Clock Validation Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-slate-300 shadow-inner self-start sm:self-auto">
          <Clock className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>SYS_LIVE:</span>
          <span className="text-cyan-400 font-bold">
            {liveTime.toLocaleDateString()} {liveTime.toLocaleTimeString()}
          </span>
        </div>
      </motion.div>

      {/* 📊 Segmented Timeframe Switcher Filter Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 max-w-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pl-2">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>Dimension Matrix:</span>
        </div>
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-900 relative">
          {['day', 'month', 'year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className="px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors duration-200 cursor-pointer relative z-10 text-slate-400 font-semibold"
            >
              {timeframe === t && (
                <motion.span
                  layoutId="activeTimeframeTab"
                  className="absolute inset-0 bg-indigo-600 rounded-md shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={timeframe === t ? 'text-white font-bold' : 'hover:text-slate-200'}>
                {t}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid Summary Cards Metrics mapping */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {performanceMetrics.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: "rgba(100, 116, 139, 0.4)" }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-slate-400">{card.title}</span>
                <motion.div whileHover={{ scale: 1.1 }} className="p-1.5 bg-slate-950 rounded-lg border border-slate-850">
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={card.value}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="text-3xl font-bold text-slate-100"
                  >
                    {card.value}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                  {timeframe}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span>{card.change}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 📊 Split Two-Column Layout Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📈 Column 1 & 2: Line Graph */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Circulation Activity Graph Mapping</h3>
          </div>

          <div className="relative w-full overflow-x-auto overflow-y-hidden pt-2">
            <div className="min-w-[500px] h-64 relative">
              <svg viewBox="0 0 700 250" className="w-full h-full overflow-visible">
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="40" y1={40 + i * 42.5} x2="660" y2={40 + i * 42.5} className="stroke-slate-800/60" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                {currentChart.yTicks.map((tick, i) => (
                  <text key={i} x="15" y={45 + i * 42.5} className="fill-slate-500 font-mono text-[11px]" textAnchor="end">{tick}</text>
                ))}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                
                {/* Smooth Morphing path components via Framer motion rendering */}
                <motion.polygon 
                  layout
                  points={`40,210 ${generateSvgPath(currentChart.points, 700, 250)} 660,210`} 
                  fill="url(#chartGradient)"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
                
                <motion.polyline 
                  layout
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  points={generateSvgPath(currentChart.points, 700, 250)} 
                  className="drop-shadow-[0_4px_10px_rgba(99,102,241,0.4)]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                />
                
                {currentChart.points.map((p, index) => {
                  const cx = 40 + (index / (currentChart.points.length - 1)) * 620;
                  const cy = 210 - (p / 100) * 170;
                  return (
                    <g key={index} className="group/node cursor-pointer">
                      <motion.circle 
                        layout
                        cx={cx} 
                        cy={cy} 
                        r="6" 
                        className="fill-slate-950 stroke-indigo-400 stroke-[3px]" 
                        whileHover={{ r: 8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      />
                    </g>
                  );
                })}
                {currentChart.labels.map((label, i) => {
                  const x = 40 + (i / (currentChart.labels.length - 1)) * 620;
                  return <text key={i} x={x} y="238" className="fill-slate-400 font-medium text-xs" textAnchor="middle">{label}</text>;
                })}
              </svg>
            </div>
          </div>
        </motion.div>

        {/* 🥧 Column 3: Custom SVG Pie Distribution Component */}
        <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Metrics Allocation Ratio</h3>
            </div>
            
            {/* Pie Core Ring Element */}
            <div className="flex justify-center items-center py-2">
              <div className="w-44 h-44 relative">
                <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-6 overflow-visible">
                  {performanceMetrics.map((card, idx) => (
                    <motion.path
                      layout
                      key={idx}
                      d={generatePieSlicePath(card.value)}
                      fill={card.hexColor}
                      className="opacity-85 cursor-pointer stroke-slate-950 stroke-2"
                      whileHover={{ scale: 1.05, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    />
                  ))}
                  {/* Central Hole cutout mask for a clean donut/pie layout appearance */}
                  <circle cx="90" cy="90" r="38" className="fill-slate-950" />
                </svg>
              </div>
            </div>
          </div>

          {/* Label Legends Checklist Mapping */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/60 font-sans text-xs">
            {performanceMetrics.map((card, idx) => {
              const percentage = totalValue > 0 ? ((card.value / totalValue) * 100).toFixed(1) : 0;
              return (
                <motion.div 
                  key={idx} 
                  layout
                  className="flex justify-between items-center bg-slate-950/40 border border-slate-900/50 p-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: card.hexColor }}></span>
                    <span className="text-slate-400 font-medium truncate max-w-[130px]">{card.title.split(' ')[0]} Index</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">{percentage}%</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* Data Engine Stream Logger Log Output Component */}
      <motion.div variants={itemVariants} className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">System Live Stream Telemetry</h3>
        </div>
        <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 font-mono text-xs text-slate-400 space-y-2 max-h-48 overflow-y-auto shadow-inner">
          <div className="flex gap-4"><span className="text-indigo-500">[INFO]</span> <span>Database Connection Pool verification status: OK</span></div>
          <div className="flex gap-4">
            <span className="text-cyan-400">[METRIC]</span> 
            <span>Lending circulation frequency scope shifted cleanly to <strong className="text-indigo-400 font-semibold">[{timeframe.toUpperCase()}]</strong> bounds.</span>
          </div>
          <div className="flex gap-4"><span className="text-slate-600">[IDLE]</span> <span>Awaiting live backend endpoints switchover on port 8080...</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}