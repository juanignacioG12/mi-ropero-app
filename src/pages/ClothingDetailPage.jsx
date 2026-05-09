import { useParams, useNavigate } from 'react-router-dom'
import { useStore, CAT_EMOJI, COLORS } from '../store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import styles from './ClothingDetailPage.module.css'

export default function ClothingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clothes = useStore((s) => s.clothes)
  const markUsed = useStore((s) => s.markUsed)
  const deleteClothing = useStore((s) => s.deleteClothing)

  const item = clothes.find((c) => c.id === id)
  if (!item) { navigate('/ropero'); return null }

  const emoji = CAT_EMOJI[item.category] || '🧺'
  const colorDef = COLORS.find((c) => c.name === item.color)
  const lastDate = item.history.length ? new Date(item.history[item.history.length - 1]) : null

  const handleMarkUsed = () => { markUsed(item.id); toast.success('¡Uso registrado! 👕') }
  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar "${item.name}" del ropero?`)) return
    deleteClothing(item.id)
    navigate('/ropero')
    toast('Prenda eliminada')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Volver</button>

      <div className={styles.imgWrap}>
        {item.img ? <img src={item.img} alt={item.name} className={styles.img} /> : <div className={styles.placeholder}>{emoji}</div>}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.name}>{item.name}</h1>
            <div className={styles.meta}>{item.category}{item.season ? ` · ${item.season}` : ''}{item.type ? ` · ${item.type}` : ''}</div>
          </div>
          {colorDef && <div className={styles.colorBadge} style={{ background: colorDef.hex + '22', color: colorDef.hex }}>{item.color}</div>}
        </div>

        {item.notes && <p className={styles.notes}>{item.notes}</p>}

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>{item.uses}</div>
            <div className={styles.statLabel}>Usos totales</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ fontSize: lastDate ? 13 : 20 }}>
              {lastDate ? format(lastDate, 'd MMM yy', { locale: es }) : '—'}
            </div>
            <div className={styles.statLabel}>Último uso</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ fontSize: 12 }}>{format(new Date(item.createdAt), 'd MMM yy', { locale: es })}</div>
            <div className={styles.statLabel}>Agregada</div>
          </div>
        </div>

        <button className={styles.btnUse} onClick={handleMarkUsed}>✓ Usé hoy</button>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Historial de uso</div>
          {item.history.length === 0 ? (
            <p className={styles.emptyHist}>Aún no registraste ningún uso.</p>
          ) : (
            <div className={styles.histList}>
              {[...item.history].reverse().map((h, i) => (
                <div key={i} className={styles.histEntry}>
                  <div className={styles.histDot} />
                  <div className={styles.histDate}>{format(new Date(h), "EEEE d 'de' MMMM, yyyy", { locale: es })}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={styles.btnDelete} onClick={handleDelete}>🗑 Eliminar prenda</button>
      </div>
    </div>
  )
}