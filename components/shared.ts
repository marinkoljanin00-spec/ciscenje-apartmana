// Shared styles and types for all components
export const t = {
  bg: '#050505', bgCard: '#0a0a0a', card: '#111111', border: '#1f1f1f', borderLight: '#262626',
  text: '#ffffff', textMuted: '#a3a3a3', textDim: '#737373', accent: '#10b981', accentGlow: 'rgba(16,185,129,0.15)', urgent: '#ef4444'
}

export const cardStyle = { background: t.card, border: `1px solid ${t.border}`, borderRadius: 16 }
export const btnPrimary = { padding: '14px 28px', background: t.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer' }
export const btnSecondary = { padding: '14px 28px', background: 'transparent', border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
export const inputStyle = { width: '100%', padding: '14px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const }
export const selectStyle = { ...inputStyle, cursor: 'pointer' }

export const CROATIAN_CITIES = [
  'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Sesvete', 'Karlovac',
  'Varaždin', 'Šibenik', 'Sisak', 'Vinkovci', 'Velika Gorica', 'Vukovar', 'Bjelovar',
  'Dubrovnik', 'Koprivnica', 'Požega', 'Čakovec', 'Petrinja', 'Gospić', 'Virovitica',
  'Kutina', 'Samobor', 'Solin', 'Đakovo', 'Knin', 'Makarska', 'Metković'
]

export type User = { id: number; email: string; role: 'client' | 'cleaner'; city?: string }
export type Job = { id: number; title: string; location: string; price: number; status: string; created_at: string; property_type?: string; is_urgent?: boolean; description?: string; cleaner_id?: number; cleaner_name?: string; cleaner_email?: string; cleaner_phone?: string; application_count?: number; city?: string; client_name?: string }
export type Application = { id: number; job_id: number; cleaner_id: number; status: string; message?: string; created_at: string; cleaner_name?: string; rating?: number; phone?: string; email?: string; title?: string; location?: string; price?: number; job_status?: string; is_urgent?: boolean; client_name?: string; client_email?: string; client_phone?: string }
export type Stats = { totalJobs?: number; activeApplications?: number; totalSpent?: number; completedJobs?: number; pendingApplications?: number; totalEarned?: number; rating?: number }
