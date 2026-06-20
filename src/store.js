import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

export const CATEGORIES = [
  'Remera', 'Camisa', 'Pantalón', 'Jean', 'Zapatilla',
  'Zapato', 'Campera', 'Buzo', 'Vestido', 'Shorts',
  'Abrigo', 'Accesorio', 'Otro',
]
export const USE_TYPES = ['Diario', 'Salir', 'Deporte', 'Trabajo', 'Casual']
export const SEASONS = ['Verano', 'Otoño', 'Invierno', 'Primavera', 'Todo el año']
export const COLORS = [
  { name: 'Blanco',   hex: '#f5f5f0' },
  { name: 'Negro',    hex: '#1a1a1a' },
  { name: 'Gris',     hex: '#888880' },
  { name: 'Marino',   hex: '#1e3a5f' },
  { name: 'Azul',     hex: '#2a6abf' },
  { name: 'Celeste',  hex: '#5da8d4' },
  { name: 'Rojo',     hex: '#c0402e' },
  { name: 'Rosa',     hex: '#d4607a' },
  { name: 'Verde',    hex: '#3a7d4a' },
  { name: 'Amarillo', hex: '#d4a020' },
  { name: 'Naranja',  hex: '#c86020' },
  { name: 'Beige',    hex: '#c8b490' },
  { name: 'Marrón',   hex: '#7a5030' },
  { name: 'Violeta',  hex: '#6a4abf' },
]
export const CAT_EMOJI = {
  Remera: '👕', Camisa: '👔', Pantalón: '👖', Jean: '👖',
  Zapatilla: '👟', Zapato: '👞', Campera: '🧥', Buzo: '🧸',
  Vestido: '👗', Shorts: '🩲', Abrigo: '🧥', Accesorio: '💍', Otro: '🧺',
}

