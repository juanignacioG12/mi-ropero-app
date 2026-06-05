import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { useState, useEffect } from 'react'
import AddClothingModal from './AddClothingModal'
import AddHabitModal from './AddHabitModal'
import styles from './Layout.module.css'

const IconHome    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconHabits  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
const IconWardrobe= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
const IconStats   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

export default function Layout() {
  const clothes          = useStore((s) => s.clothes)
  const habits           = useStore((s) => s.habits)
  const generateTodayRecords = useStore((s) => s.generateTodayRecords)
  const [showAdd, setShowAdd]       = useState(false)
  const [showHabit, setShowHabit]   = useState(false)
  const location = useLocation()

  // Generar registros del día al abrir la app
  useEffect(() => { generateTodayRecords() }, [])

  const subtitles = {
    '/inicio':  'Tu día de un vistazo',
    '/habitos': `${habits.filter(h=>h.active).length} hábitos activos`,
    '/ropero':  `${clothes.length} prendas en tu armario`,
    '/stats':   'Analizá tu progreso',
    '/outfits': 'Tus combinaciones',
  }
  const currentBase = '/' + location.pathname.split('/')[1]
  const subtitle = subtitles[currentBase] || 'Tu vida organizada'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>goto<span>start</span></div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
        <div className={styles.headerBtns}>
          {(currentBase === '/habitos') && (
            <button className={styles.addBtn} onClick={() => setShowHabit(true)}>
              <IconPlus />
            </button>
          )}
          {(currentBase === '/ropero') && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <IconPlus />
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <NavLink to="/inicio" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconHome /><span>Inicio</span>
        </NavLink>
        <NavLink to="/habitos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconHabits /><span>Hábitos</span>
        </NavLink>
        <NavLink to="/ropero" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconWardrobe /><span>Ropero</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconStats /><span>Stats</span>
        </NavLink>
      </nav>

      {showAdd   && <AddClothingModal onClose={() => setShowAdd(false)} />}
      {showHabit && <AddHabitModal    onClose={() => setShowHabit(false)} />}
    </div>
  )
}