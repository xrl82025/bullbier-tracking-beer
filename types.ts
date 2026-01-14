
export enum BarrelStatus {
  EN_BODEGA_LIMPIO = 'en_bodega_limpio',
  EN_BODEGA_SUCIO = 'en_bodega_sucio',
  LLENADO = 'llenado',
  EN_TRANSITO = 'en_transito',
  ENTREGADO = 'entregado',
  EN_EVENTO = 'en_evento',
  RETIRADO = 'retirado',
  EN_DEPOSITO_EXTERNO = 'en_deposito_externo',
}

export enum BeerType {
  GOLDEN_ALE = 'Golden Ale',
  AMBAR_ALE = 'Ambar Ale',
  STOUT = 'Stout',
  CALAFATE = 'Calafate',
  CALAFATE_SYRUP = 'Calafate Syrup',
  FRAMBUESA = 'Frambuesa',
  MAQUI_BERRY = 'Maqui Berry',
  CAFE_MOCCA_MIEL = 'Cafe Mocca-Miel',
  MANGO = 'Mango',
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: string;
  lng: string;
  barrelCount?: number;
}

export interface Batch {
  id: string;
  fermenterName: string;
  beerType: BeerType;
  totalLiters: number;
  remainingLiters: number;
  fillingDate: string;
  status: 'fermentando' | 'madurando' | 'listo' | 'terminado';
  createdAt: string;
}

export interface Activity {
  id: string;
  barrelId: string;
  barrelCode: string;
  userId: string;
  userName: string;
  previousStatus: BarrelStatus | null;
  newStatus: BarrelStatus;
  locationId?: string;
  locationName?: string;
  beerType?: BeerType;
  batchId?: string;
  eventName?: string;
  notes?: string;
  createdAt: string;
}

export interface Barrel {
  id: string;
  code: string;
  capacity: number;
  beerType: BeerType;
  status: BarrelStatus;
  lastLocationId: string;
  lastLocationName: string;
  lastUpdate: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  barrelId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps?: { title: string; description: string }[];
}

export interface BreweryEvent {
  id: string;
  name: string;
  date: string;
  notes: string;
  barrelIds: string[];
  checklist: { id: string; name: string; checked: boolean }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
  read: boolean;
}
