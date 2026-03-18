// Backend API URL — use ngrok or local IP so physical iPhone can reach it
// e.g., http://192.168.x.x:8000 or https://abc123.ngrok.io
export const API_URL = 'http://192.168.1.100:8000';

// Stripe Terminal location ID
export const STRIPE_LOCATION_ID = 'tml_GbemGgskI4LbKf';

// Colors
export const COLORS = {
  navy: '#1B2A4A',
  orange: '#FF6B35',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  green: '#22C55E',
  red: '#EF4444',
  gray: '#9CA3AF',
  darkGray: '#4B5563',
} as const;

// Categories
export const CATEGORIES = [
  { key: 'labor', label: 'Labor' },
  { key: 'materials', label: 'Materials' },
  { key: 'subcontractor', label: 'Subcontractor' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'other', label: 'Other' },
] as const;

export type Category = typeof CATEGORIES[number]['key'];
