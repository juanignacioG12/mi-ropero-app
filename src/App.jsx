import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WardrobePage from './pages/WardrobePage'
import StatsPage from './pages/StatsPage'
import OutfitsPage from './pages/OutfitsPage'
import ClothingDetailPage from './pages/ClothingDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/ropero" replace />} />
        <Route path="ropero" element={<WardrobePage />} />
        <Route path="ropero/:id" element={<ClothingDetailPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="outfits" element={<OutfitsPage />} />
      </Route>
    </Routes>
  )
}