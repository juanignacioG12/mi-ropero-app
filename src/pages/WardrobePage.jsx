import { useState, useMemo } from 'react'
import { useStore, CATEGORIES, USE_TYPES, SEASONS } from '../store'
import ClothingCard from '../components/ClothingCard'
import styles from './WardrobePage.module.css'

const ALL_FILTERS = [
  { label: 'Todo', value: '' },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ...USE_TYPES.map((t) => ({ label: t, value: t })),
  ...SEASONS.filter(s => s !== 'Todo el año').map((s) => ({ label: s, value: s })),
]

export default function WardrobePage() {
  const clothes = useStore((s) => s.clothes)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    return clothes.filter((c) => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      if (!filter) return matchSearch
      const vals = [c.category, c.type, c.season]
      return matchSearch && vals.some((v) => v === filter)
    })
  }, [clothes, search, filter])

  const total = clothes.length
  const used = clothes.filter((c) => c.uses > 0).length
  const never = total - used
  const totalUses = clothes.reduce((acc, c) => acc + c.uses, 0)

  return (
    <div className={styles.page}>
      {total > 0 && (
        <div className={styles.statsBar}>
          {[
            { label: 'Prendas', value: total, icon: '👗' },
            { label: 'Usadas', value: used, icon: '✅' },
            { label: 'Sin uso', value: never, icon: '💤' },
            { label: 'Usos', value: totalUses, icon: '📊' },
          ].map(({ label, value, icon }) => (
            <div key={label} className={styles.statPill}>
              <div className={styles.statVal}>{icon} {value}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          placeholder='Buscar prenda...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')}>×</button>
        )}
      </div>

      <div className={styles.filterScroll}>
        {ALL_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.chip} ${filter === f.value ? styles.chipActive : ''}`}
            onClick={() => setFilter(filter === f.value ? '' : f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>{clothes.length ? '🔎' : '👗'}</div>
          <div className={styles.emptyText}>
            {clothes.length
              ? 'No hay prendas con ese filtro'
              : 'Tu ropero está vacío.\n¡Tocá + para agregar tu primera prenda!'}
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}