import { useStore, CAT_EMOJI } from '../store'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AddHabitModal from '../components/AddHabitModal'
import AddClothingModal from '../components/AddClothingModal'
import HabitCalendar from '../components/HabitCalendar'
import toast from 'react-hot-toast'
import styles from './HomePage.module.css'

export default function HomePage() {
  const habits             = useStore((s) => s.habits)
  const clothes            = useStore((s) => s.clothes)
  const outfits             = useStore((s) => s.outfits)
  const getTodayRecords    = useStore((s) => s.getTodayRecords)
  const toggleHabit        = useStore((s) => s.toggleHabit)
  const wearOutfit         = useStore((s) => s.wearOutfit)

  const [showHabit, setShowHabit] = useState(false)
  const [showCloth, setShowCloth] = useState(false)

  const todayRecords  = getTodayRecords()
  const today         = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  const activeHabits   = habits.filter((h) => h.active)
  const topCloth       = [...clothes].sort((a, b) => b.uses - a.uses)[0]
  const lastOutfit      = outfits[0]

  return (
    <div className={styles.page}>
      {/* ── Fecha ── */}
      <div className={styles.dateBar}>
        <div className={styles.dateText}>{today}</div>
        <div className={styles.dateEmoji}>🌅</div>
      </div>

      {/* ── Hábitos de hoy ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Hábitos de hoy</div>
          <button className={styles.addBtn} onClick={() => setShowHabit(true)}>+ Agregar</button>
        </div>
        {activeHabits.length === 0 ? (
          <div className={styles.emptyCard} onClick={() => setShowHabit(true)}>
            <div className={styles.emptyIcon}>🎯</div>
            <div className={styles.emptyText}>Tocá para agregar tu primer hábito</div>
          </div>
        ) : (
          <div className={styles.habitList}>
            {activeHabits.map((h) => {
              const record = todayRecords[h.id]
              const done   = record?.status === 'completed'
              return (
                <div
                  key={h.id}
                  className={`${styles.habitRow} ${done ? styles.habitDone : styles.habitMissed}`}
                  onClick={() => { toggleHabit(h.id); toast(done ? `❌ ${h.name} marcado como no realizado` : `✅ ${h.name} completado`) }}
                >
                  <span className={styles.habitIcon}>{h.icon}</span>
                  <span className={styles.habitName}>{h.name}</span>
                  <span className={styles.habitCheck}>{done ? '✅' : '❌'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Calendario de consistencia ── */}
      <HabitCalendar />

      {/* ── Outfit del día ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Outfit del día</div>
          <button className={styles.addBtn} onClick={() => setShowCloth(true)}>+ Prenda</button>
        </div>
        {lastOutfit ? (
          <div className={styles.outfitCard} onClick={() => { wearOutfit(lastOutfit.id); toast.success(`✓ Outfit "${lastOutfit.name}" usado hoy`) }}>
            <div className={styles.outfitName}>{lastOutfit.name}</div>
            <div className={styles.outfitPieces}>
              {lastOutfit.pieces.slice(0,4).map((pid) => {
                const p = clothes.find((c) => c.id === pid)
                return p ? (
                  <div key={pid} className={styles.outfitPiece}>
                    {p.img ? <img src={p.img} alt={p.name} className={styles.outfitPieceImg}/> : <span>{CAT_EMOJI[p.category]||'🧺'}</span>}
                  </div>
                ) : null
              })}
            </div>
            <div className={styles.outfitCta}>Tocar para registrar uso</div>
          </div>
        ) : (
          <div className={styles.emptyCard} onClick={() => setShowCloth(true)}>
            <div className={styles.emptyIcon}>👗</div>
            <div className={styles.emptyText}>Agregá prendas para crear outfits</div>
          </div>
        )}
      </div>

      {/* ── Prenda más usada ── */}
      {topCloth && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Prenda favorita</div>
          <div className={styles.topClothCard}>
            <div className={styles.topClothImg}>
              {topCloth.img
                ? <img src={topCloth.img} alt={topCloth.name} className={styles.topClothPhoto}/>
                : <span style={{fontSize:36}}>{CAT_EMOJI[topCloth.category]||'🧺'}</span>
              }
            </div>
            <div className={styles.topClothInfo}>
              <div className={styles.topClothName}>{topCloth.name}</div>
              <div className={styles.topClothMeta}>{topCloth.category}{topCloth.color ? ` · ${topCloth.color}` : ''}</div>
              <div className={styles.topClothUses}>🏆 Usada {topCloth.uses} veces</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        Desarrollado por <span>Juan Ignacio García</span>
      </div>

      {showHabit && <AddHabitModal onClose={() => setShowHabit(false)} />}
      {showCloth && <AddClothingModal onClose={() => setShowCloth(false)} />}
    </div>
  )
}