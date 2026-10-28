import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;
let connectionStatus: {
  isConfigured: boolean;
  message: string;
  url: string;
} = {
  isConfigured: false,
  message: 'Configuración pendiente: Defina SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el archivo .env',
  url: '',
};

if (supabaseUrl && supabaseKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    connectionStatus = {
      isConfigured: true,
      message: 'Credenciales configuradas; conexión pendiente de verificar',
      url: supabaseUrl,
    };
    console.log(`[Supabase] Conectado a: ${supabaseUrl}`);
  } catch (error: any) {
    connectionStatus = {
      isConfigured: false,
      message: `Error al inicializar Supabase: ${error?.message || error}`,
      url: supabaseUrl,
    };
    console.warn(`[Supabase Warning] ${connectionStatus.message}`);
  }
} else {
  console.log('[Supabase] Variables no detectadas. Operando con almacén de contingencia local con auditoría completa.');
}

export function getSupabase(): SupabaseClient | null {
  return clientInstance;
}

export function getSupabaseStatus() {
  return connectionStatus;
}
