
import { Barrel, BarrelStatus, BeerType, Location, Activity, User, UserRole, Comment, Recipe, BreweryEvent, Notification } from '../types';

const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Bodega Principal', address: 'Calle Falsa 123', lat: '-33.4489', lng: '-70.6693' },
  { id: 'loc-2', name: 'Depósito Sur', address: 'Av. Siempre Viva 742', lat: '-33.4569', lng: '-70.6483' },
  { id: 'loc-3', name: 'Bar Centro', address: 'Plaza Italia s/n', lat: '-33.4372', lng: '-70.6341' },
];

const INITIAL_BARRELS: Barrel[] = [
  { 
    id: 'b-1', code: 'BRL-001', capacity: 50, beerType: BeerType.GOLDEN_ALE, 
    status: BarrelStatus.EN_BODEGA_LIMPIO, lastLocationId: 'loc-1', lastLocationName: 'Bodega Principal',
    lastUpdate: new Date().toISOString(), createdAt: new Date().toISOString()
  },
  { 
    id: 'b-2', code: 'BRL-002', capacity: 50, beerType: BeerType.STOUT, 
    status: BarrelStatus.LLENADO, lastLocationId: 'loc-1', lastLocationName: 'Bodega Principal',
    lastUpdate: new Date().toISOString(), createdAt: new Date().toISOString()
  },
  { 
    id: 'b-3', code: 'BRL-003', capacity: 30, beerType: BeerType.CALAFATE, 
    status: BarrelStatus.EN_TRANSITO, lastLocationId: 'loc-3', lastLocationName: 'Bar Centro',
    lastUpdate: new Date().toISOString(), createdAt: new Date().toISOString()
  }
];

const INITIAL_RECIPES: Recipe[] = [
  { 
    id: 'r-1', 
    name: 'Golden Ale Clásica', 
    description: 'Refrescante y ligera con notas cítricas.', 
    ingredients: [
      {name: 'Malta Pale', quantity: '5', unit: 'kg'}, 
      {name: 'Lúpulo Cascade', quantity: '30', unit: 'g'}
    ],
    steps: [
      { title: "Maceración", description: "Infusión simple a 68°C durante 60 minutos para extracción de azúcares." },
      { title: "Hervor", description: "Hervido vigoroso de 60 min con adiciones de lúpulo según cronograma." },
      { title: "Fermentación", description: "Mantener a 19°C constantes durante 7 días." }
    ]
  },
];

const INITIAL_EVENTS: BreweryEvent[] = [
  { id: 'e-1', name: 'Festival Cerveza Invierno', date: '2024-07-15', notes: 'Evento principal en plaza central', barrelIds: ['b-1', 'b-3'], checklist: [{id: 'c1', name: 'Hielo', checked: true}, {id: 'c2', name: 'Vasos', checked: false}] },
];

class MockStorage {
  private barrels: Barrel[] = [];
  private locations: Location[] = [];
  private activities: Activity[] = [];
  private comments: Comment[] = [];
  private recipes: Recipe[] = [];
  private events: BreweryEvent[] = [];
  private notifications: Notification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const savedBarrels = localStorage.getItem('bt_barrels');
    const savedLocations = localStorage.getItem('bt_locations');
    const savedActivities = localStorage.getItem('bt_activities');
    const savedComments = localStorage.getItem('bt_comments');
    const savedRecipes = localStorage.getItem('bt_recipes');
    const savedEvents = localStorage.getItem('bt_events');
    const savedNotifications = localStorage.getItem('bt_notifications');

    this.barrels = savedBarrels ? JSON.parse(savedBarrels) : INITIAL_BARRELS;
    this.locations = savedLocations ? JSON.parse(savedLocations) : INITIAL_LOCATIONS;
    this.activities = savedActivities ? JSON.parse(savedActivities) : [];
    this.comments = savedComments ? JSON.parse(savedComments) : [];
    this.recipes = savedRecipes ? JSON.parse(savedRecipes) : INITIAL_RECIPES;
    this.events = savedEvents ? JSON.parse(savedEvents) : INITIAL_EVENTS;
    this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [
      { id: 'n1', title: 'Bienvenido', message: 'BarrelTrack está listo para operar.', type: 'success', createdAt: new Date().toISOString(), read: false }
    ];

