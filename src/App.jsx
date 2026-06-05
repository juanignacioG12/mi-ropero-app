import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import HabitsPage from './pages/HabitsPage'
import WardrobePage from './pages/WardrobePage'
import StatsPage from './pages/StatsPage'
import OutfitsPage from './pages/OutfitsPage'
import ClothingDetailPage from './pages/ClothingDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="inicio"   element={<HomePage />} />
        <Route path="habitos"  element={<HabitsPage />} />
        <Route path="ropero"   element={<WardrobePage />} />
        <Route path="ropero/:id" element={<ClothingDetailPage />} />
        <Route path="stats"    element={<StatsPage />} />
        <Route path="outfits"  element={<OutfitsPage />} />
      </Route>
    </Routes>
  )
}