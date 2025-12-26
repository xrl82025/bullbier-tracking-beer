
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { QrCode, Camera, AlertCircle, Search, Keyboard, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { storage } from '../services/mockData';

const ScanQR: React.FC = () => {
  const [, setPath] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const SCANNER_ID = "qr-reader";

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setIsScanning(true);
    setScanSuccess(false);

    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Failure is common while searching for QR, we don't show error here
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    // Expected formats: "BARREL_ID_b-1" or just "b-1"
    let barrelId = decodedText;
    if (decodedText.includes('BARREL_ID_')) {
      barrelId = decodedText.split('BARREL_ID_')[1];
    } else if (decodedText.includes('BARREL_CODE_')) {
      // If it's a code, we'd need to lookup by code. 
      // For this mock, we'll try to find it in our storage
      const barrels = storage.getBarrels();
      const code = decodedText.split('BARREL_CODE_')[1];
      const found = barrels.find(b => b.code === code);
      if (found) barrelId = found.id;
    }

    // Verify barrel exists
    const barrel = storage.getBarrel(barrelId);
    
    if (barrel) {
      setScanSuccess(true);
      // Play a success sound if desired or just vibrate
      if (navigator.vibrate) navigator.vibrate(100);
      
      stopScanner();
      
      // Delay navigation slightly for feedback
      setTimeout(() => {
        setPath(`/barrels/${barrelId}`);
      }, 800);
    } else {
      setError(`Código no reconocido: "${decodedText}". El activo no existe en el sistema.`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const barrels = storage.getBarrels();
    const found = barrels.find(b => 
      b.code.toLowerCase() === manualCode.toLowerCase() || 
      b.id === manualCode
    );

    if (found) {
      setPath(`/barrels/${found.id}`);
    } else {
      setError(`No se encontró ningún barril con el código o ID: ${manualCode}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-3xl mb-2">
          <QrCode className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-secondary dark:text-white tracking-tight">Escanear Barril</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Procesamiento de activos en tiempo real</p>
      </div>

      {/* Scanner UI */}
      <div className="relative group">
        <div className={`relative aspect-square max-w-sm mx-auto bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-8 ${scanSuccess ? 'border-emerald-500' : 'border-slate-800 dark:border-slate-700'} transition-colors duration-500 flex flex-col items-center justify-center`}>
          
          {/* Scanning Interface */}
          <div id={SCANNER_ID} className="w-full h-full absolute inset-0"></div>

          {/* Mask UI (visible when not scanning or overlay) */}
          {!isScanning && !scanSuccess && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 text-center p-8 space-y-6">
              <Camera className="w-16 h-16 text-white/20" />
              <button 
                onClick={startScanner}
                className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center gap-2 active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                Iniciar Cámara
              </button>
            </div>
          )}

          {scanSuccess && (
            <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-24 h-24 text-white mb-4" />
              <p className="text-white font-black text-xl tracking-tight">¡BARRIL IDENTIFICADO!</p>
            </div>
          )}

          {isScanning && !scanSuccess && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]" />
              
              {/* Corner Brackets */}
              <div className="absolute top-12 left-12 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-12 right-12 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-12 left-12 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-12 right-12 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              
              {/* Scanning Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/50 shadow-[0_0_20px_#2A8BDE] scan-line" />
              
              <button 
                onClick={stopScanner}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white pointer-events-auto transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <p className="text-center mt-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
            Buscando código QR...
          </p>
        )}
      </div>

      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#f8fafc] dark:bg-slate-950 text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">o ingresa manualmente</span>
          </div>
        </div>

        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Código del Barril (ej: BRL-001)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-secondary dark:text-white focus:border-primary transition-all outline-none shadow-sm dark:placeholder:text-slate-600"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            type="submit"
            className="bg-secondary dark:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/20 p-6 rounded-3xl flex items-start gap-4 text-rose-600 dark:text-rose-400 animate-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-sm uppercase tracking-wider mb-1">Error de Escaneo</p>
            <p className="font-medium text-sm leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-2xl">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">Recomendaciones:</h4>
          <ul className="text-xs text-slate-500 dark:text-slate-400 font-medium space-y-1 mt-1 list-disc list-inside">
            <li>Limpia la lente de tu cámara para mejor enfoque.</li>
            <li>Asegúrate de tener buena iluminación sobre el código.</li>
            <li>Mantén el barril a unos 15-20cm de distancia.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
