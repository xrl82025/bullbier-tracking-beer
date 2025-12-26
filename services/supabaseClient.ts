
import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las variables definidas por Vite o directamente de process.env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Si faltan las credenciales, informamos pero no rompemos la carga del JS
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase: Credenciales no encontradas en el primer intento. Verificando configuración...");
}

export const supabase = (supabaseUrl && supabaseUrl !== 'undefined' && supabaseAnonKey && supabaseAnonKey !== 'undefined') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!supabase) {
  console.error("CRÍTICO: El cliente de Supabase no pudo inicializarse. La app funcionará en modo offline limitado.");
}
