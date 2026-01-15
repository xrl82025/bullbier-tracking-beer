
import React, { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useStorage } from '../services/mockData';
import { Barrel, BarrelStatus, Activity, Location, BeerType, Batch } from '../types';
import StatusBadge from '../components/StatusBadge';
import { BEER_TYPE_COLORS } from '../constants';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  QrCode, 
  Edit3, 
  History as HistoryIcon,
  ChevronRight,
  ChevronLeft,
  Download,
  X,
  CheckCircle2,
  Layers,
  Database,
  Beer as BeerIcon
} from 'lucide-react';

const BarrelDetail: React.FC = () => {
  const [, params] = useRoute('/barrels/:id');
  const [, setLocation] = useLocation();
  const storage = useStorage();
  
  const [barrel, setBarrel] = useState<Barrel | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [prevBarrelId, setPrevBarrelId] = useState<string | null>(null);
  const [nextBarrelId, setNextBarrelId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalBarrels, setTotalBarrels] = useState<number>(0);

  const [selectedStatus, setSelectedStatus] = useState<BarrelStatus | "">("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedBeerType, setSelectedBeerType] = useState<BeerType | "">("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  const locations = storage.getLocations();
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
    if (selectedStatus === BarrelStatus.LLENADO && !selectedBatchId) {
      alert("Debes seleccionar un lote para asociar al barril.");
      return;
    }

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

  const beerColorClasses = BEER_TYPE_COLORS[barrel.beerType] || 'bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-800';

  const availableBatches = batches.filter(bat => {
    const isStatusOk = bat.status !== 'terminado';
    const hasEnoughVolume = bat.remainingLiters >= barrel.capacity;
    if (!isStatusOk || !hasEnoughVolume) return false;

    const currentType = (selectedBeerType || barrel.beerType) as BeerType;
    const baseTypes = [BeerType.GOLDEN_ALE, BeerType.AMBAR_ALE, BeerType.STOUT];
    const isBaseType = baseTypes.includes(currentType);

    if (isBaseType) {
      return bat.beerType === currentType;
    }
    
    return true;
  });

  return (
    <>
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
                ID: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{barrel.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-1.5 shadow-sm">
            <button 
              disabled={!prevBarrelId}
              onClick={() => prevBarrelId && setLocation(`/barrels/${prevBarrelId}`)}
              className={`p-3 rounded-full transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
                prevBarrelId 
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50' 
                  : 'text-slate-200 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
            <div className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {currentIndex + 1} / {totalBarrels}
            </div>
            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
            <button 
              disabled={!nextBarrelId}
              onClick={() => nextBarrelId && setLocation(`/barrels/${nextBarrelId}`)}
              className={`p-3 rounded-full transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
                nextBarrelId 
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50' 
                  : 'text-slate-200 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Información General</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Variedad</span>
                    <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-4 py-1.5 border rounded-xl ${beerColorClasses}`}>
                      {barrel.status === BarrelStatus.EN_BODEGA_LIMPIO ? 'Limpio / Vacío' : barrel.beerType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Ubicación</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{barrel.lastLocationName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Estado Actual</h3>
                  <div className="mb-4">
                    <StatusBadge status={barrel.status} />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedStatus(barrel.status);
                    setSelectedBeerType(barrel.beerType);
                    setSelectedLocationId(barrel.lastLocationId);
                    setShowStatusModal(true);
                  }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all text-sm shadow-lg shadow-primary/20"
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
              <div className="relative space-y-8 after:content-[''] after:absolute after:top-0 after:left-[19px] after:h-full after:w-px after:bg-slate-100 dark:after:bg-slate-700">
                {activities.map((act) => (
                  <div key={act.id} className="relative flex gap-6">
                    <div className="z-10 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center text-primary shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={act.newStatus} showIcon={false} />
                        {act.batchId && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">LOTE #{act.batchId.slice(-4)}</span>}
                        {act.newStatus === BarrelStatus.LLENADO && act.beerType && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase dark:bg-blue-900/30 dark:text-blue-400">
                            <BeerIcon className="w-3 h-3" />
                            {act.beerType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-2">{new Date(act.createdAt).toLocaleString()} • Por {act.userName}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {act.notes || "Movimiento registrado en sistema."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 text-center">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-inner inline-block mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BARREL_CODE_${barrel.code}`} 
                  alt="QR"
                  className="w-40 h-40 opacity-90"
                />
              </div>
              <button 
                onClick={handleDownloadQR}
                className="w-full py-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Descargar Etiqueta
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4 flex flex-col max-h-[90vh]">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Actualizar Barril</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">CÓDIGO: {barrel.code}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500" />
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NUEVO ESTADO</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                  value={selectedStatus}
                  onChange={(e) => {
                    const status = e.target.value as BarrelStatus;
                    setSelectedStatus(status);
                    if (status !== BarrelStatus.LLENADO) setSelectedBatchId("");
                  }}
                >
                  {Object.values(BarrelStatus).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {selectedStatus === BarrelStatus.LLENADO && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">VARIEDAD</label>
                    <select 
                      className="w-full bg-blue-50/50 dark:bg-blue-900/20 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white shadow-sm"
                      value={selectedBeerType}
                      onChange={(e) => {
                        setSelectedBeerType(e.target.value as BeerType);
                        setSelectedBatchId("");
                      }}
                    >
                      {Object.values(BeerType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      SELECCIONAR LOTE
                    </label>
                    <select 
                      required
                      className="w-full bg-amber-50/50 dark:bg-amber-900/20 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white shadow-sm"
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                    >
                      <option value="">-- Elige un lote activo --</option>
                      {availableBatches.map(bat => (
                        <option key={bat.id} value={bat.id}>
                          {bat.fermenterName} ({bat.beerType}) - {bat.remainingLiters}L libres
                        </option>
                      ))}
                    </select>
                    {availableBatches.length === 0 && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 italic uppercase">No hay lotes activos compatibles con stock.</p>
                    )}
                  </div>
                </div>
              )}

              {selectedStatus !== BarrelStatus.LLENADO && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">UBICACIÓN</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white shadow-sm"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOTAS</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none shadow-sm"
                  placeholder="Observaciones del cambio..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                />
              </div>

              <button 
                onClick={handleUpdateStatus}
                disabled={selectedStatus === BarrelStatus.LLENADO && !selectedBatchId}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarrelDetail;
