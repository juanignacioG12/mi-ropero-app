import { useState } from 'react'
import { useStore } from '../store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import AddHabitModal from '../components/AddHabitModal'
import styles from './HabitsPage.module.css'

export default function HabitsPage() {
  const habits          = useStore((s) => s.habits)
  const deleteHabit     = useStore((s) => s.deleteHabit)
  const getTodayRecords = useStore((s) => s.getTodayRecords)
  const toggleHabit     = useStore((s) => s.toggleHabit)
  const getCurrentStreak   = useStore((s) => s.getCurrentStreak)
  const getTotalCompletedDays = useStore((s) => s.getTotalCompletedDays)
  const getCalendarData = useStore((s) => s.getCalendarData)
  const habitRecords    = useStore((s) => s.habitRecords)

  const [showModal, setShowModal] = useState(false)
  const [tab, setTab]             = useState('hoy')

  const todayRecords = getTodayRecords()
  const streak       = getCurrentStreak()
  const totalDays    = getTotalCompletedDays()
  const calendarData = getCalendarData()
  const activeHabits = habits.filter((h) => h.active)

  const calendarColors = {
    perfect: '#4E8EA2',
    partial: '#7BBDE8',
    missed:  '#c0504a',
    empty:   'rgba(189,216,233,0.08)',
  }

  // Calcular tasa de cumplimiento por hábito
  const getHabitRate = (habitId) => {
    let completed = 0, total = 0
    Object.values(habitRecords).forEach((dayRecs) => {
      if (dayRecs[habitId]) {
        total++
        if (dayRecs[habitId].status === 'completed') completed++
      }
    })
    return total ? Math.round((completed / total) * 100) : 100
  }

  return (
    <div className={styles.page}>
      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {['hoy','stats','calendario'].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'hoy' ? 'Hoy' : t === 'stats' ? 'Estadísticas' : 'Calendario'}
          </button>
        ))}
      </div>

      {/* ── TAB: HOY ── */}
      {tab === 'hoy' && (
        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statNum}>{streak}</div>
              <div className={styles.statLabel}>Racha</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statNum}>{totalDays}</div>
              <div className={styles.statLabel}>Días perfectos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statNum}>{activeHabits.filter(h => todayRecords[h.id]?.status === 'completed').length}/{activeHabits.length}</div>
              <div className={styles.statLabel}>Hoy</div>
            </div>
          </div>

          <div className={styles.sectionTitle}>
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </div>

          {activeHabits.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎯</div>
              <div className={styles.emptyText}>No tenés hábitos activos.\nTocá + para agregar uno.</div>
            </div>
          ) : (
            <div className={styles.habitList}>
              {activeHabits.map((h) => {
                const done = todayRecords[h.id]?.status === 'completed'
                const rate = getHabitRate(h.id)
                return (
                  <div key={h.id} className={`${styles.habitRow} ${done ? styles.habitDone : styles.habitMissed}`}>
                    <div className={styles.habitLeft} onClick={() => { toggleHabit(h.id); toast(done ? `❌ ${h.name}` : `✅ ${h.name}`) }}>
                      <span className={styles.habitIcon}>{h.icon}</span>
                      <div>
                        <div className={styles.habitName}>{h.name}</div>
                        <div className={styles.habitRate}>{rate}% cumplimiento</div>
                      </div>
                    </div>
                    <div className={styles.habitRight}>
                      <span className={styles.habitCheck} onClick={() => { toggleHabit(h.id); toast(done ? `❌ ${h.name}` : `✅ ${h.name}`) }}>
                        {done ? '✅' : '❌'}
                      </span>
                      <button className={styles.deleteHabit} onClick={() => { if(window.confirm(`¿Eliminar "${h.name}"?`)) { deleteHabit(h.id); toast('Hábito eliminado') } }}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button className={styles.addHabitBtn} onClick={() => setShowModal(true)}>
            + Agregar hábito
          </button>
        </div>
      )}

      {/* ── TAB: STATS ── */}
      {tab === 'stats' && (
        <div className={styles.content}>
          <div className={styles.statsGrid}>
            <div className={styles.bigStat}>
              <div className={styles.bigNum}>{streak} 🔥</div>
              <div className={styles.bigLabel}>Racha actual</div>
            </div>
            <div className={styles.bigStat}>
              <div className={styles.bigNum}>{totalDays} 📅</div>
              <div className={styles.bigLabel}>Días perfectos acumulados</div>
            </div>
            <div className={styles.bigStat}>
              <div className={styles.bigNum}>{activeHabits.length} 🎯</div>
              <div className={styles.bigLabel}>Hábitos activos</div>
            </div>
          </div>

          <div className={styles.sectionTitle} style={{marginTop:20}}>Cumplimiento por hábito</div>
          {activeHabits.map((h) => {
            const rate = getHabitRate(h.id)
            return (
              <div key={h.id} className={styles.rateRow}>
                <span className={styles.rateIcon}>{h.icon}</span>
                <div className={styles.rateInfo}>
                  <div className={styles.rateName}>{h.name}</div>
                  <div className={styles.rateBar}>
                    <div className={styles.rateFill} style={{width:`${rate}%`}}/>
                  </div>
                </div>
                <div className={styles.rateNum}>{rate}%</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB: CALENDARIO ── */}
      {tab === 'calendario' && (
        <div className={styles.content}>
          <div className={styles.sectionTitle}>Últimos 70 días</div>
          <div className={styles.calendar}>
            {calendarData.map((day, i) => (
              <div
                key={i}
                className={styles.calDay}
                style={{ background: calendarColors[day.status] }}
                title={`${day.date}${day.completed !== undefined ? `: ${day.completed}/${day.total}` : ''}`}
              />
            ))}
          </div>
          <div className={styles.calLegend}>
            <span><span className={styles.legDot} style={{background:'#4E8EA2'}}/>Perfecto</span>
            <span><span className={styles.legDot} style={{background:'#7BBDE8'}}/>Parcial</span>
            <span><span className={styles.legDot} style={{background:'#c0504a'}}/>Fallado</span>
            <span><span className={styles.legDot} style={{background:'rgba(189,216,233,0.15)'}}/>Sin datos</span>
          </div>

          <div className={styles.sectionTitle} style={{marginTop:20}}>Resumen</div>
          <div className={styles.calSummary}>
            {['perfect','partial','missed'].map((s) => {
              const count = calendarData.filter(d => d.status === s).length
              const labels = { perfect:'Días perfectos', partial:'Días parciales', missed:'Días fallados' }
              const colors = { perfect:'#4E8EA2', partial:'#7BBDE8', missed:'#c0504a' }
              return (
                <div key={s} className={styles.calSumCard} style={{borderColor: colors[s]+'44'}}>
                  <div className={styles.calSumNum} style={{color: colors[s]}}>{count}</div>
                  <div className={styles.calSumLabel}>{labels[s]}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}
    </div>
  )
}