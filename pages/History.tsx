
import React, { useState } from 'react';
import { storage } from '../services/mockData';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Beer as BeerIcon,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { BarrelStatus } from '../types';

const HistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const activities = storage.getActivities().filter(act => 
    act.barrelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-gemini">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Auditoría</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registro completo de movimientos y cambios de estado.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl md:rounded-full border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar barril o usuario..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-full text-sm focus:ring-0 outline-none text-slate-800 dark:text-white dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl md:rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros Avanzados
        </button>
      </div>

      {/* Vista Mobile: Cards de Actividad */}
      <div className="md:hidden space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-[0.2em] mb-1">{act.barrelCode}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: false })}
                </div>
              </div>
              <StatusBadge status={act.newStatus} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-800">
               {/* Contextual Meta-info */}
               {act.newStatus === BarrelStatus.LLENADO && act.beerType && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <BeerIcon className="w-3.5 h-3.5 text-amber-500" /> {act.beerType}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {act.locationName}
              </div>
              {act.newStatus === BarrelStatus.EN_EVENTO && act.eventName && (
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Calendar className="w-3.5 h-3.5" /> {act.eventName}
                </div>
              )}
              {act.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-t border-slate-200/50 dark:border-slate-700/50 pt-2 mt-2">
                   "{act.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] border border-slate-200 dark:border-slate-600 uppercase">
                  {act.userName.charAt(0)}
                </div>
                {act.userName}
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
           <div className="py-12 text-center text-slate-400 italic text-sm">No se encontraron registros</div>
        )}
      </div>

      {/* Vista Escritorio: Tabla */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl md:rounded-4xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barril</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cambio</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <Calendar className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    {new Date(act.createdAt).toLocaleDateString()}
                    <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-2" />
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap font-bold text-primary dark:text-blue-400">
                  {act.barrelCode}
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={act.newStatus} />
                    </div>
                    {/* Contextual Meta-info */}
                    {act.newStatus === BarrelStatus.LLENADO && act.beerType && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                        <BeerIcon className="w-3 h-3 text-amber-500" /> {act.beerType}
                      </span>
                    )}
                    {act.newStatus === BarrelStatus.EN_EVENTO && act.eventName && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-purple-500" /> {act.eventName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <MapPin className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    {act.locationName}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {act.userName.charAt(0)}
                    </div>
                    {act.userName}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 italic">No hay registros de actividad aún</div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
