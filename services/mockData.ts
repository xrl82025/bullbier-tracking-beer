
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Barrel, BarrelStatus, BeerType, Location, Activity, Recipe, BreweryEvent, Notification, Batch } from '../types';

class DatabaseStorage {
  private listeners: (() => void)[] = [];
  private barrelsCache: Barrel[] = [];
  private locationsCache: Location[] = [];
  private activitiesCache: Activity[] = [];
  private notificationsCache: Notification[] = [];
  private recipesCache: Recipe[] = [];
  private eventsCache: BreweryEvent[] = [];
  private batchesCache: Batch[] = [];

  constructor() {
    this.loadFromLocalStorage();
    if (supabase) {
      this.setupRealtime();
    }
  }

  private loadFromLocalStorage() {
    const load = (key: string, def: any) => {
      try {
        const data = localStorage.getItem(`bb_${key}`);
        return data ? JSON.parse(data) : def;
      } catch {
        return def;
      }
    };

    this.barrelsCache = load('barrels', []);
    this.locationsCache = load('locations', [
      { id: 'loc-1', name: 'Bodega Principal', address: 'Calle Falsa 123', lat: '-34.6', lng: '-58.4' }
    ]);
    this.activitiesCache = load('activities', []);
    this.notificationsCache = load('notifications', []);
    this.recipesCache = load('recipes', [
      { id: 'r1', name: 'Golden Ale', description: 'Refrescante y ligera', ingredients: [{name: 'Malta Base', quantity: '5', unit: 'kg'}] }
    ]);
    this.eventsCache = load('events', []);
    this.batchesCache = load('batches', []);
  }

  private saveToLocalStorage() {
    const save = (key: string, data: any) => localStorage.setItem(`bb_${key}`, JSON.stringify(data));
    save('barrels', this.barrelsCache);
    save('locations', this.locationsCache);
    save('activities', this.activitiesCache);
    save('notifications', this.notificationsCache);
    save('recipes', this.recipesCache);
    save('events', this.eventsCache);
    save('batches', this.batchesCache);
  }

