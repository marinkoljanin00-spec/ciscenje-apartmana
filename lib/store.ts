import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserType = "vlasnik" | "cistacica"
export type DevicePreference = "desktop" | "mobile" | null

export const CROATIAN_CITIES = [
  "Zagreb",
  "Split",
  "Rijeka",
  "Osijek",
  "Zadar",
  "Pula",
  "Slavonski Brod",
  "Karlovac",
  "Varaždin",
  "Šibenik",
  "Sisak",
  "Vinkovci",
  "Dubrovnik",
  "Bjelovar",
  "Koprivnica",
  "Požega",
  "Vukovar",
  "Makarska",
  "Trogir",
  "Rovinj",
  "Opatija",
  "Hvar",
  "Bol",
  "Korčula",
  "Crikvenica",
  "Mali Lošinj",
  "Novalja",
  "Vodice",
  "Biograd na Moru",
  "Omiš",
] as const

export type CroatianCity = (typeof CROATIAN_CITIES)[number]

// City coordinates for map centering
export const CITY_COORDINATES: Record<CroatianCity, { lat: number; lon: number }> = {
  "Zagreb": { lat: 45.815, lon: 15.982 },
  "Split": { lat: 43.508, lon: 16.440 },
  "Rijeka": { lat: 45.327, lon: 14.442 },
  "Osijek": { lat: 45.551, lon: 18.694 },
  "Zadar": { lat: 44.119, lon: 15.232 },
  "Pula": { lat: 44.867, lon: 13.850 },
  "Slavonski Brod": { lat: 45.160, lon: 18.016 },
  "Karlovac": { lat: 45.487, lon: 15.548 },
  "Varaždin": { lat: 46.306, lon: 16.337 },
  "Šibenik": { lat: 43.735, lon: 15.895 },
  "Sisak": { lat: 45.466, lon: 16.378 },
  "Vinkovci": { lat: 45.288, lon: 18.805 },
  "Dubrovnik": { lat: 42.641, lon: 18.108 },
  "Bjelovar": { lat: 45.899, lon: 16.842 },
  "Koprivnica": { lat: 46.163, lon: 16.827 },
  "Požega": { lat: 45.340, lon: 17.680 },
  "Vukovar": { lat: 45.352, lon: 18.998 },
  "Makarska": { lat: 43.297, lon: 17.017 },
  "Trogir": { lat: 43.517, lon: 16.250 },
  "Rovinj": { lat: 45.081, lon: 13.640 },
  "Opatija": { lat: 45.337, lon: 14.305 },
  "Hvar": { lat: 43.172, lon: 16.441 },
  "Bol": { lat: 43.262, lon: 16.655 },
  "Korčula": { lat: 42.960, lon: 17.135 },
  "Crikvenica": { lat: 45.177, lon: 14.692 },
  "Mali Lošinj": { lat: 44.531, lon: 14.469 },
  "Novalja": { lat: 44.558, lon: 14.885 },
  "Vodice": { lat: 43.761, lon: 15.778 },
  "Biograd na Moru": { lat: 43.937, lon: 15.443 },
  "Omiš": { lat: 43.444, lon: 16.688 },
}

