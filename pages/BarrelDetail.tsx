
import React, { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useStorage } from '../services/mockData';
import { Barrel, BarrelStatus, Activity, Comment, Location, BeerType, BreweryEvent, Batch } from '../types';
import StatusBadge from '../components/StatusBadge';
import { BEER_TYPE_COLORS } from '../constants';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  QrCode, 
  Edit3, 
  History as HistoryIcon,
  ChevronRight,
  ChevronLeft,
  Download,
  X,
  CheckCircle2,
  Layers
} from 'lucide-react';

const BarrelDetail: React.FC = () => {
  const [, params] = useRoute('/barrels/:id');
  const [, setLocation] = useLocation();
  const storage = useStorage();
  
  const [barrel, setBarrel] = useState<Barrel | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Navigation State
  const [prevBarrelId, setPrevBarrelId] = useState<string | null>(null);
  const [nextBarrelId, setNextBarrelId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalBarrels, setTotalBarrels] = useState<number>(0);

  // Status Modal State
  const [selectedStatus, setSelectedStatus] = useState<BarrelStatus | "">("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedBeerType, setSelectedBeerType] = useState<BeerType | "">("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  const locations = storage.getLocations();
  const events = storage.getEvents();
  const batches = storage.getBatches();

  useEffect(() => {
    if (params?.id) {
      refreshData();
    }
  }, [params?.id, storage.getBarrels().length]);

  const refreshData = () => {
    const allBarrels = storage.getBarrels();
    const b = allBarrels.find(item => item.id === params?.id);
    
    if (b) {
      setBarrel({ ...b });
      setActivities([...storage.getActivities().filter(a => a.barrelId === b.id)]);
      
      const index = allBarrels.findIndex(item => item.id === b.id);
      setCurrentIndex(index);
      setTotalBarrels(allBarrels.length);
      
      setPrevBarrelId(index > 0 ? allBarrels[index - 1].id : null);
      setNextBarrelId(index < allBarrels.length - 1 ? allBarrels[index + 1].id : null);

      setSelectedLocationId(b.lastLocationId);
      setSelectedBeerType(b.beerType);
      setSelectedStatus(b.status);
    }
  };

  if (!barrel) return <div className="p-8 text-center text-slate-500">Cargando barril...</div>;

  const handleUpdateStatus = async () => {
    // Fixed: Removed 'eventId' from details object as it is not part of updateBarrelStatus expected properties
    const updated = await storage.updateBarrelStatus(barrel.id, (selectedStatus as BarrelStatus) || undefined, {
      locationId: selectedLocationId,
      beerType: selectedBeerType as BeerType || undefined,
      batchId: selectedBatchId || undefined,
      notes: updateNotes
    });

    if (updated) {
      setShowStatusModal(false);
      setUpdateNotes("");
      setSelectedBatchId("");
      refreshData();
    }
  };

  const handleDownloadQR = async () => {
    try {
      const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BARREL_CODE_${barrel.code}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${barrel.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR:', error);
    }
  };

  const currentEvent = events.find(e => e.barrelIds.includes(barrel.id));
  const beerColorClasses = BEER_TYPE_COLORS[barrel.beerType] || 'bg-slate-50 text-slate-800 border-slate-100 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-800';

  // Filtrar lotes disponibles para la variedad seleccionada
  const availableBatches = batches.filter(bat => 
    bat.beerType === (selectedBeerType || barrel.beerType) && 
    bat.status !== 'terminado' &&
    bat.remainingLiters >= barrel.capacity
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/barrels">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Barril {barrel.code}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 text-sm">
              Seguimiento: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{barrel.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-1.5 shadow-sm">
          <button 
            disabled={!prevBarrelId}
            onClick={() => prevBarrelId && setLocation(`/barrels/${prevBarrelId}`)}
            className={`p-3 rounded-full transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
              prevBarrelId 
                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800' 
                : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
          <div className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            {currentIndex + 1} <span className="text-slate-200 dark:text-slate-800 mx-1">/</span> {totalBarrels}
          </div>
          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
          <button 
            disabled={!nextBarrelId}
            onClick={() => nextBarrelId && setLocation(`/barrels/${nextBarrelId}`)}
            className={`p-3 rounded-full transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
              nextBarrelId 
                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800' 
                : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Información General</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Variedad</span>
                  {barrel.status !== BarrelStatus.EN_BODEGA_LIMPIO ? (
                    <span className={`inline-flex items-center gap-1.5 font-bold text-sm px-4 py-1.5 border rounded-xl ${beerColorClasses}`}>
                      {barrel.beerType}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic text-sm font-semibold py-1.5">Barril Vacío / Limpio</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Capacidad</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{barrel.capacity}L</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Ubicación</span>
                  <button 
                    onClick={() => {
                      setSelectedStatus(barrel.status);
                      setSelectedLocationId(barrel.lastLocationId);
                      setShowStatusModal(true);
                    }}
                    className="flex items-center gap-1.5 font-bold text-primary dark:text-blue-400 text-right text-sm hover:underline group px-3 py-1 border border-primary/5 dark:border-primary/10 rounded-lg"
                  >
                    {barrel.status === BarrelStatus.EN_EVENTO ? <Calendar className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <span>{barrel.status === BarrelStatus.EN_EVENTO ? (currentEvent?.name || "En Evento") : barrel.lastLocationName}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Estado Actual</h3>
                <div className="mb-4">
                  <StatusBadge status={barrel.status} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  Última Act: {new Date(barrel.lastUpdate).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedStatus(barrel.status);
                  setSelectedBeerType(barrel.beerType);
                  setSelectedLocationId(barrel.lastLocationId);
                  setShowStatusModal(true);
                }}
                className="w-full mt-8 bg-primary text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all text-sm active:scale-95 shadow-lg"
              >
                Actualizar Estado
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-primary" />
              Historial Operativo
            </h2>
            <div className="relative space-y-12 after:content-[''] after:absolute after:top-0 after:left-[19px] after:h-full after:w-px after:bg-slate-100 dark:after:bg-slate-700">
              {activities.length > 0 ? activities.map((act) => (
                <div key={act.id} className="relative flex gap-6 group">
                  <div className="z-10 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center text-primary group-first:bg-primary group-first:text-white transition-all shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={act.newStatus} showIcon={false} />
                      {act.batchId && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-widest">
                          LOTE {act.batchId.slice(-4)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mb-3">
                      <span className="text-primary dark:text-blue-400 font-bold">{act.userName}</span> • {new Date(act.createdAt).toLocaleString()}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-slate-800">
                      <p className="leading-relaxed font-medium">
                        {act.newStatus === BarrelStatus.LLENADO ? `Llenado con ${act.beerType} desde fermentador.` : 
                         act.notes || "Actualización de registro."}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 dark:text-slate-500 text-center py-4 italic text-sm">No hay registros.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="mb-6 flex items-center justify-center gap-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-widest">
              <QrCode className="w-5 h-5 text-primary" />
              QR Identificador
            </div>
            <div className="bg-white dark:bg-slate-100 border border-slate-100 dark:border-white p-8 rounded-[3rem] mx-auto w-fit mb-8 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BARREL_CODE_${barrel.code}`} 
                alt="QR Code"
                className="w-40 h-40 opacity-90"
              />
            </div>
            <button 
              onClick={handleDownloadQR}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-4 rounded-3xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 text-xs uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              Descargar QR
            </button>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0 relative">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestionar Barril</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">ACTIVO: {barrel.code}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500" />
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar shrink-0">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ESTADO OPERATIVO</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-3.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer text-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BarrelStatus)}
                >
                  {Object.values(BarrelStatus).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {selectedStatus === BarrelStatus.LLENADO && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                   <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">VARIEDAD A LLENAR</label>
                    <select 
                      className="w-full bg-blue-50/50 dark:bg-blue-900/20 border-none rounded-2xl p-3.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer text-sm"
                      value={selectedBeerType}
                      onChange={(e) => {
                        setSelectedBeerType(e.target.value as BeerType);
                        setSelectedBatchId("");
                      }}
                    >
                      {Object.values(BeerType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      SELECCIONAR LOTE / FERMENTADOR
                    </label>
                    <select 
                      required
                      className="w-full bg-amber-50/50 dark:bg-amber-900/20 border-none rounded-2xl p-3.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer text-sm"
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                    >
                      <option value="">-- Elige un lote activo --</option>
                      {availableBatches.map(bat => (
                        <option key={bat.id} value={bat.id}>
                          {bat.fermenterName} - {bat.remainingLiters}L rest.
                        </option>
                      ))}
                    </select>
                    {availableBatches.length === 0 && selectedBeerType && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">
                        No hay lotes de {selectedBeerType} con litros suficientes.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedStatus !== BarrelStatus.LLENADO && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">UBICACIÓN ACTUAL / DESTINO</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-3.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer text-sm"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOTAS ADICIONALES</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-3.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-20 text-sm"
                  placeholder="Justificación del movimiento o cambio..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-1 shrink-0">
                <button 
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateStatus}
                  disabled={selectedStatus === BarrelStatus.LLENADO && !selectedBatchId}
                  className="flex-1 py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarrelDetail;
