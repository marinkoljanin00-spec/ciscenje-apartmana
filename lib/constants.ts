// Croatian cities for location dropdowns
export const CROATIAN_CITIES = [
  'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Sesvete', 'Karlovac',
  'Varaždin', 'Šibenik', 'Sisak', 'Vinkovci', 'Velika Gorica', 'Vukovar', 'Bjelovar',
  'Dubrovnik', 'Koprivnica', 'Požega', 'Čakovec', 'Petrinja', 'Gospić', 'Virovitica',
  'Kutina', 'Samobor', 'Solin', 'Đakovo', 'Knin', 'Makarska', 'Metković'
] as const

export type CroatianCity = (typeof CROATIAN_CITIES)[number]

// Property types for job listings
export const PROPERTY_TYPES = [
  'stan',
  'kuca',
  'ured',
  'poslovni'
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

// City coordinates for map centering (if needed in the future)
export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Zagreb': { lat: 45.815, lon: 15.982 },
  'Split': { lat: 43.508, lon: 16.440 },
  'Rijeka': { lat: 45.327, lon: 14.442 },
  'Osijek': { lat: 45.551, lon: 18.694 },
  'Zadar': { lat: 44.119, lon: 15.232 },
  'Pula': { lat: 44.867, lon: 13.850 },
  'Dubrovnik': { lat: 42.641, lon: 18.108 },
}
