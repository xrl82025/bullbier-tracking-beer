
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStorage } from '../services/mockData';
import { BeerType, Batch } from '../types';
import { BEER_TYPE_COLORS } from '../constants';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Droplets, 
  X, 
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Beer,
  Calendar,
  Database
} from 'lucide-react';

const TANKS = ["TANQUE 01", "TANQUE 02", "TANQUE 03"];
const BASE_BEER_TYPES = [BeerType.GOLDEN_ALE, BeerType.AMBAR_ALE, BeerType.STOUT];

const Batches: React.FC = () => {
  const storage = useStorage();
  const [location] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [step, setStep] = useState(1);
  const [newBatch, setNewBatch] = useState({
    fermenterName: TANKS[0],
    beerType: BeerType.GOLDEN_ALE,
    totalLiters: 1000,
    fillingDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeType = params.get('recipe');
    if (recipeType) {
      const isBase = BASE_BEER_TYPES.includes(recipeType as BeerType);
      setNewBatch(prev => ({ ...prev, beerType: isBase ? recipeType as BeerType : BeerType.GOLDEN_ALE }));
      setShowAddModal(true);
      setStep(2); 
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const batches = storage.getBatches().filter(b => 
    b.fermenterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.beerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBatch = async () => {
    await storage.addBatch(newBatch);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setStep(1);
    setNewBatch({
      fermenterName: TANKS[0],
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
    <>
      <div className="space-y-8 animate-gemini pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Lotes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión de producción primaria y fermentadores.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0"
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
              <div key={batch.id} className="gemini-card p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm border border-slate-100 dark:border-slate-700">
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
          {batches.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">No hay lotes registrados para mostrar</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 mx-4 flex flex-col max-h-[90vh]">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                    {step === 1 ? 'Variedad Base' : step === 2 ? 'Configuración' : 'Confirmar'}
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">
                    PASO {step} DE 3
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group"
                >
                  <X className="w-5 h-5 text-slate-300 dark:text-slate-500 group-hover:text-slate-500" />
                </button>
              </div>

              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      s <= step ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-700'
                    }`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/10 dark:bg-slate-900/10">
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-right-4 duration-300">
                  {BASE_BEER_TYPES.map((type) => {
                    const isActive = newBatch.beerType === type;
                    const colorClass = BEER_TYPE_COLORS[type] || 'bg-slate-100';
                    return (
                      <button
                        key={type}
                        onClick={() => setNewBatch({ ...newBatch, beerType: type })}
                        className={`group relative p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                          isActive 
                            ? 'bg-white dark:bg-slate-800 border-primary shadow-lg shadow-primary/5' 
                            : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorClass}`}>
                          <Beer className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                            {type}
                          </span>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ELEGIR FERMENTADOR</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TANKS.map((tank) => {
                        const isSelected = newBatch.fermenterName === tank;
                        return (
                          <button
                            key={tank}
                            type="button"
                            onClick={() => setNewBatch({ ...newBatch, fermenterName: tank })}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              isSelected 
                                ? 'bg-primary/5 border-primary text-primary' 
                                : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-400'
                            }`}
                          >
                            <Database className="w-4 h-4" />
                            <span className="text-[9px] font-black">{tank.split(' ')[1]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">VOLUMEN (LITROS)</label>
                      <div className="relative group">
                        <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          required 
                          type="number" 
                          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary/30 transition-all" 
                          value={newBatch.totalLiters} 
                          onChange={e => setNewBatch({...newBatch, totalLiters: parseInt(e.target.value)})} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">FECHA PRODUCCIÓN</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          required 
                          type="date" 
                          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary/30 transition-all" 
                          value={newBatch.fillingDate} 
                          onChange={e => setNewBatch({...newBatch, fillingDate: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${BEER_TYPE_COLORS[newBatch.beerType]}`}>
                          <Beer className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">VARIEDAD</p>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mt-1">{newBatch.beerType}</h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-slate-700">
                        <div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">FERMENTADOR</p>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{newBatch.fermenterName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">CANTIDAD</p>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{newBatch.totalLiters} L</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(newBatch.fillingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-3 shrink-0">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button 
                  onClick={handleAddBatch}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Registrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Batches;
