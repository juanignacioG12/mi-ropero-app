import { useNavigate } from 'react-router-dom'
import { useStore, CAT_EMOJI, COLORS } from '../store'
import toast from 'react-hot-toast'
import styles from './ClothingCard.module.css'

export default function ClothingCard({ item }) {
  const navigate = useNavigate()
  const markUsed = useStore((s) => s.markUsed)

  const emoji = CAT_EMOJI[item.category] || '🧺'
  const colorDef = COLORS.find((c) => c.name === item.color)

  const lastDate = item.history.length
    ? new Date(item.history[item.history.length - 1])
    : null

  const daysSince = lastDate
    ? Math.floor((Date.now() - lastDate.getTime()) / 86_400_000)
    : null

  const showAlert =
    (item.uses === 0 && (Date.now() - new Date(item.createdAt).getTime()) > 7 * 86_400_000) ||
    daysSince > 30

  const handleUse = (e) => {
    e.stopPropagation()
    markUsed(item.id)
    toast.success(`✓ Uso de "${item.name}" registrado`)
  }

  return (
    <div className={styles.card} onClick={() => navigate(`/ropero/${item.id}`)}>
      <div className={styles.imgWrap}>
        {item.img ? (
          <img src={item.img} alt={item.name} className={styles.img} />
        ) : (
          <div className={styles.placeholder}>{emoji}</div>
        )}
        <div className={styles.useCount}>{item.uses}×</div>
        <button className={styles.useBtn} onClick={handleUse}>✓</button>
        {showAlert && <div className={styles.alertDot} />}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.meta}>
          {item.category}{item.season ? ` · ${item.season}` : ''}
        </div>
        <div className={styles.tags}>
          {item.type && <span className={styles.tag}>{item.type}</span>}
          {colorDef && (
            <span className={styles.tag} style={{ background: colorDef.hex + '22', color: colorDef.hex }}>
              {item.color}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}