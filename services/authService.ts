
import { supabase } from './supabaseClient';

export interface UserSession {
  email: string;
  name: string;
  role: string;
}

const SPECIFIC_USER = "cervezabullbierpremium@gmail.com";
const SPECIFIC_PASS = "Bullbierpremium1920@";

export const authService = {
  login: async (email: string, pass: string): Promise<{ success: boolean; user?: UserSession; error?: string }> => {
    // Verificación de credenciales específicas solicitadas por el usuario
    if (email === SPECIFIC_USER && pass === SPECIFIC_PASS) {
      const session = { email, name: "Bullbier Premium", role: "Admin" };
      localStorage.setItem('bt_session', JSON.stringify(session));
      return { success: true, user: session };
    }

    // Intento con Supabase Auth si está disponible
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) return { success: false, error: "Credenciales inválidas" };
        
        const session = { 
          email: data.user?.email || email, 
          name: data.user?.user_metadata?.full_name || "Usuario", 
          role: "Operador" 
        };
        localStorage.setItem('bt_session', JSON.stringify(session));
        return { success: true, user: session };
      } catch (e) {
        return { success: false, error: "Error de conexión" };
      }
    }

    return { success: false, error: "Credenciales incorrectas" };
  },

  logout: () => {
    localStorage.removeItem('bt_session');
    if (supabase) supabase.auth.signOut();
  },

  getCurrentSession: (): UserSession | null => {
    const saved = localStorage.getItem('bt_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
