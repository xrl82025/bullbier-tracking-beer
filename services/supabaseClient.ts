
import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las variables de entorno de forma segura
const getEnv = (key: string) => {
  try {
    return process.env[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

const isValid = (val: string) => val && val !== 'undefined' && val !== 'null' && val.length > 10;

// Exportamos el cliente solo si las credenciales parecen válidas
export const supabase = isValid(supabaseUrl) && isValid(supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("Bullbier: Supabase no disponible. Iniciando motor de persistencia local (Offline Mode).");
}
