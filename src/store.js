import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export const useStore = create(
  persist(
    (set, get) => ({
      clothes: [],
      outfits: [],

      addClothing: (data) => {
        const item = {
          id: genId(),
          name: data.name,
          category: data.category,
          season: data.season || '',
          type: data.type || '',
          color: data.color || '',
          notes: data.notes || '',
          img: data.img || '',
          createdAt: new Date().toISOString(),
          uses: 0,
          history: [],
        }
        set((s) => ({ clothes: [item, ...s.clothes] }))
        return item
      },

      updateClothing: (id, data) => {
        set((s) => ({
          clothes: s.clothes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
      },

      deleteClothing: (id) => {
        set((s) => ({
          clothes: s.clothes.filter((c) => c.id !== id),
          outfits: s.outfits.map((o) => ({
            ...o,
            pieces: o.pieces.filter((pid) => pid !== id),
          })).filter((o) => o.pieces.length >= 1),
        }))
      },

      markUsed: (id) => {
        const today = new Date().toISOString()
        set((s) => ({
          clothes: s.clothes.map((c) =>
            c.id === id
              ? { ...c, uses: c.uses + 1, history: [...c.history, today] }
              : c
          ),
        }))
      },

      addOutfit: (name, pieceIds) => {
        const outfit = {
          id: genId(),
          name,
          pieces: pieceIds,
          createdAt: new Date().toISOString(),
          timesWorn: 0,
        }
        set((s) => ({ outfits: [outfit, ...s.outfits] }))
        return outfit
      },

      deleteOutfit: (id) => {
        set((s) => ({ outfits: s.outfits.filter((o) => o.id !== id) }))
      },

      wearOutfit: (id) => {
        const outfit = get().outfits.find((o) => o.id === id)
        if (!outfit) return
        outfit.pieces.forEach((pid) => get().markUsed(pid))
        set((s) => ({
          outfits: s.outfits.map((o) =>
            o.id === id ? { ...o, timesWorn: o.timesWorn + 1 } : o
          ),
        }))
      },

      getInsights: () => {
        const { clothes } = get()
        const now = Date.now()
        const day = 1000 * 60 * 60 * 24
        const insights = []

        const unused = clothes.filter((c) => c.uses === 0)
        if (unused.length)
          insights.push({
            type: 'warning', icon: '😴',
            title: `${unused.length} prenda${unused.length > 1 ? 's' : ''} sin usar`,
            desc: '¡Dale una oportunidad a algo nuevo!',
            items: unused.slice(0, 3).map((c) => c.name),
          })

        const stale = clothes.filter((c) => {
          if (!c.history.length) return false
          const last = new Date(c.history[c.history.length - 1]).getTime()
          return (now - last) / day > 30
        })
        if (stale.length)
          insights.push({
            type: 'info', icon: '⏰',
            title: `${stale.length} prenda${stale.length > 1 ? 's' : ''} sin usar hace +30 días`,
            desc: 'Quizás es hora de renovar o donar.',
            items: stale.slice(0, 3).map((c) => c.name),
          })

        const top = [...clothes].sort((a, b) => b.uses - a.uses)[0]
        if (top && top.uses > 0)
          insights.push({
            type: 'success', icon: '🏆',
            title: `Tu favorita: ${top.name}`,
            desc: `Usada ${top.uses} veces.`,
            items: [],
          })

        return insights
      },

      getStatsByCategory: () => {
        const { clothes } = get()
        const map = {}
        clothes.forEach((c) => {
          if (!map[c.category]) map[c.category] = { total: 0, uses: 0 }
          map[c.category].total++
          map[c.category].uses += c.uses
        })
        return Object.entries(map)
          .map(([cat, data]) => ({ cat, ...data }))
          .sort((a, b) => b.uses - a.uses)
      },

      getStatsByType: () => {
        const { clothes } = get()
        const map = {}
        clothes.forEach((c) => {
          const t = c.type || 'Sin tipo'
          if (!map[t]) map[t] = 0
          map[t] += c.uses
        })
        return Object.entries(map)
          .map(([type, uses]) => ({ type, uses }))
          .sort((a, b) => b.uses - a.uses)
      },
    }),
    { name: 'mi-ropero-v1' }
  )
)