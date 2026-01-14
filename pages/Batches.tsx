
import React, { useState } from 'react';
import { useStorage } from '../services/mockData';
import { BeerType, Batch } from '../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Droplets, 
  X, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Batches: React.FC = () => {
  const storage = useStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newBatch, setNewBatch] = useState({
    fermenterName: '',
    beerType: BeerType.GOLDEN_ALE,
    totalLiters: 1000,
    fillingDate: new Date().toISOString().split('T')[0]
  });

  const batches = storage.getBatches().filter(b => 
    b.fermenterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.beerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await storage.addBatch(newBatch);
    setShowAddModal(false);
    setNewBatch({
      fermenterName: '',
      beerType: BeerType.GOLDEN_ALE,
      totalLiters: 1000,
      fillingDate: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'fermentando': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'madurando': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'listo': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'terminado': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-gemini pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Lotes y Fermentación</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Control de volumen y maduración en tanques.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Lote
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl md:rounded-full border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar fermentador o variedad..."
            className="w-full pl-12 pr-6 py-3 bg-transparent border-none rounded-full text-sm focus:ring-0 outline-none text-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const percentage = Math.round((batch.remainingLiters / batch.totalLiters) * 100);
          const isLow = percentage < 20;

          return (
            <div key={batch.id} className="gemini-card p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isLow ? 'bg-rose-100 text-rose-500 dark:bg-rose-900/20' : 'bg-primary-light dark:bg-primary/20 text-primary'}`}>
                    <Droplets className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{batch.fermenterName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{batch.beerType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(batch.status)}`}>
                  {batch.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Litros Restantes</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                      {batch.remainingLiters} <span className="text-sm text-slate-400">/ {batch.totalLiters}L</span>
                    </p>
                  </div>
                  <p className={`text-sm font-black ${isLow ? 'text-rose-500' : 'text-primary'}`}>{percentage}%</p>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${isLow ? 'bg-rose-500' : 'bg-primary'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    Llenado: {new Date(batch.fillingDate).toLocaleDateString()}
                  </div>
                  {isLow && batch.status !== 'terminado' && (
                    <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase">Stock Crítico</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Nuevo Lote</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">PRODUCCIÓN INICIAL</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddBatch} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">IDENTIFICADOR FERMENTADOR</label>
                <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={newBatch.fermenterName} onChange={e => setNewBatch({...newBatch, fermenterName: e.target.value.toUpperCase()})} placeholder="Ej: TANQUE-04" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">VARIEDAD PRODUCIDA</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                    value={newBatch.beerType}
                    onChange={(e) => setNewBatch({...newBatch, beerType: e.target.value as BeerType})}
                  >
                    {Object.values(BeerType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LITROS TOTALES</label>
                  <input required type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={newBatch.totalLiters} onChange={e => setNewBatch({...newBatch, totalLiters: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">FECHA DE LLENADO</label>
                <input required type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={newBatch.fillingDate} onChange={e => setNewBatch({...newBatch, fillingDate: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-4 text-base active:scale-95 shadow-lg">
                Iniciar Fermentación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
