import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientePublico: SupabaseClient | null = null;
let clienteAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!clientePublico) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurados");
    }
    clientePublico = createClient(url, key);
  }
  return clientePublico;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!clienteAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
    }
    clienteAdmin = createClient(url, key);
  }
  return clienteAdmin;
}

/** @deprecated Use getSupabase() */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

/** @deprecated Use getSupabaseAdmin() */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabaseAdmin(), prop);
  },
});
