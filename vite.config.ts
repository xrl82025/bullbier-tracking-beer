
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Buscamos las variables de Supabase en cualquiera de sus variantes comunes en Vercel
  const supabaseUrl = env.SUPABASE_URL || env.STORAGE_SUPABASE_URL || env.NEXT_PUBLIC_STORAGE_SUPABASE_URL || (process as any).env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.STORAGE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY || (process as any).env.SUPABASE_ANON_KEY;

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || (process as any).env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
    },
    build: {
      outDir: 'dist',
    }
  };
});
