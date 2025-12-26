
import { supabase } from './supabaseClient';
import { Barrel, BarrelStatus, BeerType, Location, Activity, Recipe, BreweryEvent, Notification } from '../types';

class DatabaseStorage {
  private listeners: (() => void)[] = [];

  constructor() {
    this.setupRealtime();
  }

  private setupRealtime() {
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        this.notify();
      })
      .subscribe();
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

  // --- READ OPERATIONS (Asíncronas pero usadas síncronamente en componentes actuales con estados locales) ---
  // Nota: En una app real de producción, usaríamos React Query o SWR. 
  // Aquí mantendremos compatibilidad con los componentes actuales.

  async fetchBarrels(): Promise<Barrel[]> {
    const { data, error } = await supabase.from('barrels').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    // Map to camelCase to match types.ts interfaces
    return (data || []).map((item: any) => ({
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
  }

  // Métodos simplificados para que los componentes actuales funcionen
  // En los componentes actuales, se llama a storage.getBarrels()
  // Implementaremos una cache local para mantener la compatibilidad síncrona
  private barrelsCache: Barrel[] = [];
  private locationsCache: Location[] = [];
  private activitiesCache: Activity[] = [];
  private notificationsCache: Notification[] = [];
  private recipesCache: Recipe[] = [];
  private eventsCache: BreweryEvent[] = [];

  async refreshAll() {
    const [b, l, a, n, r, e] = await Promise.all([
      supabase.from('barrels').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*').order('name'),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('recipes').select('*').order('name'),
      supabase.from('events').select('*').order('date', { ascending: false })
    ]);

    // Map to camelCase interfaces defined in types.ts
    this.barrelsCache = (b.data || []).map((item: any) => ({
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

    this.locationsCache = l.data || [];

    this.activitiesCache = (a.data || []).map((item: any) => ({
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

    this.notificationsCache = (n.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      type: item.type,
      createdAt: item.created_at,
      read: item.read
    }));

    this.recipesCache = r.data || [];

    this.eventsCache = (e.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      date: item.date,
      notes: item.notes,
      barrelIds: item.barrel_ids || [],
      checklist: item.checklist || []
    }));
    
    this.notify();
  }

  getBarrels() { return this.barrelsCache; }
  getBarrel(id: string) { return this.barrelsCache.find(b => b.id === id); }
  getLocations() { 
    return this.locationsCache.map(loc => ({
      ...loc,
      // Fix: Use camelCase property lastLocationId instead of snake_case last_location_id
      barrelCount: this.barrelsCache.filter(b => b.lastLocationId === loc.id).length
    }));
  }
  getActivities() { return this.activitiesCache; }
  getComments(barrelId: string) { return []; /* Implementar tabla de comentarios si es necesario */ }
  getRecipes() { return this.recipesCache; }
  getEvents() { return this.eventsCache; }
  getNotifications() { return this.notificationsCache; }

  // --- WRITE OPERATIONS ---

  async addNotification(notification: Partial<Notification>) {
    await supabase.from('notifications').insert([{
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false
    }]);
    this.refreshAll();
  }

  async markNotificationAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    this.refreshAll();
  }

  async clearNotifications() {
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    this.refreshAll();
  }

  async addBarrel(barrelData: Partial<Barrel>) {
    const { data, error } = await supabase.from('barrels').insert([{
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
        user_name: 'Juan Doe',
        new_status: data[0].status,
        location_id: data[0].last_location_id,
        location_name: data[0].last_location_name,
        beer_type: data[0].beer_type
      }]);
      this.addNotification({ title: 'Nuevo Activo', message: `Barril ${data[0].code} registrado.`, type: 'success' });
    }
    this.refreshAll();
  }

  async addLocation(name: string, address: string) {
    await supabase.from('locations').insert([{ name, address }]);
    this.refreshAll();
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    await supabase.from('locations').update(updates).eq('id', id);
    this.refreshAll();
  }

  async deleteLocation(id: string) {
    // Fix: Use camelCase property lastLocationId instead of snake_case last_location_id
    const hasBarrels = this.barrelsCache.some(b => b.lastLocationId === id);
    if (hasBarrels) return { success: false, error: 'Ubicación con barriles asignados.' };
    await supabase.from('locations').delete().eq('id', id);
    this.refreshAll();
    return { success: true };
  }

  async updateBarrelStatus(barrelId: string, newStatus: BarrelStatus | undefined, details: { locationId?: string, beerType?: BeerType, eventId?: string, notes?: string }): Promise<Barrel | null> {
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
        user_name: 'Juan Doe',
        previous_status: previousStatus,
        new_status: finalStatus,
        // Fix: Use camelCase properties lastLocationId, lastLocationName, and beerType instead of snake_case
        location_id: updateData.last_location_id || barrel.lastLocationId,
        location_name: updateData.last_location_name || barrel.lastLocationName,
        beer_type: details.beerType || barrel.beerType,
        notes: details.notes
      }]);
    }
    
    // Refresh cache to ensure data is updated everywhere
    await this.refreshAll();

    // Map and return properly typed Barrel
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
    await supabase.from('recipes').insert([{
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    }]);
    this.refreshAll();
  }

  async addEvent(eventData: Partial<BreweryEvent>) {
    await supabase.from('events').insert([{
      name: eventData.name,
      date: eventData.date,
      notes: eventData.notes,
      barrel_ids: eventData.barrelIds,
      checklist: eventData.checklist
    }]);
    this.refreshAll();
  }

  // Fix: Added missing updateEvent method to resolve errors in Events.tsx
  async updateEvent(id: string, updates: Partial<BreweryEvent>) {
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
// Inicialización de la cache
storage.refreshAll();
