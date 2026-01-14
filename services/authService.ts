
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
    // Verificación de credenciales maestras (Funciona siempre, incluso offline)
    if (email.trim().toLowerCase() === SPECIFIC_USER.toLowerCase() && pass === SPECIFIC_PASS) {
      const session = { email: SPECIFIC_USER, name: "Bullbier Premium", role: "Admin" };
      localStorage.setItem('bt_session', JSON.stringify(session));
      return { success: true, user: session };
    }

    // Intento con Supabase Auth si está configurado
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (!error && data.user) {
          const session = { 
            email: data.user.email || email, 
            name: data.user.user_metadata?.full_name || "Usuario", 
            role: "Operador" 
          };
          localStorage.setItem('bt_session', JSON.stringify(session));
          return { success: true, user: session };
        }
      } catch (e) {
        console.warn("Auth: Error de red al conectar con Supabase Auth.");
      }
    }

    return { success: false, error: "Credenciales incorrectas" };
  },

  logout: () => {
    localStorage.removeItem('bt_session');
    if (supabase) {
      try {
        supabase.auth.signOut();
      } catch (e) {}
    }
  },

  getCurrentSession: (): UserSession | null => {
    try {
      const saved = localStorage.getItem('bt_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
};