    if (!savedBarrels) this.save();
  }

  private save() {
    localStorage.setItem('bt_barrels', JSON.stringify(this.barrels));
    localStorage.setItem('bt_locations', JSON.stringify(this.locations));
    localStorage.setItem('bt_activities', JSON.stringify(this.activities));
    localStorage.setItem('bt_comments', JSON.stringify(this.comments));
    localStorage.setItem('bt_recipes', JSON.stringify(this.recipes));
    localStorage.setItem('bt_events', JSON.stringify(this.events));
    localStorage.setItem('bt_notifications', JSON.stringify(this.notifications));
    this.notify();
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

  getBarrels() { return this.barrels; }
  getBarrel(id: string) { return this.barrels.find(b => b.id === id); }
  getLocations() { 
    return this.locations.map(loc => ({
      ...loc,
      barrelCount: this.barrels.filter(b => b.lastLocationId === loc.id).length
    }));
  }
  getActivities() { return this.activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  getComments(barrelId: string) { return this.comments.filter(c => c.barrelId === barrelId); }
  getRecipes() { return this.recipes; }
  getEvents() { return this.events; }
  getNotifications() { return this.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  addNotification(notification: Partial<Notification>) {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: notification.title || 'Nueva Alerta',
      message: notification.message || '',
      type: notification.type || 'info',
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotif);
    if (this.notifications.length > 50) this.notifications.pop();
    this.save();
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  clearNotifications() {
    this.notifications = [];
    this.save();
  }

  addBarrel(barrelData: Partial<Barrel>) {
    const newBarrel: Barrel = {
      id: Math.random().toString(36).substr(2, 9),
      code: barrelData.code || `BRL-${(this.barrels.length + 1).toString().padStart(3, '0')}`,
      capacity: barrelData.capacity || 50,
      beerType: barrelData.beerType || BeerType.GOLDEN_ALE,
      status: barrelData.status || BarrelStatus.EN_BODEGA_LIMPIO,
      lastLocationId: barrelData.lastLocationId || 'loc-1',
      lastLocationName: barrelData.lastLocationName || 'Bodega Principal',
      lastUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.barrels.push(newBarrel);
    
    this.activities.push({
      id: Math.random().toString(36).substr(2, 9),
      barrelId: newBarrel.id,
      barrelCode: newBarrel.code,
      userId: 'user-1',
      userName: 'Juan Doe',
      previousStatus: null,
      newStatus: newBarrel.status,
      locationId: newBarrel.lastLocationId,
      locationName: newBarrel.lastLocationName,
      beerType: newBarrel.beerType,
      createdAt: new Date().toISOString()
    });

    this.addNotification({
      title: 'Nuevo Activo',
      message: `El barril ${newBarrel.code} ha sido registrado exitosamente.`,
      type: 'success'
    });

    this.save();
    return newBarrel;
  }

  addLocation(name: string, address: string) {
    const newLoc: Location = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      address,
      lat: '-33.44',
      lng: '-70.66'
    };
    this.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  updateLocation(id: string, updates: Partial<Location>) {
    const index = this.locations.findIndex(l => l.id === id);
    if (index !== -1) {
      this.locations[index] = { ...this.locations[index], ...updates };
      if (updates.name) {
        this.barrels.forEach(b => {
          if (b.lastLocationId === id) {
            b.lastLocationName = updates.name!;
          }
        });
      }
      this.save();
      return this.locations[index];
    }
  }

  deleteLocation(id: string) {
    const barrelCount = this.barrels.filter(b => b.lastLocationId === id).length;
    if (barrelCount > 0) {
      return { success: false, error: 'No se puede eliminar una ubicación con barriles asignados.' };
    }
    this.locations = this.locations.filter(l => l.id !== id);
    this.save();
    return { success: true };
  }

  addRecipe(recipe: Partial<Recipe>) {
    const newRecipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name: recipe.name || 'Nueva Receta',
      description: recipe.description || '',
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || []
    };
    this.recipes.push(newRecipe);
    this.save();
    return newRecipe;
  }

  addEvent(eventData: Partial<BreweryEvent>) {
    const newEvent: BreweryEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: eventData.name || 'Nuevo Evento',
      date: eventData.date || new Date().toISOString().split('T')[0],
      notes: eventData.notes || '',
      barrelIds: eventData.barrelIds || [],
      checklist: eventData.checklist || []
    };
    this.events.push(newEvent);

    this.addNotification({
      title: 'Evento Programado',
      message: `Se ha creado el evento "${newEvent.name}" para el día ${newEvent.date}.`,
      type: 'info'
    });

    this.save();
    return newEvent;
  }

  updateEvent(eventId: string, updates: Partial<BreweryEvent>) {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates };
      this.save();
      return this.events[index];
    }
  }

  updateBarrelStatus(barrelId: string, newStatus: BarrelStatus | undefined, details: { locationId?: string, beerType?: BeerType, eventId?: string, notes?: string }) {
    const barrel = this.barrels.find(b => b.id === barrelId);
    if (!barrel) return;

    const previousStatus = barrel.status;
    const finalStatus = newStatus || previousStatus;
    
    this.events.forEach(e => {
      e.barrelIds = e.barrelIds.filter(id => id !== barrelId);
    });

    barrel.status = finalStatus;
    barrel.lastUpdate = new Date().toISOString();

    if (details.beerType) {
      barrel.beerType = details.beerType;
    }

    if (details.locationId) {
      const loc = this.locations.find(l => l.id === details.locationId);
      if (loc) {
        barrel.lastLocationId = loc.id;
        barrel.lastLocationName = loc.name;
      }
    }

    let eventName: string | undefined;
    if (finalStatus === BarrelStatus.EN_EVENTO && details.eventId) {
      const event = this.events.find(e => e.id === details.eventId);
      if (event) {
        eventName = event.name;
        if (!event.barrelIds.includes(barrelId)) {
          event.barrelIds.push(barrelId);
        }
      }
    }

    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      barrelId,
      barrelCode: barrel.code,
      userId: 'user-1',
      userName: 'Juan Doe',
      previousStatus: previousStatus,
      newStatus: finalStatus,
      locationId: barrel.lastLocationId,
      locationName: barrel.lastLocationName,
      beerType: details.beerType || barrel.beerType,
      eventName,
      notes: details.notes,
      createdAt: new Date().toISOString()
    };

    this.activities.push(activity);

    if (previousStatus !== finalStatus) {
      this.addNotification({
        title: `Cambio de Estado: ${barrel.code}`,
        message: `Barril ${barrel.code} ahora está en estado ${finalStatus.replace(/_/g, ' ')}.`,
        type: finalStatus === BarrelStatus.EN_BODEGA_SUCIO ? 'warning' : 'info'
      });
    }

    this.save();
    return barrel;
  }

  addComment(barrelId: string, content: string) {
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      barrelId,
      userId: 'user-1',
      userName: 'Juan Doe',
      content,
      createdAt: new Date().toISOString()
    };
    this.comments.push(comment);
    this.save();
    return comment;
  }
}

export const storage = new MockStorage();
