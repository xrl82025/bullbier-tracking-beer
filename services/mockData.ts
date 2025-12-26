
import { supabase } from './supabaseClient';
import { Barrel, BarrelStatus, BeerType, Location, Activity, Recipe, BreweryEvent, Notification } from '../types';

class DatabaseStorage {
  private listeners: (() => void)[] = [];
  private barrelsCache: Barrel[] = [];
  private locationsCache: Location[] = [];
  private activitiesCache: Activity[] = [];
  private notificationsCache: Notification[] = [];
  private recipesCache: Recipe[] = [];
  private eventsCache: BreweryEvent[] = [];

  constructor() {
    if (supabase) {
      this.setupRealtime();
    }
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
    try {
      supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          this.notify();
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
      console.warn("No Supabase client available. Skipping refresh.");
      return;
    }

    try {
      const [b, l, a, n, r, e] = await Promise.all([
        supabase.from('barrels').select('*').order('created_at', { ascending: false }),
        supabase.from('locations').select('*').order('name'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('recipes').select('*').order('name'),
        supabase.from('events').select('*').order('date', { ascending: false })
      ]);

      if (b.data) this.barrelsCache = b.data.map((item: any) => ({
        id: item.id,
        code: item.code,
        capacity: item.capacity,
        beerType: item.beer_type,
        status: item.status,
        lastLocationId: item.last_location_id,
        lastLocationName: item.last_location_name,
        lastUpdate: item.last_update,
        createdAt: item.created_at
      }));

      if (l.data) this.locationsCache = l.data;

      if (a.data) this.activitiesCache = a.data.map((item: any) => ({
        id: item.id,
        barrelId: item.barrel_id,
        barrelCode: item.barrel_code,
        userId: item.user_id,
        userName: item.user_name,
        previousStatus: item.previous_status,
        newStatus: item.new_status,
        locationId: item.location_id,
        locationName: item.location_name,
        beerType: item.beer_type,
        eventName: item.event_name,
        notes: item.notes,
        createdAt: item.created_at
      }));

      if (n.data) this.notificationsCache = n.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        createdAt: item.created_at,
        read: item.read
      }));

      if (r.data) this.recipesCache = r.data;

      if (e.data) this.eventsCache = e.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        date: item.date,
        notes: item.notes,
        barrelIds: item.barrel_ids || [],
        checklist: item.checklist || []
      }));
      
      this.notify();
    } catch (error) {
      console.error("Error refreshing data from Supabase:", error);
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
  getComments(barrelId: string) { return []; }
  getRecipes() { return this.recipesCache; }
  getEvents() { return this.eventsCache; }
  getNotifications() { return this.notificationsCache; }

  // --- WRITE OPERATIONS ---

  async addNotification(notification: Partial<Notification>) {
    if (!supabase) return;
    await supabase.from('notifications').insert([{
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false
    }]);
    this.refreshAll();
  }

  async markNotificationAsRead(id: string) {
    if (!supabase) return;
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    this.refreshAll();
  }

  async clearNotifications() {
    if (!supabase) return;
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    this.refreshAll();
  }

  async addBarrel(barrelData: Partial<Barrel>) {
    if (!supabase) return;
    const { data } = await supabase.from('barrels').insert([{
      code: barrelData.code,
      capacity: barrelData.capacity || 50,
      beer_type: barrelData.beerType,
      status: barrelData.status || BarrelStatus.EN_BODEGA_LIMPIO,
      last_location_id: barrelData.lastLocationId,
      last_location_name: barrelData.lastLocationName
    }]).select();

    if (data && data[0]) {
      await supabase.from('activities').insert([{
        barrel_id: data[0].id,
        barrel_code: data[0].code,
        user_name: this.getCurrentUserName(),
        new_status: data[0].status,
        location_id: data[0].last_location_id,
        location_name: data[0].last_location_name,
        beer_type: data[0].beer_type
      }]);
    }
    this.refreshAll();
  }

  async addLocation(name: string, address: string) {
    if (!supabase) return;
    await supabase.from('locations').insert([{ name, address }]);
    this.refreshAll();
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    if (!supabase) return;
    await supabase.from('locations').update(updates).eq('id', id);
    this.refreshAll();
  }

  async deleteLocation(id: string) {
    if (!supabase) return { success: false, error: 'No database connection' };
    const hasBarrels = this.barrelsCache.some(b => b.lastLocationId === id);
    if (hasBarrels) return { success: false, error: 'Ubicación con barriles asignados.' };
    await supabase.from('locations').delete().eq('id', id);
    this.refreshAll();
    return { success: true };
  }

  async updateBarrelStatus(barrelId: string, newStatus: BarrelStatus | undefined, details: { locationId?: string, beerType?: BeerType, eventId?: string, notes?: string }): Promise<Barrel | null> {
    if (!supabase) return null;
    const barrel = this.barrelsCache.find(b => b.id === barrelId);
    if (!barrel) return null;

    const previousStatus = barrel.status;
    const finalStatus = newStatus || previousStatus;

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

    const { data: updatedBarrel } = await supabase.from('barrels').update(updateData).eq('id', barrelId).select();

    if (updatedBarrel && updatedBarrel[0]) {
      await supabase.from('activities').insert([{
        barrel_id: barrelId,
        barrel_code: barrel.code,
        user_name: this.getCurrentUserName(),
        previous_status: previousStatus,
        new_status: finalStatus,
        location_id: updateData.last_location_id || barrel.lastLocationId,
        location_name: updateData.last_location_name || barrel.lastLocationName,
        beer_type: details.beerType || barrel.beerType,
        notes: details.notes
      }]);
    }
    
    await this.refreshAll();

    if (updatedBarrel && updatedBarrel[0]) {
      const item = updatedBarrel[0];
      return {
        id: item.id,
        code: item.code,
        capacity: item.capacity,
        beerType: item.beer_type,
        status: item.status,
        lastLocationId: item.last_location_id,
        lastLocationName: item.last_location_name,
        lastUpdate: item.last_update,
        createdAt: item.created_at
      };
    }
    return null;
  }

  async addRecipe(recipe: Partial<Recipe>) {
    if (!supabase) return;
    await supabase.from('recipes').insert([{
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    }]);
    this.refreshAll();
  }

  async addEvent(eventData: Partial<BreweryEvent>) {
    if (!supabase) return;
    await supabase.from('events').insert([{
      name: eventData.name,
      date: eventData.date,
      notes: eventData.notes,
      barrel_ids: eventData.barrelIds,
      checklist: eventData.checklist
    }]);
    this.refreshAll();
  }

  async updateEvent(id: string, updates: Partial<BreweryEvent>) {
    if (!supabase) return;
    const updatePayload: any = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.barrelIds !== undefined) updatePayload.barrel_ids = updates.barrelIds;
    if (updates.checklist !== undefined) updatePayload.checklist = updates.checklist;

    await supabase.from('events').update(updatePayload).eq('id', id);
    this.refreshAll();
  }
}

export const storage = new DatabaseStorage();
// Inicialización diferida para no bloquear el hilo principal de importación
setTimeout(() => storage.refreshAll(), 0);