export const HABIT_CATEGORIES = ['Salud', 'Deporte', 'Estudio', 'Trabajo', 'Mente', 'Otro']
export const HABIT_ICONS = ['💪', '📚', '🧘', '💧', '🏃', '✍️', '🎯', '🌅', '🥗', '😴']

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export const useStore = create(
  persist(
    (set, get) => ({
      // ── ROPA ──
      clothes: [],
      outfits: [],

      addClothing: (data) => {
        const item = {
          id: genId(), name: data.name, category: data.category,
          season: data.season || '', type: data.type || '',
          color: data.color || '', notes: data.notes || '',
          img: data.img || '', createdAt: new Date().toISOString(),
          uses: 0, history: [],
        }
        set((s) => ({ clothes: [item, ...s.clothes] }))
        return item
      },

      updateClothing: (id, data) => {
        set((s) => ({ clothes: s.clothes.map((c) => c.id === id ? { ...c, ...data } : c) }))
      },

      deleteClothing: (id) => {
        set((s) => ({
          clothes: s.clothes.filter((c) => c.id !== id),
          outfits: s.outfits.map((o) => ({ ...o, pieces: o.pieces.filter((pid) => pid !== id) })).filter((o) => o.pieces.length >= 1),
        }))
      },

      markUsed: (id) => {
        const today = new Date().toISOString()
        set((s) => ({
          clothes: s.clothes.map((c) => c.id === id ? { ...c, uses: c.uses + 1, history: [...c.history, today] } : c)
        }))
      },

      addOutfit: (name, pieceIds) => {
        const outfit = { id: genId(), name, pieces: pieceIds, createdAt: new Date().toISOString(), timesWorn: 0 }
        set((s) => ({ outfits: [outfit, ...s.outfits] }))
        return outfit
      },

      deleteOutfit: (id) => set((s) => ({ outfits: s.outfits.filter((o) => o.id !== id) })),

      wearOutfit: (id) => {
        const outfit = get().outfits.find((o) => o.id === id)
        if (!outfit) return
        outfit.pieces.forEach((pid) => get().markUsed(pid))
        set((s) => ({ outfits: s.outfits.map((o) => o.id === id ? { ...o, timesWorn: o.timesWorn + 1 } : o) }))
      },

      getStatsByCategory: () => {
        const { clothes } = get()
        const map = {}
        clothes.forEach((c) => {
          if (!map[c.category]) map[c.category] = { total: 0, uses: 0 }
          map[c.category].total++
          map[c.category].uses += c.uses
        })
        return Object.entries(map).map(([cat, data]) => ({ cat, ...data })).sort((a, b) => b.uses - a.uses)
      },

      getStatsByType: () => {
        const { clothes } = get()
        const map = {}
        clothes.forEach((c) => {
          const t = c.type || 'Sin tipo'
          if (!map[t]) map[t] = 0
          map[t] += c.uses
        })
        return Object.entries(map).map(([type, uses]) => ({ type, uses })).sort((a, b) => b.uses - a.uses)
      },

      // ── HÁBITOS ──
      habits: [],
      habitRecords: {},

      addHabit: (data) => {
        const habit = {
          id: genId(),
          name: data.name,
          icon: data.icon || '🎯',
          category: data.category || 'Otro',
          color: data.color || '#7BBDE8',
          frequency: data.frequency || 'daily',
          active: true,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ habits: [habit, ...s.habits] }))
        get().generateTodayRecords()
        return habit
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },

      // Generar registros del día (completados por defecto)
      generateTodayRecords: () => {
        const { habits, habitRecords } = get()
        const today = todayStr()
        const todayRecords = { ...(habitRecords[today] || {}) }
        let changed = false

        habits.filter((h) => h.active).forEach((h) => {
          if (!todayRecords[h.id]) {
            todayRecords[h.id] = {
              id: genId(),
              habitId: h.id,
              date: today,
              status: 'completed',
              createdAutomatically: true,
              updatedAt: new Date().toISOString(),
            }
            changed = true
          }
        })

        if (changed) {
          set((s) => ({ habitRecords: { ...s.habitRecords, [today]: todayRecords } }))
        }
      },

      // Marcar hábito como missed o completado (toggle)
   
toggleHabit: (habitId, date) => {
  const { habitRecords } = get()
  const d = date || todayStr()
  const dayRecords = { ...(habitRecords[d] || {}) }
  const current = dayRecords[habitId]

  // Si no existe el registro para ese día, lo creamos como "completed" antes de togglear
  const currentStatus = current ? current.status : 'completed'

  dayRecords[habitId] = {
    id: current?.id || `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    habitId,
    date: d,
    status: currentStatus === 'completed' ? 'missed' : 'completed',
    createdAutomatically: !current,
    updatedAt: new Date().toISOString(),
  }

  set((s) => ({ habitRecords: { ...s.habitRecords, [d]: dayRecords } }))
},
      // Obtener registros de hoy
      getTodayRecords: () => {
        const { habitRecords } = get()
        return habitRecords[todayStr()] || {}
      },

      // Racha actual (días consecutivos perfectos)
      getCurrentStreak: () => {
        const { habitRecords, habits } = get()
        if (!habits.length) return 0
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 365; i++) {
          const d = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd')
          const records = habitRecords[d] || {}
          const activeHabits = habits.filter((h) => h.active)
          if (!activeHabits.length) break

          const allCompleted = activeHabits.every((h) => records[h.id]?.status === 'completed')
          if (allCompleted) streak++
          else if (i > 0) break
        }
        return streak
      },

      // Días acumulados completados
      getTotalCompletedDays: () => {
        const { habitRecords, habits } = get()
        if (!habits.length) return 0
        let total = 0
        Object.entries(habitRecords).forEach(([date, records]) => {
          const activeHabits = habits.filter((h) => h.active)
          if (!activeHabits.length) return
          const allCompleted = activeHabits.every((h) => records[h.id]?.status === 'completed')
          if (allCompleted) total++
        })
        return total
      },

      // Datos del calendario (últimos 70 días)
      getCalendarData: () => {
        const { habitRecords, habits } = get()
        const days = []
        const today = new Date()

        for (let i = 69; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 86400000)
          const d = format(date, 'yyyy-MM-dd')
          const records = habitRecords[d] || {}
          const activeHabits = habits.filter((h) => h.active)

          if (!activeHabits.length || !habitRecords[d]) {
            days.push({ date: d, status: 'empty' })
            continue
          }

          const completed = activeHabits.filter((h) => records[h.id]?.status === 'completed').length
          const total = activeHabits.length
          const ratio = completed / total

          let status = 'empty'
          if (ratio === 1) status = 'perfect'
          else if (ratio >= 0.5) status = 'partial'
          else status = 'missed'

          days.push({ date: d, status, completed, total })
        }
        return days
      },
    }),
    { name: 'gotostart-v1' }
  )
)