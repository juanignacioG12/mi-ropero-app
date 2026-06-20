
 import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import styles from './HabitCalendar.module.css'

const DAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

export default function HabitCalendar() {
  const habits           = useStore((s) => s.habits)
  const habitRecords     = useStore((s) => s.habitRecords)
  const getCurrentStreak = useStore((s) => s.getCurrentStreak)
  const toggleHabit      = useStore((s) => s.toggleHabit)

  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    setCurrentDate(new Date())
    setMounted(true)
  }, [])

  if (!mounted || !currentDate) {
    return <div className={styles.wrap}><div style={{padding: 40, textAlign: 'center', color: 'var(--text3)'}}>Cargando calendario...</div></div>
  }

  const activeHabits = habits.filter((h) => h.active)
  const streak       = getCurrentStreak()
  const todayStr     = format(new Date(), 'yyyy-MM-dd')

  const prevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); setSelectedDay(null) }
  const nextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); setSelectedDay(null) }
  const goToday   = () => { setCurrentDate(new Date()); setSelectedDay(null) }

  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7
  const blanks = Array(firstDayOfWeek).fill(null)

  const getDayStatus = (date) => {
    const d = format(date, 'yyyy-MM-dd')
    if (d > todayStr) return 'future'
    const records = habitRecords[d]
    if (!records || !activeHabits.length) return 'empty'
    const completed = activeHabits.filter((h) => records[h.id]?.status === 'completed').length
    const total = activeHabits.length
    const ratio = completed / total
    if (ratio === 1) return 'perfect'
    if (ratio >= 0.5) return 'partial'
    return 'missed'
  }

  const monthStats = days.reduce((acc, day) => {
    const s = getDayStatus(day)
    if (s === 'perfect') acc.perfect++
    else if (s === 'partial') acc.partial++
    else if (s === 'missed') acc.missed++
    return acc
  }, { perfect: 0, partial: 0, missed: 0 })

  const totalTracked = monthStats.perfect + monthStats.partial + monthStats.missed
  const compliance = totalTracked ? Math.round((monthStats.perfect / totalTracked) * 100) : 0

  const getBestStreak = () => {
    let best = 0, current = 0
    const allDates = Object.keys(habitRecords).sort()
    allDates.forEach((d) => {
      const records = habitRecords[d]
      const allDone = activeHabits.length > 0 && activeHabits.every((h) => records[h.id]?.status === 'completed')
      if (allDone) { current++; best = Math.max(best, current) }
      else current = 0
    })
    return best
  }
  const bestStreak = getBestStreak()

  const getDayDetail = (dateStr) => {
    const records = habitRecords[dateStr] || {}
    return activeHabits.map((h) => ({ ...h, status: records[h.id]?.status || 'completed' }))
  }

  const handleToggleInDay = (habitId, habitName, currentStatus) => {
    toggleHabit(habitId, selectedDay)
    toast(currentStatus === 'completed' ? `❌ ${habitName} marcado como no realizado` : `✅ ${habitName} marcado como completado`)
  }

  const statusColors = {
    perfect: '#4E8EA2', partial: '#d4a853', missed: '#c0504a',
    empty: 'rgba(189,216,233,0.1)', future: 'transparent',
  }
  const statusLabels = {
    perfect: 'Perfecto', partial: 'Parcial', missed: 'Fallado', empty: 'Sin datos', future: '',
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prevMonth}>‹</button>
        <div className={styles.navCenter}>
          <div className={styles.monthName}>{format(currentDate, 'MMMM yyyy', { locale: es })}</div>
          <button className={styles.todayBtn} onClick={goToday}>Hoy</button>
        </div>
        <button className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div className={styles.weekDays}>
        {DAYS.map((d) => <div key={d} className={styles.weekDay}>{d}</div>)}
      </div>

      <div className={styles.grid}>
        {blanks.map((_, i) => <div key={`b${i}`} className={styles.blank} />)}
        {days.map((day) => {
          const status = getDayStatus(day)
          const dayStr = format(day, 'yyyy-MM-dd')
          const isSelect = selectedDay === dayStr
          const isToday = dayStr === todayStr
          return (
            <div
              key={dayStr}
              className={`${styles.day} ${isToday ? styles.dayToday : ''} ${isSelect ? styles.daySelected : ''} ${status === 'future' ? styles.dayFuture : ''}`}
              onClick={() => status !== 'future' && setSelectedDay(isSelect ? null : dayStr)}
            >
              <div className={styles.dayDot} style={{ background: statusColors[status] }} />
              <span className={styles.dayNum}>{format(day, 'd')}</span>
            </div>
          )
        })}
      </div>

      <div className={styles.legend}>
        {[['perfect','#4E8EA2','Perfecto'],['partial','#d4a853','Parcial'],['missed','#c0504a','Fallado']].map(([k,c,l]) => (
          <span key={k} className={styles.legItem}>
            <span className={styles.legDot} style={{background:c}}/>{l}
          </span>
        ))}
      </div>

      {selectedDay && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <div className={styles.detailDate}>
              {format(new Date(selectedDay + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
            <div className={styles.detailStatus} style={{color: statusColors[getDayStatus(new Date(selectedDay + 'T12:00:00'))]}}>
              {statusLabels[getDayStatus(new Date(selectedDay + 'T12:00:00'))]}
            </div>
          </div>
          <div className={styles.detailHint}>Tocá un hábito para corregir su estado ese día</div>
          <div className={styles.detailList}>
            {getDayDetail(selectedDay).map((h) => (
              <div
                key={h.id}
                className={`${styles.detailRow} ${styles.detailRowClickable}`}
                onClick={() => handleToggleInDay(h.id, h.name, h.status)}
              >
                <span className={styles.detailIcon}>{h.icon}</span>
                <span className={styles.detailName}>{h.name}</span>
                <span className={styles.detailToggle}>{h.status === 'completed' ? '✅' : '❌'}</span>
              </div>
            ))}
            {activeHabits.length === 0 && <div className={styles.detailEmpty}>Sin hábitos registrados</div>}
          </div>
        </div>
      )}

      <div className={styles.statsTitle}>{format(currentDate, 'MMMM', { locale: es })} en números</div>
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