export const PROPERTY_TYPES = [
  "Apartman",
  "Stan",
  "Kuća",
  "Vila",
  "Ured",
  "Poslovni prostor",
  "Studio",
  "Garsonijera",
  "Hostel",
  "Hotel",
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

// Cleaner trust/level system
export type CleanerLevel = "beginner" | "pro" | "elite"

export interface CleanerLevelInfo {
  level: CleanerLevel
  label: string
  minJobs: number
  minRating: number
  color: string
  bgColor: string
  borderColor: string
  verified: boolean
}

export const CLEANER_LEVELS: Record<CleanerLevel, Omit<CleanerLevelInfo, 'level'>> = {
  beginner: {
    label: "Početnik",
    minJobs: 0,
    minRating: 0,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
    verified: false,
  },
  pro: {
    label: "Pro",
    minJobs: 5,
    minRating: 4.0,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/30",
    verified: true,
  },
  elite: {
    label: "Elite",
    minJobs: 15,
    minRating: 4.5,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/30",
    verified: true,
  },
}

// Helper function to calculate cleaner level
export function getCleanerLevel(completedJobs: number, averageRating: number): CleanerLevelInfo {
  if (completedJobs >= 15 && averageRating >= 4.5) {
    return { level: "elite", ...CLEANER_LEVELS.elite }
  }
  if (completedJobs >= 5 && averageRating >= 4.0) {
    return { level: "pro", ...CLEANER_LEVELS.pro }
  }
  return { level: "beginner", ...CLEANER_LEVELS.beginner }
}

// Progress to next level
export function getLevelProgress(completedJobs: number, averageRating: number): { 
  currentLevel: CleanerLevelInfo
  nextLevel: CleanerLevelInfo | null
  jobsProgress: number
  ratingProgress: number
} {
  const currentLevel = getCleanerLevel(completedJobs, averageRating)
  
  if (currentLevel.level === "elite") {
    return { currentLevel, nextLevel: null, jobsProgress: 100, ratingProgress: 100 }
  }
  
  const nextLevelKey = currentLevel.level === "beginner" ? "pro" : "elite"
  const nextLevel = { level: nextLevelKey as CleanerLevel, ...CLEANER_LEVELS[nextLevelKey] }
  
  const jobsProgress = Math.min(100, (completedJobs / nextLevel.minJobs) * 100)
  const ratingProgress = averageRating > 0 ? Math.min(100, (averageRating / nextLevel.minRating) * 100) : 0
  
  return { currentLevel, nextLevel, jobsProgress, ratingProgress }
}

export type UserSpol = "muški" | "ženski" | "neodređeno"

export interface SavedProperty {
  id: string
  naziv: string // npr. "Apartman More", "Stan Centar"
  adresa: string
  grad: CroatianCity
  vrstaNekrtnine: PropertyType
  lat: number
  lon: number
}

export interface User {
  email: string
  ime: string
  mobitel: string
  tip: UserType
  opis: string
  slika?: string // URL slike profila
  spol?: UserSpol
  slikaVerificiran?: boolean // badge verifikacije za profilnu sliku
  emailVerificiran?: boolean
  verifikacijskiKod?: string
  savedProperties?: SavedProperty[] // spremljene nekretnine vlasnika
}

export type JobStatus = "OTVORENO" | "ČEKA_ODOBRENJE" | "ODOBRENO" | "U_TIJEKU" | "ČEKA_RECENZIJU" | "ZAVRŠENO"

export interface Job {
  id: string
  vlasnik: string
  adresa: string
  grad: CroatianCity
  vrstaNekrtnine: PropertyType
  cijena: number
  hitno?: boolean // Premium/urgent cleaning - price x1.5
  datum: string
  vrijemeOd: string
  vrijemeDo: string
  opis: string
  status: JobStatus
  cistacica?: string
  lat: number
  lon: number
  keywords?: string[] // For search optimization
}

// Helper to generate search keywords for job
export function generateJobKeywords(grad: CroatianCity, vrstaNekrtnine: PropertyType, opis: string): string[] {
  const keywords: string[] = []
  
  // Add city-specific keywords
  const cityLower = grad.toLowerCase()
  keywords.push(`čišćenje ${cityLower}`)
  keywords.push(`pranje ${cityLower}`)
  keywords.push(`uređivanje ${cityLower}`)
  
  // Add property type keywords
  const propertyLower = vrstaNekrtnine.toLowerCase()
  keywords.push(`${propertyLower}`)
  keywords.push(`${propertyLower} čišćenje`)
  keywords.push(`čišćenje ${propertyLower}`)
  
  // Add city + property keywords
  keywords.push(`${propertyLower} ${cityLower}`)
  keywords.push(`${cityLower} ${propertyLower}`)
  
  // Add general keywords
  keywords.push("čišćenje")
  keywords.push("pranje")
  keywords.push("uređivanje")
  keywords.push("apartman")
  
  // Add keywords from description
  const descWords = opis.toLowerCase().split(/\s+/)
  const relevantWords = descWords.filter(w => w.length > 4)
  keywords.push(...relevantWords.slice(0, 3))
  
  // Remove duplicates and return unique keywords
  return [...new Set(keywords)].sort()
}

// Premium price multiplier
export const PREMIUM_MULTIPLIER = 1.5

// Helper to calculate final price
export function getFinalPrice(basePrice: number, isUrgent: boolean): number {
  return isUrgent ? basePrice * PREMIUM_MULTIPLIER : basePrice
}

export interface Review {
  id: string
  oglas_id: string
  ocjenjeni: string
  ocjena: number
  komentar: string
  datum: string
}

// Bug report system
export type BugReportStatus = "novo" | "u_tijeku" | "riješeno"
export type BugReportPriority = "niska" | "srednja" | "visoka"

export interface BugReport {
  id: string
  korisnik: string // email korisnika koji prijavljuje
  naslov: string
  opis: string
  prioritet: BugReportPriority
  status: BugReportStatus
  datum: string
  odgovor?: string // admin odgovor
}

// Admin email - samo ovaj korisnik vidi prijave
export const ADMIN_EMAIL = "admin@cleanup.hr"

interface AppState {
  // Auth
  user: User | null
  users: User[]
  isAuthenticated: boolean

  // Jobs
  jobs: Job[]

  // Reviews
  reviews: Review[]

  // Bug reports
  bugReports: BugReport[]

  // Device preference
  devicePreference: DevicePreference
  setDevicePreference: (preference: DevicePreference) => void

  // Auth actions
  login: (email: string, password: string) => boolean
  register: (user: User & { lozinka: string; spol?: UserSpol }) => boolean
  logout: () => void
  deleteAccount: (email: string) => void
  updateProfileImage: (email: string, imageUrl: string) => void
  updateUserSpol: (email: string, spol: UserSpol) => void
  verifyEmail: (kod: string) => boolean
  resendVerificationCode: () => string

  // Job actions
  createJob: (job: Omit<Job, "id" | "status">) => void
  deleteJob: (id: string) => void
  requestJob: (id: string, cistacica: string) => void
  approveJob: (id: string) => void
  rejectJob: (id: string) => void
  startJob: (id: string) => void
  completeJob: (id: string) => void
  submitReview: (id: string, ocjena: number, komentar: string) => void

  // Review actions
  addReview: (review: Omit<Review, "id" | "datum">) => void
  
  // Helper
  getCleanerReviews: (email: string) => Review[]
  getAverageRating: (email: string) => number

  // Bug report actions
  submitBugReport: (report: Omit<BugReport, "id" | "datum" | "status">) => void
  updateBugReportStatus: (id: string, status: BugReportStatus, odgovor?: string) => void

  // Saved properties actions
  saveProperty: (property: Omit<SavedProperty, "id">) => void
  deleteProperty: (id: string) => void
  getSavedProperties: () => SavedProperty[]
}

// Initial demo data
const initialJobs: Job[] = [
  {
    id: "1",
    vlasnik: "demo@cleanup.hr",
    adresa: "Vukovarska 45",
    grad: "Split",
    vrstaNekrtnine: "Stan",
    cijena: 45.0,
    datum: "28.03.2026",
    vrijemeOd: "10:00",
    vrijemeDo: "12:00",
    opis: "Stan od 60m2, potrebno generalno čišćenje",
    status: "OTVORENO",
    lat: 43.508,
    lon: 16.44,
  },
  {
    id: "2",
    vlasnik: "demo@cleanup.hr",
    adresa: "Marjanska 12",
    grad: "Split",
    vrstaNekrtnine: "Kuća",
    cijena: 80.0,
    datum: "30.03.2026",
    vrijemeOd: "09:00",
    vrijemeDo: "13:00",
    opis: "Kuća na 2 etaže, redovno održavanje",
    status: "OTVORENO",
    lat: 43.512,
    lon: 16.435,
  },
  {
    id: "3",
    vlasnik: "ivan@cleanup.hr",
    adresa: "Ilica 200",
    grad: "Zagreb",
    vrstaNekrtnine: "Stan",
    cijena: 55.0,
    datum: "29.03.2026",
    vrijemeOd: "14:00",
    vrijemeDo: "17:00",
    opis: "Trosobni stan, redovno čišćenje",
    status: "OTVORENO",
    lat: 45.815,
    lon: 15.966,
  },
  {
    id: "4",
    vlasnik: "demo@cleanup.hr",
    adresa: "Stradun 5",
    grad: "Dubrovnik",
    vrstaNekrtnine: "Apartman",
    cijena: 120.0,
    datum: "01.04.2026",
    vrijemeOd: "08:00",
    vrijemeDo: "14:00",
    opis: "Luksuzni apartman u starom gradu, potrebno detaljno čišćenje",
    status: "OTVORENO",
    lat: 42.641,
    lon: 18.108,
  },
  {
    id: "5",
    vlasnik: "ivan@cleanup.hr",
    adresa: "Korzo 15",
    grad: "Rijeka",
    vrstaNekrtnine: "Garsonijera",
    cijena: 35.0,
    datum: "27.03.2026",
    vrijemeOd: "11:00",
    vrijemeDo: "13:00",
    opis: "Garsonijera, brzo čišćenje nakon gostiju",
    status: "OTVORENO",
    lat: 45.327,
    lon: 14.442,
  },
]

// Demo completed jobs for Ana (to give her Pro status - needs 5+ completed jobs with 4.0+ rating)
const demoCompletedJobs: Job[] = [
  {
    id: "completed1",
    vlasnik: "ivan@cleanup.hr",
    adresa: "Gundulićeva 10",
    grad: "Split",
    vrstaNekrtnine: "Apartman",
    cijena: 50.0,
    datum: "01.03.2026",
    vrijemeOd: "10:00",
    vrijemeDo: "12:00",
    opis: "Apartman čišćenje",
    status: "ZAVRŠENO",
    cistacica: "cistac@cleanup.hr",
    lat: 43.508,
    lon: 16.44,
  },
  {
    id: "completed2",
    vlasnik: "marija@cleanup.hr",
    adresa: "Obala 5",
    grad: "Split",
    vrstaNekrtnine: "Stan",
    cijena: 45.0,
    datum: "05.03.2026",
    vrijemeOd: "14:00",
    vrijemeDo: "16:00",
    opis: "Stan čišćenje",
    status: "ZAVRŠENO",
    cistacica: "cistac@cleanup.hr",
    lat: 43.51,
    lon: 16.438,
  },
  {
    id: "completed3",
    vlasnik: "demo@cleanup.hr",
    adresa: "Diocletian 2",
    grad: "Split",
    vrstaNekrtnine: "Apartman",
    cijena: 60.0,
    datum: "10.03.2026",
    vrijemeOd: "09:00",
    vrijemeDo: "11:00",
    opis: "Apartman detaljno čišćenje",
    status: "ZAVRŠENO",
    cistacica: "cistac@cleanup.hr",
    lat: 43.507,
    lon: 16.439,
  },
  {
    id: "completed4",
    vlasnik: "petar@cleanup.hr",
    adresa: "Marmontova 8",
    grad: "Split",
    vrstaNekrtnine: "Kuća",
    cijena: 90.0,
    datum: "15.03.2026",
    vrijemeOd: "08:00",
    vrijemeDo: "12:00",
    opis: "Kuća generalno čišćenje",
    status: "ZAVRŠENO",
    cistacica: "cistac@cleanup.hr",
    lat: 43.509,
    lon: 16.441,
  },
  {
    id: "completed5",
    vlasnik: "ana@cleanup.hr",
    adresa: "Riva 15",
    grad: "Split",
    vrstaNekrtnine: "Apartman",
    cijena: 55.0,
    datum: "20.03.2026",
    vrijemeOd: "11:00",
    vrijemeDo: "13:00",
    opis: "Apartman brzo čišćenje",
    status: "ZAVRŠENO",
    cistacica: "cistac@cleanup.hr",
    lat: 43.506,
    lon: 16.437,
  },
]

const initialReviews: Review[] = [
  {
    id: "r1",
    oglas_id: "completed1",
    ocjenjeni: "cistac@cleanup.hr",
    ocjena: 5,
    komentar: "Odličan posao! Stan je blistao nakon čišćenja. Vrlo temeljita i profesionalna.",
    datum: "01.03.2026",
  },
  {
    id: "r2",
    oglas_id: "completed2",
    ocjenjeni: "cistac@cleanup.hr",
    ocjena: 4,
    komentar: "Vrlo zadovoljna, sve je bilo čisto i uredno. Preporučujem!",
    datum: "05.03.2026",
  },
  {
    id: "r3",
    oglas_id: "completed3",
    ocjenjeni: "cistac@cleanup.hr",
    ocjena: 5,
    komentar: "Brza i efikasna. Apartman je spreman za goste već nakon sat vremena.",
    datum: "10.03.2026",
  },
  {
    id: "r4",
    oglas_id: "completed4",
    ocjenjeni: "cistac@cleanup.hr",
    ocjena: 4,
    komentar: "Kuća je bila besprijekorna. Hvala puno!",
    datum: "15.03.2026",
  },
  {
    id: "r5",
    oglas_id: "completed5",
    ocjenjeni: "cistac@cleanup.hr",
    ocjena: 5,
    komentar: "Savršeno! Već treći put angažiram Anu i uvijek je bez prigovora.",
    datum: "20.03.2026",
  },
]

const initialUsers: (User & { lozinka: string })[] = [
  {
    email: "demo@cleanup.hr",
    lozinka: "demo123",
    ime: "Marko Horvat",
    mobitel: "091 234 5678",
    tip: "vlasnik",
    opis: "Vlasnik nekretnina u Splitu i Dubrovniku",
    emailVerificiran: true,
  },
{
  email: "cistac@cleanup.hr",
  lozinka: "demo123",
  ime: "Ana Kovačić",
  mobitel: "098 765 4321",
  tip: "cistacica",
  opis: "Profesionalna čistačica s 5 godina iskustva. Specijalizirana za apartmane i kuće za odmor.",
  slika: "",
  emailVerificiran: true,
  },
  {
  email: "admin@cleanup.hr",
  lozinka: "admin123",
  ime: "Administrator",
  mobitel: "099 000 0000",
  tip: "vlasnik",
  opis: "Administrator sustava CLEANUP",
  emailVerificiran: true,
  },
  ]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      users: initialUsers,
      isAuthenticated: false,
jobs: [...initialJobs, ...demoCompletedJobs],
  reviews: initialReviews,
  bugReports: [],
  devicePreference: null,

      setDevicePreference: (preference) => {
        set({ devicePreference: preference })
      },

      login: (email, password) => {
        const users = get().users as (User & { lozinka: string })[]
        const foundUser = users.find(
          (u) => u.email === email && u.lozinka === password
        )
        if (foundUser) {
          const { lozinka: _, ...userWithoutPassword } = foundUser
          set({ user: userWithoutPassword, isAuthenticated: true })
          return true
        }
        return false
      },

      register: (userData) => {
        const users = get().users as (User & { lozinka: string })[]
        if (users.find((u) => u.email === userData.email)) {
          return false
        }
        // Generate verification code
        const verifikacijskiKod = Math.floor(100000 + Math.random() * 900000).toString()
        const newUserData = {
          ...userData,
          emailVerificiran: false,
          verifikacijskiKod,
        }
        const { lozinka: _, ...userWithoutPassword } = newUserData
        set({
          users: [...users, newUserData],
          user: userWithoutPassword,
          isAuthenticated: true,
        })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      deleteAccount: (email) => {
        const currentUser = get().user
        // Delete all user data
        set({
          // Remove user from users list
          users: get().users.filter(u => u.email !== email),
          // Remove all jobs created by this user
          jobs: get().jobs.filter(j => j.vlasnik !== email && j.cistacica !== email),
          // Remove all reviews related to this user
          reviews: get().reviews.filter(r => r.cistacica !== email && r.vlasnik !== email),
          // If this is the currently logged-in user, log them out
          user: currentUser?.email === email ? null : currentUser,
          isAuthenticated: currentUser?.email === email ? false : get().isAuthenticated,
        })
      },

      updateProfileImage: (email, imageUrl) => {
        set({
          users: get().users.map((u) =>
            u.email === email ? { ...u, slika: imageUrl, slikaVerificiran: true } : u
          ),
          user: get().user?.email === email 
            ? { ...get().user!, slika: imageUrl, slikaVerificiran: true }
            : get().user,
        })
      },

      updateUserSpol: (email, spol) => {
        set({
          users: get().users.map((u) =>
            u.email === email ? { ...u, spol } : u
          ),
          user: get().user?.email === email
            ? { ...get().user!, spol }
            : get().user,
        })
      },

      verifyEmail: (kod) => {
        const user = get().user
        if (!user) return false
        
        const users = get().users as (User & { lozinka: string; verifikacijskiKod?: string })[]
        const foundUser = users.find(u => u.email === user.email)
        
        if (foundUser && foundUser.verifikacijskiKod === kod) {
          set({
            users: users.map(u => 
              u.email === user.email 
                ? { ...u, emailVerificiran: true, verifikacijskiKod: undefined }
                : u
            ),
            user: { ...user, emailVerificiran: true, verifikacijskiKod: undefined },
          })
          return true
        }
        return false
      },

      resendVerificationCode: () => {
        const user = get().user
        if (!user) return ""
        
        const newCode = Math.floor(100000 + Math.random() * 900000).toString()
        const users = get().users as (User & { lozinka: string })[]
        
        set({
          users: users.map(u => 
            u.email === user.email 
              ? { ...u, verifikacijskiKod: newCode }
              : u
          ),
          user: { ...user, verifikacijskiKod: newCode },
        })
        return newCode
      },

      createJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: Date.now().toString(),
          status: "OTVORENO",
          keywords: generateJobKeywords(jobData.grad, jobData.vrstaNekrtnine, jobData.opis),
        }
        set({ jobs: [...get().jobs, newJob] })
      },

      deleteJob: (id) => {
        set({ jobs: get().jobs.filter((j) => j.id !== id) })
      },

      // Čistač šalje zahtjev za posao
      requestJob: (id, cistacica) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, status: "ČEKA_ODOBRENJE" as JobStatus, cistacica } : j
          ),
        })
      },

      // Vlasnik odobrava čistača
      approveJob: (id) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, status: "ODOBRENO" as JobStatus } : j
          ),
        })
      },

      // Vlasnik odbija čistača
      rejectJob: (id) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, status: "OTVORENO" as JobStatus, cistacica: undefined } : j
          ),
        })
      },

      // Čistač započinje posao
      startJob: (id) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, status: "U_TIJEKU" as JobStatus } : j
          ),
        })
      },

      // Čistač završava posao - ide na recenziju
      completeJob: (id) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, status: "ČEKA_RECENZIJU" as JobStatus } : j
          ),
        })
      },

      // Vlasnik daje recenziju i završava posao
      submitReview: (id, ocjena, komentar) => {
        const job = get().jobs.find((j) => j.id === id)
        if (job && job.cistacica) {
          const newReview: Review = {
            id: Date.now().toString(),
            oglas_id: id,
            ocjenjeni: job.cistacica,
            ocjena,
            komentar,
            datum: new Date().toLocaleDateString("hr-HR"),
          }
          set({
            reviews: [...get().reviews, newReview],
            jobs: get().jobs.map((j) =>
              j.id === id ? { ...j, status: "ZAVRŠENO" as JobStatus } : j
            ),
          })
        }
      },

      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: Date.now().toString(),
          datum: new Date().toLocaleDateString("hr-HR"),
        }
        set({ reviews: [...get().reviews, newReview] })
      },

      getCleanerReviews: (email) => {
        return get().reviews.filter((r) => r.ocjenjeni === email)
      },

