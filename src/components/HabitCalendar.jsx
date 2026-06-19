import { useState } from 'react'
import { useStore } from '../store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, isSameMonth, isToday, isFuture } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './HabitCalendar.module.css'

const DAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

export default function HabitCalendar() {
  const habits       = useStore((s) => s.habits)
  const habitRecords = useStore((s) => s.habitRecords)
  const getCurrentStreak = useStore((s) => s.getCurrentStreak)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const activeHabits = habits.filter((h) => h.active)
  const streak       = getCurrentStreak()

  // ── Navegar meses ──
  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
    setSelectedDay(null)
  }
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(null) }

  // ── Días del mes ──
  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Lunes=0 ... Domingo=6
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7
  const blanks = Array(firstDayOfWeek).fill(null)

  // ── Estado de cada día ──
  const getDayStatus = (date) => {
    if (isFuture(date) && !isToday(date)) return 'future'
    const d = format(date, 'yyyy-MM-dd')
    const records = habitRecords[d]
    if (!records || !activeHabits.length) return 'empty'

    const completed = activeHabits.filter((h) => records[h.id]?.status === 'completed').length
    const total     = activeHabits.length
    const ratio     = completed / total

    if (ratio === 1)   return 'perfect'
    if (ratio >= 0.5)  return 'partial'
    return 'missed'
  }

  // ── Stats del mes ──
  const monthStats = days.reduce((acc, day) => {
    const s = getDayStatus(day)
    if (s === 'perfect') acc.perfect++
    else if (s === 'partial') acc.partial++
    else if (s === 'missed')  acc.missed++
    return acc
  }, { perfect: 0, partial: 0, missed: 0 })

  const totalTracked = monthStats.perfect + monthStats.partial + monthStats.missed
  const compliance   = totalTracked
    ? Math.round((monthStats.perfect / totalTracked) * 100)
    : 0

  // ── Mejor racha ──
  const getBestStreak = () => {
    let best = 0, current = 0
    const allDates = Object.keys(habitRecords).sort()
    allDates.forEach((d) => {
      const records = habitRecords[d]
      const allDone = activeHabits.every((h) => records[h.id]?.status === 'completed')
      if (allDone) { current++; best = Math.max(best, current) }
      else current = 0
    })
    return best
  }
  const bestStreak = getBestStreak()

  // ── Detalle del día seleccionado ──
  const getDayDetail = (date) => {
    const d = format(date, 'yyyy-MM-dd')
    const records = habitRecords[d] || {}
    return activeHabits.map((h) => ({
      ...h,
      status: records[h.id]?.status || 'completed'
    }))
  }

  const statusColors = {
    perfect: '#4E8EA2',
    partial: '#d4a853',
    missed:  '#c0504a',
    empty:   'rgba(189,216,233,0.1)',
    future:  'transparent',
  }

  const statusLabels = {
    perfect: 'Perfecto',
    partial: 'Parcial',
    missed:  'Fallado',
    empty:   'Sin datos',
    future:  '',
  }

  return (
    <div className={styles.wrap}>
      {/* ── Navegación ── */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prevMonth}>‹</button>
        <div className={styles.navCenter}>
          <div className={styles.monthName}>
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </div>
          <button className={styles.todayBtn} onClick={goToday}>Hoy</button>
        </div>
        <button className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>

      {/* ── Días de la semana ── */}
      <div className={styles.weekDays}>
        {DAYS.map((d) => <div key={d} className={styles.weekDay}>{d}</div>)}
      </div>

      {/* ── Grilla del mes ── */}
      <div className={styles.grid}>
        {blanks.map((_, i) => <div key={`b${i}`} className={styles.blank} />)}
        {days.map((day) => {
          const status   = getDayStatus(day)
          const isSelect = selectedDay && format(selectedDay,'yyyy-MM-dd') === format(day,'yyyy-MM-dd')
          const todayDay = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={`${styles.day} ${todayDay ? styles.dayToday : ''} ${isSelect ? styles.daySelected : ''} ${status === 'future' ? styles.dayFuture : ''}`}
              onClick={() => status !== 'future' && setSelectedDay(isSelect ? null : day)}
            >
              <div
                className={styles.dayDot}
                style={{ background: statusColors[status] }}
              />
              <span className={styles.dayNum}>{format(day, 'd')}</span>
            </div>
          )
        })}
      </div>

      {/* ── Leyenda ── */}
      <div className={styles.legend}>
        {[['perfect','#4E8EA2','Perfecto'],['partial','#d4a853','Parcial'],['missed','#c0504a','Fallado']].map(([k,c,l]) => (
          <span key={k} className={styles.legItem}>
            <span className={styles.legDot} style={{background:c}}/>
            {l}
          </span>
        ))}
      </div>

      {/* ── Detalle día seleccionado ── */}
      {selectedDay && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <div className={styles.detailDate}>
              {format(selectedDay, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
            <div className={styles.detailStatus} style={{color: statusColors[getDayStatus(selectedDay)]}}>
              {statusLabels[getDayStatus(selectedDay)]}
            </div>
          </div>
          <div className={styles.detailList}>
            {getDayDetail(selectedDay).map((h) => (
              <div key={h.id} className={styles.detailRow}>
                <span className={styles.detailIcon}>{h.icon}</span>
                <span className={styles.detailName}>{h.name}</span>
                <span>{h.status === 'completed' ? '✅' : '❌'}</span>
              </div>
            ))}
            {activeHabits.length === 0 && (
              <div className={styles.detailEmpty}>Sin hábitos registrados</div>
            )}
          </div>
        </div>
      )}

      {/* ── Stats del mes ── */}
      <div className={styles.statsTitle}>
        {format(currentDate, 'MMMM', { locale: es })} en números
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{borderColor:'#4E8EA244'}}>
          <div className={styles.statNum} style={{color:'#4E8EA2'}}>{monthStats.perfect}</div>
          <div className={styles.statLabel}>Días perfectos</div>
        </div>
        <div className={styles.statCard} style={{borderColor:'#d4a85344'}}>
          <div className={styles.statNum} style={{color:'#d4a853'}}>{monthStats.partial}</div>
          <div className={styles.statLabel}>Días parciales</div>
        </div>
        <div className={styles.statCard} style={{borderColor:'#c0504a44'}}>
          <div className={styles.statNum} style={{color:'#c0504a'}}>{monthStats.missed}</div>
          <div className={styles.statLabel}>Días fallados</div>
        </div>
        <div className={styles.statCard} style={{borderColor:'var(--border2)'}}>
          <div className={styles.statNum} style={{color:'var(--accent)'}}>{compliance}%</div>
          <div className={styles.statLabel}>Cumplimiento</div>
        </div>
        <div className={styles.statCard} style={{borderColor:'var(--border2)'}}>
          <div className={styles.statNum} style={{color:'var(--accent)'}}>🔥 {streak}</div>
          <div className={styles.statLabel}>Racha actual</div>
        </div>
        <div className={styles.statCard} style={{borderColor:'var(--border2)'}}>
          <div className={styles.statNum} style={{color:'var(--accent)'}}>🏆 {bestStreak}</div>
          <div className={styles.statLabel}>Mejor racha</div>
        </div>
      </div>
    </div>
  )
}