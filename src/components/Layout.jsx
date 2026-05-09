import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { useState } from 'react'
import AddClothingModal from './AddClothingModal'
import styles from './Layout.module.css'

const IconHome  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconChart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconGrid  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const IconPlus  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

export default function Layout() {
  const clothes = useStore((s) => s.clothes)
  const [showAdd, setShowAdd] = useState(false)
  const location = useLocation()

  const subtitles = {
    '/ropero':  `${clothes.length} prenda${clothes.length !== 1 ? 's' : ''} en tu armario`,
    '/stats':   'Analizá tu uso',
    '/outfits': 'Tus combinaciones',
  }
  const currentBase = '/' + location.pathname.split('/')[1]
  const subtitle = subtitles[currentBase] || 'Tu armario digital'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>mi<span>ropero</span></div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <IconPlus />
        </button>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <NavLink to="/ropero" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconHome />
          <span>Ropero</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconChart />
          <span>Stats</span>
        </NavLink>
        <NavLink to="/outfits" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <IconGrid />
          <span>Outfits</span>
        </NavLink>
      </nav>

      <button className={styles.fab} onClick={() => setShowAdd(true)}>
        <IconPlus />
      </button>
<footer className={styles.footer}>
  Desarrollado por <span>Juan Ignacio García</span>
</footer>
      {showAdd && <AddClothingModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}