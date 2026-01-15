
-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    lat TEXT DEFAULT '-34.6',
    lng TEXT DEFAULT '-58.4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Lotes (Batches)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fermenter_name TEXT NOT NULL,
    beer_type TEXT NOT NULL,
    total_liters INTEGER NOT NULL,
    remaining_liters INTEGER NOT NULL,
    filling_date DATE NOT NULL,
    status TEXT DEFAULT 'fermentando' CHECK (status IN ('fermentando', 'madurando', 'listo', 'terminado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Barriles
CREATE TABLE IF NOT EXISTS barrels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 50,
    beer_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'en_bodega_limpio',
    last_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    last_location_name TEXT,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Actividades (Auditoría con registro de variedad y eventos)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barrel_id UUID REFERENCES barrels(id) ON DELETE CASCADE,
    barrel_code TEXT,
    user_name TEXT DEFAULT 'Sistema',
    previous_status TEXT,
    new_status TEXT NOT NULL,
    location_id UUID,
    location_name TEXT,
    beer_type TEXT, -- Aquí se guarda la variedad al momento del llenado
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    event_name TEXT, -- Columna añadida para historial de eventos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Recetas
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    barrel_ids TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insertar datos iniciales
INSERT INTO locations (name, address) 
VALUES ('Bodega Principal', 'Planta de Producción Bullbier')
ON CONFLICT DO NOTHING;

-- 10. Configuración de Seguridad (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrels ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON locations;
CREATE POLICY "Public Access" ON locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON barrels;
CREATE POLICY "Public Access" ON barrels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON batches;
CREATE POLICY "Public Access" ON batches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON activities;
CREATE POLICY "Public Access" ON activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON recipes;
CREATE POLICY "Public Access" ON recipes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON events;
CREATE POLICY "Public Access" ON events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON notifications;
CREATE POLICY "Public Access" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 11. Habilitar Realtime
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE barrels, batches, locations, activities, notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
END $$;
