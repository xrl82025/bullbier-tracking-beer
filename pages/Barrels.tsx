
import React, { useState } from 'react';
import { storage } from '../services/mockData';
import { BeerType, BarrelStatus, Location } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, ChevronRight, X, MoreHorizontal, Package } from 'lucide-react';
import { Link } from 'wouter';

const Barrels: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newBarrel, setNewBarrel] = useState({
    code: '',
    capacity: 50,
    beerType: BeerType.GOLDEN_ALE,
    locationId: 'loc-1'
  });

  const locations = storage.getLocations();

  const handleAddBarrel = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === newBarrel.locationId);
    storage.addBarrel({
      code: newBarrel.code,
      capacity: newBarrel.capacity,
      beerType: newBarrel.beerType,
      lastLocationId: newBarrel.locationId,
      lastLocationName: loc?.name || 'Bodega Principal'
    });
    setShowAddModal(false);
    setNewBarrel({ code: '', capacity: 50, beerType: BeerType.GOLDEN_ALE, locationId: 'loc-1' });
  };

  const barrels = storage.getBarrels().filter(b => {
    const matchesSearch = b.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || b.beerType === filterType;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-gemini pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Gestión de Barriles</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supervisa y organiza los activos de la cervecería.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Registrar Barril
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl md:rounded-full border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar código..."
              className="w-full pl-12 pr-6 py-3 bg-transparent border-none rounded-full text-sm focus:ring-0 outline-none text-slate-800 dark:text-white dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

          <div className="flex flex-col sm:flex-row items-center gap-2 px-1">
            <select 
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Variedad: Todas</option>
              {Object.values(BeerType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Estado: Cualquier</option>
              {Object.values(BarrelStatus).map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vista Mobile: Cards */}
        <div className="md:hidden space-y-4">
          {barrels.map((barrel) => (
            <Link key={barrel.id} href={`/barrels/${barrel.id}`}>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                      {barrel.code.slice(-3)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{barrel.code}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        {barrel.capacity}L • {barrel.status === BarrelStatus.EN_BODEGA_LIMPIO ? 'Vacío' : barrel.beerType}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={barrel.status} />
                </div>
                <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    {barrel.lastLocationName}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              </div>
            </Link>
          ))}
          {barrels.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic text-sm">No se encontraron barriles</div>
          )}
        </div>

        {/* Vista Escritorio: Tabla */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-4xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activo</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variedad</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {barrels.map((barrel) => (
                <tr key={barrel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary font-bold text-sm">
                        {barrel.code.slice(-2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{barrel.code}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{barrel.capacity} Litros</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {barrel.status === BarrelStatus.EN_BODEGA_LIMPIO ? '—' : barrel.beerType}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={barrel.status} />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{barrel.lastLocationName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/barrels/${barrel.id}`}>
                        <button className="px-4 py-2 text-primary font-bold text-xs hover:bg-primary-light dark:hover:bg-primary/10 rounded-full transition-all flex items-center gap-1">
                          Detalles
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {barrels.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic">No se encontraron barriles</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Nuevo Barril</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">REGISTRO DE ACTIVO</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            
            <form onSubmit={handleAddBarrel} className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">CÓDIGO IDENTIFICADOR</label>
                <input 
                  required
                  type="text" 
                  placeholder="BRL-000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={newBarrel.code}
                  onChange={(e) => setNewBarrel({...newBarrel, code: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LITROS</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/10 outline-none transition-all"
                    value={newBarrel.capacity}
                    onChange={(e) => setNewBarrel({...newBarrel, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">VARIEDAD</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                    value={newBarrel.beerType}
                    onChange={(e) => setNewBarrel({...newBarrel, beerType: e.target.value as BeerType})}
                  >
                    {Object.values(BeerType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">UBICACIÓN INICIAL</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                  value={newBarrel.locationId}
                  onChange={(e) => setNewBarrel({...newBarrel, locationId: e.target.value})}
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-4 text-base active:scale-95"
              >
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Barrels;