  private getCurrentUserName(): string {
    const sessionStr = localStorage.getItem('bt_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        return session.name || 'Sistema';
      } catch (e) {
        return 'Sistema';
      }
    }
    return 'Sistema';
  }

  private setupRealtime() {
    if (!supabase) return;
    try {
      supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          this.refreshAll();
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime subscription failed", e);
    }
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async refreshAll() {
    if (!supabase) {
      this.notify();
      return;
    }

    try {
      const [b, l, a, n, r, e, bat] = await Promise.all([
        supabase.from('barrels').select('*').order('created_at', { ascending: false }),
        supabase.from('locations').select('*').order('name'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('recipes').select('*').order('name'),
        supabase.from('events').select('*').order('date', { ascending: false }),
        supabase.from('batches').select('*').order('created_at', { ascending: false })
      ]);

      if (b.data) this.barrelsCache = b.data.map((item: any) => ({
        id: item.id, code: item.code, capacity: item.capacity, beerType: item.beer_type,
        status: item.status, lastLocationId: item.last_location_id,
        lastLocationName: item.last_location_name, lastUpdate: item.last_update, createdAt: item.created_at
      }));

      if (l.data) this.locationsCache = l.data;

      if (a.data) this.activitiesCache = a.data.map((item: any) => ({
        id: item.id, barrelId: item.barrel_id, barrelCode: item.barrel_code,
        userName: item.user_name, previousStatus: item.previous_status, newStatus: item.new_status,
        locationId: item.location_id, locationName: item.location_name, beerType: item.beer_type,
        batchId: item.batch_id, notes: item.notes, createdAt: item.created_at
      }));

      if (n.data) this.notificationsCache = n.data.map((item: any) => ({
        id: item.id, title: item.title, message: item.message, type: item.type, createdAt: item.created_at, read: item.read
      }));

      if (r.data) this.recipesCache = r.data;
      if (e.data) this.eventsCache = e.data;
      if (bat.data) this.batchesCache = bat.data.map((item: any) => ({
        id: item.id, fermenterName: item.fermenter_name, beerType: item.beer_type,
        totalLiters: item.total_liters, remainingLiters: item.remaining_liters,
        fillingDate: item.filling_date, status: item.status, createdAt: item.created_at
      }));
      
      this.saveToLocalStorage();
      this.notify();
    } catch (error) {
      console.error("Error refreshing data:", error);
      // Fallback a los datos locales ya cargados en el constructor
      this.notify();
    }
  }

  getBarrels() { return this.barrelsCache; }
  getBarrel(id: string) { return this.barrelsCache.find(b => b.id === id); }
  getLocations() { 
    return this.locationsCache.map(loc => ({
      ...loc,
      barrelCount: this.barrelsCache.filter(b => b.lastLocationId === loc.id).length
    }));
  }
  getActivities() { return this.activitiesCache; }
  getRecipes() { return this.recipesCache; }
  getEvents() { return this.eventsCache; }
  getNotifications() { return this.notificationsCache; }
  getBatches() { return this.batchesCache; }

  // --- WRITE OPERATIONS ---

  async addBatch(batch: Partial<Batch>) {
    const newBatch = {
      id: Math.random().toString(36).substr(2, 9),
      fermenterName: batch.fermenterName!,
      beerType: batch.beerType!,
      totalLiters: batch.totalLiters!,
      remainingLiters: batch.totalLiters!,
      fillingDate: batch.fillingDate!,
      status: 'fermentando' as const,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('batches').insert([{
        fermenter_name: batch.fermenterName,
        beer_type: batch.beerType,
        total_liters: batch.totalLiters,
        remaining_liters: batch.totalLiters,
        filling_date: batch.fillingDate,
        status: 'fermentando'
      }]);
    } else {
      this.batchesCache.unshift(newBatch);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async markNotificationAsRead(id: string) {
    if (supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } else {
      const n = this.notificationsCache.find(not => not.id === id);
      if (n) n.read = true;
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async clearNotifications() {
    if (supabase) {
      await supabase.from('notifications').delete().neq('id', '0');
    } else {
      this.notificationsCache = [];
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async addBarrel(barrelData: Partial<Barrel>) {
    const newBarrel = {
      id: Math.random().toString(36).substr(2, 9),
      code: barrelData.code!,
      capacity: barrelData.capacity || 50,
      beerType: barrelData.beerType!,
      status: barrelData.status || BarrelStatus.EN_BODEGA_LIMPIO,
      lastLocationId: barrelData.lastLocationId!,
      lastLocationName: barrelData.lastLocationName!,
      lastUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('barrels').insert([{
        code: barrelData.code,
        capacity: barrelData.capacity || 50,
        beer_type: barrelData.beerType,
        status: barrelData.status || BarrelStatus.EN_BODEGA_LIMPIO,
        last_location_id: barrelData.lastLocationId,
        last_location_name: barrelData.lastLocationName
      }]);
    } else {
      this.barrelsCache.unshift(newBarrel);
      this.activitiesCache.unshift({
        id: Math.random().toString(36).substr(2, 9),
        barrelId: newBarrel.id,
        barrelCode: newBarrel.code,
        userId: 'system',
        userName: this.getCurrentUserName(),
        previousStatus: null,
        newStatus: newBarrel.status,
        locationId: newBarrel.lastLocationId,
        locationName: newBarrel.lastLocationName,
        beerType: newBarrel.beerType,
        createdAt: new Date().toISOString()
      });
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async addLocation(name: string, address: string) {
    if (supabase) {
      await supabase.from('locations').insert([{ name, address, lat: '-34.6', lng: '-58.4' }]);
    } else {
      this.locationsCache.push({ id: Math.random().toString(36).substr(2, 9), name, address, lat: '-34.6', lng: '-58.4' });
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    if (supabase) {
      await supabase.from('locations').update(updates).eq('id', id);
    } else {
      const idx = this.locationsCache.findIndex(l => l.id === id);
      if (idx !== -1) this.locationsCache[idx] = { ...this.locationsCache[idx], ...updates };
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async deleteLocation(id: string) {
    const hasBarrels = this.barrelsCache.some(b => b.lastLocationId === id);
    if (hasBarrels) return { success: false, error: 'Ubicación con barriles.' };

    if (supabase) {
      await supabase.from('locations').delete().eq('id', id);
    } else {
      this.locationsCache = this.locationsCache.filter(l => l.id !== id);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
    return { success: true };
  }

  async updateBarrelStatus(barrelId: string, newStatus: BarrelStatus | undefined, details: { locationId?: string, beerType?: BeerType, batchId?: string, notes?: string }): Promise<Barrel | null> {
    const barrel = this.barrelsCache.find(b => b.id === barrelId);
    if (!barrel) return null;

    const previousStatus = barrel.status;
    const finalStatus = newStatus || previousStatus;

    if (supabase) {
      if (finalStatus === BarrelStatus.LLENADO && details.batchId) {
        const batch = this.batchesCache.find(bat => bat.id === details.batchId);
        if (batch) {
          const newRemaining = Math.max(0, batch.remainingLiters - barrel.capacity);
          await supabase.from('batches').update({ remaining_liters: newRemaining, status: newRemaining <= 0 ? 'terminado' : batch.status }).eq('id', batch.id);
        }
      }

      const updateData: any = {
        status: finalStatus,
        last_update: new Date().toISOString()
      };
      if (details.beerType) updateData.beer_type = details.beerType;
      if (details.locationId) {
        const loc = this.locationsCache.find(l => l.id === details.locationId);
        if (loc) {
          updateData.last_location_id = loc.id;
          updateData.last_location_name = loc.name;
        }
      }

      await supabase.from('barrels').update(updateData).eq('id', barrelId);
      await supabase.from('activities').insert([{
        barrel_id: barrelId,
        barrel_code: barrel.code,
        user_name: this.getCurrentUserName(),
        previous_status: previousStatus,
        new_status: finalStatus,
        location_id: updateData.last_location_id || barrel.lastLocationId,
        location_name: updateData.last_location_name || barrel.lastLocationName,
        beer_type: details.beerType || barrel.beerType,
        batch_id: details.batchId,
        notes: details.notes
      }]);
    } else {
      // Local logic
      const bIdx = this.barrelsCache.findIndex(b => b.id === barrelId);
      if (bIdx !== -1) {
        const b = this.barrelsCache[bIdx];
        if (finalStatus === BarrelStatus.LLENADO && details.batchId) {
          const batIdx = this.batchesCache.findIndex(bat => bat.id === details.batchId);
          if (batIdx !== -1) {
            this.batchesCache[batIdx].remainingLiters -= b.capacity;
            if (this.batchesCache[batIdx].remainingLiters <= 0) this.batchesCache[batIdx].status = 'terminado';
          }
        }
        
        const loc = this.locationsCache.find(l => l.id === details.locationId);
        this.barrelsCache[bIdx] = {
          ...b,
          status: finalStatus,
          beerType: details.beerType || b.beerType,
          lastLocationId: details.locationId || b.lastLocationId,
          lastLocationName: loc ? loc.name : b.lastLocationName,
          lastUpdate: new Date().toISOString()
        };

        this.activitiesCache.unshift({
          id: Math.random().toString(36).substr(2, 9),
          barrelId,
          barrelCode: b.code,
          userId: 'system',
          userName: this.getCurrentUserName(),
          previousStatus,
          newStatus: finalStatus,
          locationId: details.locationId || b.lastLocationId,
          locationName: loc ? loc.name : b.lastLocationName,
          beerType: details.beerType || b.beerType,
          batchId: details.batchId,
          notes: details.notes,
          createdAt: new Date().toISOString()
        });
        this.saveToLocalStorage();
      }
    }
    
    await this.refreshAll();
    return this.getBarrel(barrelId) || null;
  }

  async addRecipe(recipe: Partial<Recipe>) {
    if (supabase) {
      await supabase.from('recipes').insert([{ name: recipe.name, description: recipe.description, ingredients: recipe.ingredients }]);
    } else {
      this.recipesCache.push({ id: Math.random().toString(36).substr(2, 9), name: recipe.name!, description: recipe.description!, ingredients: recipe.ingredients || [] });
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async addEvent(eventData: Partial<BreweryEvent>) {
    if (supabase) {
      await supabase.from('events').insert([eventData]);
    } else {
      this.eventsCache.push({ ...eventData, id: Math.random().toString(36).substr(2, 9) } as any);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async updateEvent(id: string, updates: Partial<BreweryEvent>) {
    if (supabase) {
      await supabase.from('events').update(updates).eq('id', id);
    } else {
      const idx = this.eventsCache.findIndex(e => e.id === id);
      if (idx !== -1) this.eventsCache[idx] = { ...this.eventsCache[idx], ...updates };
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }
}

export const storage = new DatabaseStorage();

export const useStorage = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return storage.subscribe(() => setTick(t => t + 1));
  }, []);
  return storage;
};

setTimeout(() => storage.refreshAll(), 0);
