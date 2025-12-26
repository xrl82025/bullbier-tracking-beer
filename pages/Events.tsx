
import React, { useState } from 'react';
import { storage } from '../services/mockData';
import { Calendar, MapPin, Beer, CheckSquare, Plus, ArrowRight, X, Trash2, CheckCircle2, Search } from 'lucide-react';
import { BreweryEvent, Barrel } from '../types';

const Events: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BreweryEvent | null>(null);
  const [barrelSearchTerm, setBarrelSearchTerm] = useState('');

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    barrelIds: [] as string[]
  });

  const events = storage.getEvents();
  const allBarrels = storage.getBarrels();

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addEvent({
      ...newEvent,
      checklist: [{ id: 'c1', name: 'Logística Inicial', checked: false }]
    });
    setShowAddModal(false);
    setNewEvent({ name: '', date: new Date().toISOString().split('T')[0], notes: '', barrelIds: [] });
  };

  const toggleBarrelSelection = (barrelId: string) => {
    setNewEvent(prev => ({
      ...prev,
      barrelIds: prev.barrelIds.includes(barrelId)
        ? prev.barrelIds.filter(id => id !== barrelId)
        : [...prev.barrelIds, barrelId]
    }));
  };

  const toggleChecklistItem = (eventId: string, itemId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const newChecklist = event.checklist.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    storage.updateEvent(eventId, { checklist: newChecklist });
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({ ...selectedEvent, checklist: newChecklist });
    }
  };

  const addChecklistItem = (eventId: string, name: string) => {
    if (!name.trim()) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const newItem = { id: Math.random().toString(36).substr(2, 9), name, checked: false };
    const newChecklist = [...event.checklist, newItem];
    storage.updateEvent(eventId, { checklist: newChecklist });
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({ ...selectedEvent, checklist: newChecklist });
    }
  };

  const filteredBarrels = allBarrels.filter(b => 
    b.code.toLowerCase().includes(barrelSearchTerm.toLowerCase()) ||
    b.beerType.toLowerCase().includes(barrelSearchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-gemini">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Eventos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Festivales, ferias y despachos logísticos.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Programar Evento
          </button>
        </div>

        <div className="space-y-5">
          {events.map((event) => {
            const dateParts = event.date ? event.date.split('-') : [];
            const day = dateParts.length > 2 ? dateParts[2] : '--';
            
            return (
              <div key={event.id} className="gemini-card p-8 rounded-4xl flex flex-col md:flex-row gap-8 items-center transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col items-center justify-center bg-primary-light dark:bg-primary/20 p-6 rounded-3xl min-w-[130px] border border-primary/10 dark:border-primary/20">
                  <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mb-1">DÍA</p>
                  <p className="text-5xl font-black text-primary dark:text-blue-400 leading-none">{day}</p>
                </div>
                
                <div className="flex-1 space-y-3 w-full text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{event.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1.5 font-medium italic">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {event.notes}
                  </p>
                  <div className="flex gap-3 pt-2 justify-center md:justify-start flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      <Beer className="w-3.5 h-3.5 text-amber-500" />
                      {event.barrelIds.length} Barriles
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      {event.checklist.filter(c => c.checked).length}/{event.checklist.length} Checklist
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto group"
                >
                  Panel de Control
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Nuevo Evento</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">PLANIFICACIÓN LOGÍSTICA</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOMBRE DEL EVENTO</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Ej: Fiesta de la Cerveza" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">FECHA OPERATIVA</label>
                  <input required type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOTAS / UBICACIÓN</label>
                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} placeholder="Detalles del lugar..." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">VINCULAR BARRILES ({newEvent.barrelIds.length})</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar barril..." 
                      className="bg-slate-100 dark:bg-slate-700 border-none rounded-full py-1.5 pl-9 pr-4 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/30 w-32 md:w-48 transition-all"
                      value={barrelSearchTerm}
                      onChange={(e) => setBarrelSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar border border-slate-50 dark:border-slate-700/50 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
                  {filteredBarrels.length > 0 ? filteredBarrels.map((barrel) => {
                    const isSelected = newEvent.barrelIds.includes(barrel.id);
                    return (
                      <div 
                        key={barrel.id}
                        onClick={() => toggleBarrelSelection(barrel.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-primary/5 dark:bg-primary/10 border-primary/30' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                          <Beer className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{barrel.code}</p>
                          <p className="text-[9px] text-slate-400 truncate uppercase font-bold">{barrel.beerType}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                    );
                  }) : (
                    <div className="col-span-2 py-8 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No se encontraron activos</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-2 text-base active:scale-95 shrink-0 shadow-lg">
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedEvent.name}</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">GESTIÓN LOGÍSTICA</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">FECHA DEL EVENTO</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{selectedEvent.date}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">BARRILES TOTALES</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{selectedEvent.barrelIds.length} Unidades</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 px-1">
                  <CheckSquare className="w-5 h-5 text-primary dark:text-blue-400" />
                  CHECKLIST OPERATIVO
                </h3>
                <div className="grid gap-2">
                  {selectedEvent.checklist.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklistItem(selectedEvent.id, item.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        item.checked ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      <span className={`font-bold text-sm ${item.checked ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-60' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'
                      }`}>
                        {item.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 px-1">
                  <input 
                    type="text" 
                    id="new-item-input-ev"
                    placeholder="Añadir tarea pendiente..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addChecklistItem(selectedEvent.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-item-input-ev') as HTMLInputElement;
                      addChecklistItem(selectedEvent.id, input.value);
                      input.value = '';
                    }}
                    className="bg-primary text-white p-4 rounded-2xl transition-all active:scale-95 shadow-md"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;
