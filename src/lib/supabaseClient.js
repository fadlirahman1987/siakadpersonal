import { createClient } from '@supabase/supabase-js';

export const cleanSupabaseUrl = (inputUrl) => {
  if (!inputUrl) return '';
  let url = inputUrl.trim();

  // If user pasted dashboard URL: https://supabase.com/dashboard/project/abcdefghijklmnopqrst
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user pasted only project ref: abcdefghijklmnopqrst (15-25 chars)
  if (/^[a-zA-Z0-9_-]{15,25}$/.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Remove trailing slashes and subpaths
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/rest\/?$/i, '');
  url = url.replace(/\/v1\/?$/i, '');

  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
};

export const getSupabaseConfig = () => {
  const rawUrl = localStorage.getItem('siakad_sb_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const rawKey = localStorage.getItem('siakad_sb_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = cleanSupabaseUrl(rawUrl);
  const anonKey = (rawKey || '').trim();

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

export const getSupabaseClient = () => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = Boolean(getSupabaseConfig().isConfigured);


