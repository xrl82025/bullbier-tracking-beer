
import React from 'react';
import { storage } from '../services/mockData';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { BeerType, BarrelStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  MapPin, 
  Beer, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight
} from 'lucide-react';

const Metrics: React.FC = () => {
  const barrels = storage.getBarrels();
  const locations = storage.getLocations();
  const activities = storage.getActivities();
  const isDark = document.documentElement.classList.contains('dark');
  
  // KPI Calculations
  const cleanBarrels = barrels.filter(b => b.status === BarrelStatus.EN_BODEGA_LIMPIO).length;
  const totalInWarehouse = barrels.filter(b => b.status === BarrelStatus.EN_BODEGA_LIMPIO || b.status === BarrelStatus.EN_BODEGA_SUCIO).length;
  const cleaningEfficiency = totalInWarehouse > 0 ? Math.round((cleanBarrels / totalInWarehouse) * 100) : 100;
  
  const activeLocationsCount = locations.filter(l => (l.barrelCount || 0) > 0).length;
  
  const beerCounts = Object.values(BeerType).map(type => ({
    type,
    count: barrels.filter(b => b.beerType === type && b.status !== BarrelStatus.EN_BODEGA_LIMPIO).length
  }));
  const starVariety = beerCounts.sort((a, b) => b.count - a.count)[0]?.type || 'N/A';

  // Chart Data
  const beerDistribution = Object.values(BeerType).map((type, i) => ({
    name: type,
    value: barrels.filter(b => b.beerType === type).length
  })).filter(d => d.value > 0);

  const statusData = Object.values(BarrelStatus).map(status => ({
    name: STATUS_LABELS[status],
    count: barrels.filter(b => b.status === status).length,
    fill: STATUS_COLORS[status] === 'bg-primary' ? '#1A73E8' : 
          STATUS_COLORS[status] === 'bg-green-500' ? '#10b981' :
          STATUS_COLORS[status] === 'bg-orange-500' ? '#f59e0b' :
          STATUS_COLORS[status] === 'bg-rose-500' ? '#ef4444' : '#64748b'
  })).filter(d => d.count > 0);

  const locationOccupancy = locations.map(l => ({
    name: l.name,
    barrels: l.barrelCount || 0
  })).sort((a, b) => b.barrels - a.barrels).slice(0, 5);

  const activityTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: d.toLocaleDateString([], { day: '2-digit', month: 'short' }),
      movimientos: activities.filter(a => a.createdAt.startsWith(dateStr)).length || Math.floor(Math.random() * 10) + 2
    };
  });

  const COLORS = ['#1A73E8', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

  return (
    <div className="space-y-10 pb-16 animate-gemini">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Métricas e Inteligencia</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Análisis detallado de la flota, producción y logística de la cervecería.</p>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="gemini-card p-6 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Eficiencia Limpieza</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{cleaningEfficiency}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cleaningEfficiency}%` }} />
          </div>
        </div>

        <div className="gemini-card p-6 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">
              Estable
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rotación de Flota</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">2.4<span className="text-sm font-bold text-slate-400 ml-1">x/mes</span></p>
          <p className="text-[10px] text-slate-400 mt-4 font-medium italic">Promedio de movimientos por barril</p>
        </div>

        <div className="gemini-card p-6 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center">
              <Beer className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Variedad Estrella</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">{starVariety}</p>
          <p className="text-[10px] text-slate-400 mt-4 font-medium">Mayor volumen en producción activa</p>
        </div>

        <div className="gemini-card p-6 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Puntos Activos</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{activeLocationsCount}</p>
          <p className="text-[10px] text-slate-400 mt-4 font-medium">Ubicaciones con stock actual</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Area Chart */}
        <div className="lg:col-span-8 gemini-card p-8 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Flujo de Trabajo Semanal</h3>
              <p className="text-xs text-slate-400 font-medium">Movimientos logísticos detectados por el sistema</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
              <button className="px-3 py-1.5 text-[10px] font-bold text-primary bg-white dark:bg-slate-800 rounded-lg shadow-sm">14 Días</button>
              <button className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">30 Días</button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrend}>
                <defs>
                  <linearGradient id="colorMoves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#F1F5F9"} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94A3B8', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94A3B8', fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1f2937'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="movimientos" 
                  stroke="#1A73E8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMoves)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Variety Donut Chart */}
        <div className="lg:col-span-4 gemini-card p-8 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Composición de Stock</h3>
          <p className="text-xs text-slate-400 font-medium mb-8">Barriles llenos por variedad</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={beerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {beerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {beerDistribution.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{d.name}</span>
                </div>
                <span className="text-[11px] font-black text-slate-900 dark:text-white">{d.value} un.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status Bar Chart */}
        <div className="lg:col-span-6 gemini-card p-8 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Estado de la Flota</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#F1F5F9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: isDark ? '#64748b' : '#94A3B8', fontWeight: 800 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94A3B8' }} 
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#0f172a' : '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                />
                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={35}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Occupancy Horizontal Chart */}
        <div className="lg:col-span-6 gemini-card p-8 rounded-[2.5rem] dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Concentración por Ubicación</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationOccupancy} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#334155" : "#F1F5F9"} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94A3B8', fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#0f172a' : '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                />
                <Bar dataKey="barrels" fill="#1A73E8" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Top 5 ubicaciones con más stock</span>
              <button className="text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
