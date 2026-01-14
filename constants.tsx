
import React from 'react';
import { 
  Beer, 
  MapPin, 
  History, 
  LayoutDashboard, 
  Settings, 
  QrCode, 
  BarChart3, 
  BookOpen, 
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  Trash2,
  Archive,
  Sparkles,
  Layers
} from 'lucide-react';
import { BarrelStatus, BeerType } from './types';

export const STATUS_COLORS: Record<string, string> = {
  [BarrelStatus.EN_BODEGA_LIMPIO]: 'bg-green-500',
  [BarrelStatus.EN_BODEGA_SUCIO]: 'bg-orange-500',
  [BarrelStatus.LLENADO]: 'bg-blue-500',
  [BarrelStatus.EN_TRANSITO]: 'bg-yellow-500',
  [BarrelStatus.ENTREGADO]: 'bg-green-700',
  [BarrelStatus.EN_EVENTO]: 'bg-purple-500',
  [BarrelStatus.RETIRADO]: 'bg-gray-500',
  [BarrelStatus.EN_DEPOSITO_EXTERNO]: 'bg-amber-700',
};

export const BEER_TYPE_COLORS: Record<string, string> = {
  [BeerType.GOLDEN_ALE]: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  [BeerType.AMBAR_ALE]: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  [BeerType.STOUT]: 'bg-slate-800 text-slate-50 border-slate-900 hover:bg-slate-900',
  [BeerType.CALAFATE]: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  [BeerType.CALAFATE_SYRUP]: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100',
  [BeerType.FRAMBUESA]: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  [BeerType.MAQUI_BERRY]: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  [BeerType.CAFE_MOCCA_MIEL]: 'bg-yellow-900/10 text-yellow-900 border-yellow-900/20 hover:bg-yellow-900/20',
  [BeerType.MANGO]: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
};

export const STATUS_LABELS: Record<string, string> = {
  [BarrelStatus.EN_BODEGA_LIMPIO]: 'Bodega (Limpio)',
  [BarrelStatus.EN_BODEGA_SUCIO]: 'Bodega (Sucio)',
  [BarrelStatus.LLENADO]: 'Llenado',
  [BarrelStatus.EN_TRANSITO]: 'En Tránsito',
  [BarrelStatus.ENTREGADO]: 'Entregado',
  [BarrelStatus.EN_EVENTO]: 'En Evento',
  [BarrelStatus.RETIRADO]: 'Retirado',
  [BarrelStatus.EN_DEPOSITO_EXTERNO]: 'Depósito Externo',
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  [BarrelStatus.EN_BODEGA_LIMPIO]: <CheckCircle2 className="w-4 h-4" />,
  [BarrelStatus.EN_BODEGA_SUCIO]: <AlertCircle className="w-4 h-4" />,
  [BarrelStatus.LLENADO]: <Package className="w-4 h-4" />,
  [BarrelStatus.EN_TRANSITO]: <Truck className="w-4 h-4" />,
  [BarrelStatus.ENTREGADO]: <Beer className="w-4 h-4" />,
  [BarrelStatus.EN_EVENTO]: <Calendar className="w-4 h-4" />,
  [BarrelStatus.RETIRADO]: <Trash2 className="w-4 h-4" />,
  [BarrelStatus.EN_DEPOSITO_EXTERNO]: <Archive className="w-4 h-4" />,
};

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Agente IA', path: '/ai-agent', icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Barriles', path: '/barrels', icon: <Beer className="w-5 h-5" /> },
  { label: 'Lotes', path: '/batches', icon: <Layers className="w-5 h-5" /> },
  { label: 'Escanear QR', path: '/scan', icon: <QrCode className="w-5 h-5" /> },
  { label: 'Ubicaciones', path: '/locations', icon: <MapPin className="w-5 h-5" /> },
  { label: 'Historial', path: '/history', icon: <History className="w-5 h-5" /> },
  { label: 'Métricas', path: '/metrics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Recetas', path: '/recipes', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Eventos', path: '/events', icon: <Calendar className="w-5 h-5" /> },
];
