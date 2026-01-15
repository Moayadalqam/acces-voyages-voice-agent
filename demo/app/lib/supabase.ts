import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Create client only if credentials are available
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// For backward compatibility
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as SupabaseClient;

// Types for our tables
export interface Lead {
  id: string;
  caller_name: string;
  phone_number: string;
  email?: string;
  travel_dates?: string;
  destination: string;
  trip_type: 'cruise' | 'all-inclusive' | 'golf' | 'wedding' | 'honeymoon' | 'group' | 'other';
  budget_range?: 'under_2000' | '2000_5000' | '5000_10000' | 'over_10000';
  party_size?: string;
  language?: 'french' | 'english';
  notes?: string;
  callback_time?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  lead_id?: string;
  client_name: string;
  phone_number: string;
  email?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: 'consultation' | 'follow_up' | 'booking' | 'other';
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
}
