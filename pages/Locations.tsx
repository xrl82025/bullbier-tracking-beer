
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/mockData';
import { MapPin, Navigation, MoreVertical, Plus, X, Edit2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Location } from '../types';

const Locations: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const locations = storage.getLocations();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addLocation(name, address);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      storage.updateLocation(editingLocation.id, { name, address });
      setEditingLocation(null);
      resetForm();
    }
  };

  // Fix: handle async call to deleteLocation
  const handleDelete = async (id: string) => {
    const result = await storage.deleteLocation(id);
    if (!result.success) {
      setError(result.error || 'Error al eliminar');
      setTimeout(() => setError(null), 3000);
    }
    setActiveMenu(null);
  };

  const resetForm = () => {
    setName('');
    setAddress('');
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLocation(loc);
    setName(loc.name);
    setAddress(loc.address);
    setActiveMenu(null);
  };

  const handleViewMap = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <>
      <div className="space-y-8 animate-gemini relative">
        {error && (
          <div className="fixed top-20 right-8 z-[110] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 shadow-xl animate-in slide-in-from-right-4 duration-300">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Ubicaciones</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión de bodegas y puntos de despacho.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Ubicación
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="gemini-card p-8 rounded-4xl group transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 relative">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-light dark:bg-primary/20 p-3 rounded-2xl text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="relative" ref={activeMenu === loc.id ? menuRef : null}>
                  <button 
                    onClick={() => setActiveMenu(activeMenu === loc.id ? null : loc.id)}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {activeMenu === loc.id && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => handleOpenEdit(loc)}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-primary" />
                        Editar Ubicación
                      </button>
                      <button 
                        onClick={() => handleDelete(loc.id)}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Ubicación
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{loc.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5 font-medium">
                <Navigation className="w-3 h-3 text-slate-400" />
                {loc.address}
              </p>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Barriles</p>
                  <p className="text-3xl font-bold text-primary">{loc.barrelCount}</p>
                </div>
                <button 
                  onClick={() => handleViewMap(loc.lat, loc.lng)}
                  className="text-xs font-bold text-primary dark:text-blue-400 hover:bg-primary-light dark:hover:bg-primary/10 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver Mapa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(showAddModal || editingLocation) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">PUNTO OPERATIVO</p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingLocation(null); resetForm(); }} 
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            <form onSubmit={editingLocation ? handleEdit : handleAdd} className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOMBRE DE LA UBICACIÓN</label>
                <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Depósito Central" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">DIRECCIÓN FÍSICA</label>
                <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle y número" />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-4 text-base active:scale-95">
                {editingLocation ? 'Guardar Cambios' : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Locations;
