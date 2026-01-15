
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
            const day = event.date ? event.date.split('-')[2] : '--';
            return (
              <div key={event.id} className="gemini-card p-8 rounded-4xl flex flex-col md:flex-row gap-8 items-center transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col items-center justify-center bg-primary-light dark:bg-primary/20 p-6 rounded-3xl min-w-[130px] border border-primary/10">
                  <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mb-1">DÍA</p>
                  <p className="text-5xl font-black text-primary dark:text-blue-400 leading-none">{day}</p>
                </div>
                
                <div className="flex-1 space-y-3 w-full text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{event.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1.5 font-medium italic">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {event.notes}
                  </p>
                  <div className="flex gap-3 pt-2 justify-center md:justify-start flex-wrap">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Beer className="w-3.5 h-3.5 text-amber-500" />
                      {event.barrelIds.length} Barriles
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto group"
                >
                  Panel Control
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Nuevo Evento</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">PLANIFICACIÓN</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOMBRE</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 shadow-sm" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Ej: Fiesta de la Cerveza" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">FECHA</label>
                  <input required type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOTAS</label>
                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none transition-all placeholder:text-slate-300 shadow-sm" value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} placeholder="Detalles del lugar..." />
              </div>

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-2 text-base shadow-lg shadow-primary/20">
                Guardar Evento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedEvent.name}</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">LOGÍSTICA</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  CHECKLIST
                </h3>
                <div className="grid gap-2">
                  {selectedEvent.checklist.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklistItem(selectedEvent.id, item.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        item.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-100 shadow-sm'
                      }`}
                    >
                      <span className={`font-bold text-sm ${item.checked ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                        {item.name}
                      </span>
                      <CheckCircle2 className={`w-5 h-5 ${item.checked ? 'text-emerald-500' : 'text-slate-200'}`} />
                    </div>
                  ))}
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
