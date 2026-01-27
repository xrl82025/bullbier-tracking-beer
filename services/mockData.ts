
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Barrel, BarrelStatus, BeerType, Location, Activity, Recipe, BreweryEvent, Notification, Batch } from '../types';

// Proyecciones para reducir el payload de red (Optimización de Egress)
const BARREL_COLUMNS = 'id, code, capacity, beer_type, status, last_location_id, last_location_name, last_update, created_at';
const ACTIVITY_COLUMNS = 'id, barrel_id, barrel_code, user_name, previous_status, new_status, location_id, location_name, beer_type, batch_id, event_name, notes, created_at';
const BATCH_COLUMNS = 'id, fermenter_name, beer_type, total_liters, remaining_liters, filling_date, status, created_at';
const NOTIFICATION_COLUMNS = 'id, title, message, type, read, created_at';
const LOCATION_COLUMNS = 'id, name, address, lat, lng';
const RECIPE_COLUMNS = 'id, name, description'; 

class DatabaseStorage {
  private listeners: (() => void)[] = [];
  private barrelsCache: Barrel[] = [];
  private locationsCache: Location[] = [];
  private activitiesCache: Activity[] = [];
  private notificationsCache: Notification[] = [];
  private recipesCache: Recipe[] = [];
  private eventsCache: BreweryEvent[] = [];
  private batchesCache: Batch[] = [];
  