getAverageRating: (email) => {
  const reviews = get().reviews.filter((r) => r.ocjenjeni === email)
  if (reviews.length === 0) return 0
  return reviews.reduce((acc, r) => acc + r.ocjena, 0) / reviews.length
  },

  // Bug report actions
  submitBugReport: (report) => {
    const newReport: BugReport = {
      ...report,
      id: Date.now().toString(),
      datum: new Date().toLocaleDateString("hr-HR"),
      status: "novo",
    }
    set({ bugReports: [...get().bugReports, newReport] })
  },

  updateBugReportStatus: (id, status, odgovor) => {
    set({
      bugReports: get().bugReports.map((r) =>
        r.id === id ? { ...r, status, odgovor: odgovor || r.odgovor } : r
      ),
    })
  },

  // Saved properties actions
  saveProperty: (property) => {
    const user = get().user
    if (!user) return
    
    const newProperty: SavedProperty = {
      ...property,
      id: Date.now().toString(),
    }
    
    const updatedProperties = [...(user.savedProperties || []), newProperty]
    
    set({
      users: get().users.map((u) =>
        u.email === user.email ? { ...u, savedProperties: updatedProperties } : u
      ),
      user: { ...user, savedProperties: updatedProperties },
    })
  },

  deleteProperty: (id) => {
    const user = get().user
    if (!user) return
    
    const updatedProperties = (user.savedProperties || []).filter((p) => p.id !== id)
    
    set({
      users: get().users.map((u) =>
        u.email === user.email ? { ...u, savedProperties: updatedProperties } : u
      ),
      user: { ...user, savedProperties: updatedProperties },
    })
  },

  getSavedProperties: () => {
    const user = get().user
    return user?.savedProperties || []
  },
  }),
    {
      name: "cleanup-storage",
    }
  )
)
