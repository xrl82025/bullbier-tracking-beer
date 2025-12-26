import React from 'react';
import { useLocation } from 'wouter';
import { 
  Beer, 
  Truck, 
  AlertCircle, 
  Activity as ActivityIcon,
  QrCode,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { storage } from '../services/mockData';
// Fixed: UserSession is exported from authService, not types
import { BarrelStatus } from '../types';
import { UserSession } from '../services/authService';
import StatusBadge from '../components/StatusBadge';
import { STATUS_LABELS } from '../constants';

// Fixed: Used UserSession interface instead of inline object type
interface DashboardProps {
  user: UserSession;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [, setLocation] = useLocation();
  const barrels = storage.getBarrels();
  const activities = storage.getActivities().slice(0, 6);

  const stats = [
    { label: 'Total Barriles', value: barrels.length, icon: <Beer />, color: 'text-primary' },
    { label: 'En Tránsito', value: barrels.filter(b => b.status === BarrelStatus.EN_TRANSITO).length, icon: <Truck />, color: 'text-amber-500' },
    { label: 'Para Limpieza', value: barrels.filter(b => b.status === BarrelStatus.EN_BODEGA_SUCIO).length, icon: <AlertCircle />, color: 'text-rose-500' },
    { label: 'Producción', value: barrels.filter(b => b.status === BarrelStatus.LLENADO).length, icon: <TrendingUp />, color: 'text-emerald-500' },
  ];

  const statusDistribution = Object.values(BarrelStatus).map(status => ({
    name: STATUS_LABELS[status],
    value: barrels.filter(b => b.status === status).length,
  })).filter(d => d.value > 0);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-10 animate-gemini">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
            Hola, <span className="gemini-gradient font-semibold">{user.name}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Aquí tienes un resumen de la operación cervecera.</p>
        </div>
        <button 
          onClick={() => setLocation('/scan')}
          className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          Escanear Barril
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="gemini-card p-6 rounded-3xl dark:bg-slate-800 dark:border-slate-700">
            <div className={`${stat.color} mb-4`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribution Chart */}
        <div className="lg:col-span-8 gemini-card p-8 rounded-3xl dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Distribución de Flota</h2>
            <button className="text-sm font-bold text-primary hover:underline">Ver reporte</button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#F1F5F9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94A3B8' }} 
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: isDark ? '#0f172a' : '#F8FAFD' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: isDark ? '#1f2937' : '#1f2937'
                  }}
                  itemStyle={{ color: isDark ? '#f1f5f9' : '#1f2937' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#1A73E8" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 gemini-card p-8 rounded-3xl flex flex-col dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Actividad</h2>
          <div className="space-y-6 flex-1">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 group">
                <div className="w-1.5 h-auto bg-slate-100 dark:bg-slate-700 rounded-full group-first:bg-primary/30 transition-colors" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Barril {act.barrelCode}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={act.newStatus} showIcon={false} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {act.locationName}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1 border-t border-slate-50 dark:border-slate-700 pt-4">
            Ver historial completo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;