  private lastStaticFetch: number = 0;
  private STATIC_CACHE_TTL = 1000 * 60 * 5; // 5 minutos

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
      } catch { return def; }
    };

    this.barrelsCache = load('barrels', []);
    this.locationsCache = load('locations', []);
    this.activitiesCache = load('activities', []);
    this.notificationsCache = load('notifications', []);
    this.recipesCache = load('recipes', []);
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
      } catch { return 'Sistema'; }
    }
    return 'Sistema';
  }

  private setupRealtime() {
    if (!supabase) return;
    try {
      supabase
        .channel('critical-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'barrels' }, () => this.refreshCritical())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => this.refreshCritical())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, () => this.refreshCritical())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => this.refreshCritical())
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

  async refreshCritical() {
    if (!supabase) return;
    try {
      const [b, a, n, bat] = await Promise.all([
        supabase.from('barrels').select(BARREL_COLUMNS).order('created_at', { ascending: false }),
        supabase.from('activities').select(ACTIVITY_COLUMNS).order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications').select(NOTIFICATION_COLUMNS).order('created_at', { ascending: false }).limit(10),
        supabase.from('batches').select(BATCH_COLUMNS).order('created_at', { ascending: false })
      ]);

      if (b.data) this.barrelsCache = b.data.map((item: any) => ({
        id: item.id, code: item.code, capacity: item.capacity, beerType: item.beer_type,
        status: item.status, lastLocationId: item.last_location_id,
        lastLocationName: item.last_location_name, lastUpdate: item.last_update, createdAt: item.created_at
      }));

      if (a.data) this.activitiesCache = a.data.map((item: any) => ({
        id: item.id, barrelId: item.barrel_id, barrelCode: item.barrel_code,
        userName: item.user_name, previousStatus: item.previous_status, newStatus: item.new_status,
        locationId: item.location_id, locationName: item.location_name, beerType: item.beer_type,
        batchId: item.batch_id, eventName: item.event_name, notes: item.notes, createdAt: item.created_at
      }));

      if (n.data) this.notificationsCache = n.data;
      if (bat.data) this.batchesCache = bat.data.map((item: any) => ({
        id: item.id, fermenterName: item.fermenter_name, beerType: item.beer_type,
        totalLiters: item.total_liters, remainingLiters: item.remaining_liters,
        fillingDate: item.filling_date, status: item.status, createdAt: item.created_at
      }));

      this.saveToLocalStorage();
      this.notify();
    } catch (error) {
      console.error("Error refreshing critical data:", error);
    }
  }

  async refreshAll() {
    if (!supabase) {
      this.notify();
      return;
    }
    const now = Date.now();
    const shouldFetchStatic = (now - this.lastStaticFetch) > this.STATIC_CACHE_TTL;
    try {
      await this.refreshCritical();
      if (shouldFetchStatic) {
        const [l, r, e] = await Promise.all([
          supabase.from('locations').select(LOCATION_COLUMNS).order('name'),
          supabase.from('recipes').select(RECIPE_COLUMNS).order('name'),
          supabase.from('events').select('id, name, date, notes, barrel_ids, checklist').order('date', { ascending: false })
        ]);

        if (l.data) this.locationsCache = l.data;
        if (r.data) this.recipesCache = r.data;
        if (e.data) this.eventsCache = e.data.map((ev: any) => ({
          id: ev.id, name: ev.name, date: ev.date, notes: ev.notes,
          barrelIds: ev.barrel_ids || [], checklist: ev.checklist || []
        }));
        
        this.lastStaticFetch = now;
        this.saveToLocalStorage();
        this.notify();
      }
    } catch (error) {
      console.error("Error refreshing all data:", error);
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

  // --- MÉTODOS DE ESCRITURA (CREATE / UPDATE / DELETE) ---

  async addBatch(batch: Partial<Batch>) {
    if (supabase) {
      await supabase.from('batches').insert([{
        fermenter_name: batch.fermenterName,
        beer_type: batch.beerType,
        total_liters: batch.totalLiters,
        remaining_liters: batch.totalLiters,
        filling_date: batch.fillingDate,
        status: 'fermentando'
      }]).select('id');
    } else {
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
      this.batchesCache.unshift(newBatch);
      this.saveToLocalStorage();
    }
    await this.refreshCritical();
  }

  async addBarrel(barrel: Partial<Barrel>) {
    if (supabase) {
      await supabase.from('barrels').insert([{
        code: barrel.code,
        capacity: barrel.capacity,
        beer_type: barrel.beerType,
        status: BarrelStatus.EN_BODEGA_LIMPIO,
        last_location_id: barrel.lastLocationId,
        last_location_name: barrel.lastLocationName,
        last_update: new Date().toISOString()
      }]).select('id');
    } else {
      const newBarrel: Barrel = {
        id: Math.random().toString(36).substr(2, 9),
        code: barrel.code!,
        capacity: barrel.capacity!,
        beerType: barrel.beerType!,
        status: BarrelStatus.EN_BODEGA_LIMPIO,
        lastLocationId: barrel.lastLocationId!,
        lastLocationName: barrel.lastLocationName!,
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.barrelsCache.unshift(newBarrel);
      this.saveToLocalStorage();
    }
    await this.refreshCritical();
  }

  async deleteBarrel(id: string): Promise<boolean> {
    try {
      if (supabase) {
        await supabase.from('barrels').delete().eq('id', id);
      } else {
        this.barrelsCache = this.barrelsCache.filter(b => b.id !== id);
        this.activitiesCache = this.activitiesCache.filter(a => a.barrelId !== id);
        this.saveToLocalStorage();
      }
      await this.refreshCritical();
      return true;
    } catch (e) {
      console.error("Error deleting barrel:", e);
      return false;
    }
  }

  async updateBarrelStatus(barrelId: string, newStatus: BarrelStatus | undefined, details: { locationId?: string, beerType?: BeerType, batchId?: string, eventName?: string, notes?: string }): Promise<Barrel | null> {
    const barrel = this.barrelsCache.find(b => b.id === barrelId);
    if (!barrel) return null;

    const previousStatus = barrel.status;
    const finalStatus = newStatus || previousStatus;

    if (supabase) {
      // Si es llenado, descontar litros del lote
      if (finalStatus === BarrelStatus.LLENADO && details.batchId) {
        const batch = this.batchesCache.find(bat => bat.id === details.batchId);
        if (batch) {
          const newRemaining = Math.max(0, batch.remainingLiters - barrel.capacity);
          await supabase.from('batches').update({ 
            remaining_liters: newRemaining, 
            status: newRemaining <= 0 ? 'terminado' : batch.status 
          }).eq('id', batch.id);
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

      await supabase.from('barrels').update(updateData).eq('id', barrelId).select('id');
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
        event_name: details.eventName,
        notes: details.notes
      }]).select('id');
    } else {
      // Lógica Offline
      if (finalStatus === BarrelStatus.LLENADO && details.batchId) {
        const batch = this.batchesCache.find(bat => bat.id === details.batchId);
        if (batch) batch.remainingLiters = Math.max(0, batch.remainingLiters - barrel.capacity);
      }
      
      const loc = this.locationsCache.find(l => l.id === details.locationId);
      const updatedBarrel = {
        ...barrel,
        status: finalStatus,
        beerType: details.beerType || barrel.beerType,
        lastLocationId: details.locationId || barrel.lastLocationId,
        lastLocationName: loc ? loc.name : barrel.lastLocationName,
        lastUpdate: new Date().toISOString()
      };
      
      this.barrelsCache = this.barrelsCache.map(b => b.id === barrelId ? updatedBarrel : b);
      this.activitiesCache.unshift({
        id: Math.random().toString(36).substr(2, 9),
        barrelId,
        barrelCode: barrel.code,
        userId: 'local-user',
        userName: this.getCurrentUserName(),
        previousStatus,
        newStatus: finalStatus,
        locationId: updatedBarrel.lastLocationId,
        locationName: updatedBarrel.lastLocationName,
        beerType: updatedBarrel.beerType,
        batchId: details.batchId,
        eventName: details.eventName,
        notes: details.notes,
        createdAt: new Date().toISOString()
      });
      this.saveToLocalStorage();
    }
    
    await this.refreshCritical();
    return this.getBarrel(barrelId) || null;
  }

  async addLocation(name: string, address: string) {
    if (supabase) {
      await supabase.from('locations').insert([{ name, address, lat: "-34.6", lng: "-58.4" }]).select('id');
    } else {
      this.locationsCache.push({ id: Math.random().toString(36).substr(2, 9), name, address, lat: "-34.6", lng: "-58.4" });
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    if (supabase) {
      await supabase.from('locations').update(updates).eq('id', id).select('id');
    } else {
      const idx = this.locationsCache.findIndex(l => l.id === id);
      if (idx !== -1) {
        this.locationsCache[idx] = { ...this.locationsCache[idx], ...updates };
        this.saveToLocalStorage();
      }
    }
    await this.refreshAll();
  }

  async deleteLocation(id: string): Promise<{ success: boolean; error?: string }> {
    const hasBarrels = this.barrelsCache.some(b => b.lastLocationId === id);
    if (hasBarrels) return { success: false, error: "Ubicación con barriles activos." };

    if (supabase) {
      await supabase.from('locations').delete().eq('id', id);
    } else {
      this.locationsCache = this.locationsCache.filter(l => l.id !== id);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
    return { success: true };
  }

  async addRecipe(recipe: Partial<Recipe>) {
    if (supabase) {
      await supabase.from('recipes').insert([{
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps
      }]).select('id');
    } else {
      this.recipesCache.push({ id: Math.random().toString(36).substr(2, 9), ...recipe } as Recipe);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async addEvent(event: Partial<BreweryEvent>) {
    if (supabase) {
      await supabase.from('events').insert([{
        name: event.name,
        date: event.date,
        notes: event.notes,
        barrel_ids: event.barrelIds,
        checklist: event.checklist
      }]).select('id');
    } else {
      this.eventsCache.push({ id: Math.random().toString(36).substr(2, 9), ...event } as BreweryEvent);
      this.saveToLocalStorage();
    }
    await this.refreshAll();
  }

  async updateEvent(id: string, updates: Partial<BreweryEvent>) {
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.barrelIds) dbUpdates.barrel_ids = updates.barrelIds;
      if (updates.checklist) dbUpdates.checklist = updates.checklist;
      await supabase.from('events').update(dbUpdates).eq('id', id).select('id');
    } else {
      const idx = this.eventsCache.findIndex(e => e.id === id);
      if (idx !== -1) {
        this.eventsCache[idx] = { ...this.eventsCache[idx], ...updates };
        this.saveToLocalStorage();
      }
    }
    await this.refreshAll();
  }

  async markNotificationAsRead(id: string) {
    if (supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id).select('id');
    } else {
      const n = this.notificationsCache.find(not => not.id === id);
      if (n) n.read = true;
      this.saveToLocalStorage();
    }
    await this.refreshCritical();
  }

  async clearNotifications() {
    if (supabase) {
      await supabase.from('notifications').delete().neq('id', '0');
    } else {
      this.notificationsCache = [];
      this.saveToLocalStorage();
    }
    await this.refreshCritical();
  }

  async getFullRecipe(id: string): Promise<Recipe | null> {
    if (!supabase) return this.recipesCache.find(r => r.id === id) || null;
    const { data } = await supabase.from('recipes').select('*').eq('id', id).single();
    return data;
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
