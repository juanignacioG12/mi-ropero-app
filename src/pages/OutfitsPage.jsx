import { useState } from 'react'
import { useStore, CAT_EMOJI } from '../store'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './OutfitsPage.module.css'
import modalStyles from '../components/Modal.module.css'

export default function OutfitsPage() {
  const clothes = useStore((s) => s.clothes)
  const outfits = useStore((s) => s.outfits)
  const addOutfit = useStore((s) => s.addOutfit)
  const deleteOutfit = useStore((s) => s.deleteOutfit)
  const wearOutfit = useStore((s) => s.wearOutfit)

  const [showModal, setShowModal] = useState(false)
  const [outfitName, setOutfitName] = useState('')
  const [selected, setSelected] = useState([])

  const togglePiece = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!outfitName.trim()) { toast.error('Poné un nombre al outfit'); return }
    if (selected.length < 2) { toast.error('Seleccioná al menos 2 prendas'); return }
    addOutfit(outfitName.trim(), selected)
    toast.success(`Outfit "${outfitName}" guardado`)
    setShowModal(false)
    setOutfitName('')
    setSelected([])
  }

  const handleWear = (o) => {
    wearOutfit(o.id)
    toast.success(`✓ Outfit "${o.name}" registrado como usado`)
  }

  const handleDelete = (o) => {
    if (!window.confirm(`¿Eliminar el outfit "${o.name}"?`)) return
    deleteOutfit(o.id)
    toast('Outfit eliminado')
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Mis Outfits</div>
          <div className={styles.pageSub}>{outfits.length} combinaciones guardadas</div>
        </div>
        <button className={styles.newBtn} onClick={() => setShowModal(true)}>+ Nuevo</button>
      </div>

      {outfits.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✨</div>
          <div className={styles.emptyText}>Creá tu primer outfit combinando prendas de tu ropero.</div>
          <button className={styles.newBtn} style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>Crear outfit</button>
        </div>
      ) : (
        <div className={styles.list}>
          {outfits.map((o) => {
            const pieces = o.pieces.map((id) => clothes.find((c) => c.id === id)).filter(Boolean)
            return (
              <div key={o.id} className={styles.outfitCard}>
                <div className={styles.outfitHeader}>
                  <div>
                    <div className={styles.outfitName}>{o.name}</div>
                    <div className={styles.outfitMeta}>
                      {format(new Date(o.createdAt), "d MMM yyyy", { locale: es })}
                      {o.timesWorn > 0 && ` · Usado ${o.timesWorn} ${o.timesWorn === 1 ? 'vez' : 'veces'}`}
                    </div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(o)}>×</button>
                </div>
                <div className={styles.pieces}>
                  {pieces.map((p) => (
                    <div key={p.id} className={styles.piece} title={p.name}>
                      {p.img ? <img src={p.img} alt={p.name} className={styles.pieceImg} /> : <div className={styles.pieceEmoji}>{CAT_EMOJI[p.category] || '🧺'}</div>}
                    </div>
                  ))}
                </div>
                <div className={styles.pieceNames}>{pieces.map((p) => p.name).join(' · ')}</div>
                <button className={styles.wearBtn} onClick={() => handleWear(o)}>✓ Usar este outfit hoy</button>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={modalStyles.sheet}>
            <div className={modalStyles.handle} />
            <h2 className={modalStyles.title}>Crear Outfit</h2>
            <div className={modalStyles.section}>
              <label className={modalStyles.label}>Nombre del outfit</label>
              <input className={modalStyles.input} placeholder='ej: Look casual verano' value={outfitName} onChange={(e) => setOutfitName(e.target.value)} maxLength={60} />
            </div>
            <div className={modalStyles.section}>
              <label className={modalStyles.label}>Elegí las prendas ({selected.length} seleccionadas)</label>
              {clothes.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--text3)' }}>Primero agregá prendas a tu ropero.</p>
              ) : (
                <div className={styles.selectGrid}>
                  {clothes.map((c) => (
                    <div key={c.id} className={`${styles.selectItem} ${selected.includes(c.id) ? styles.selectItemActive : ''}`} onClick={() => togglePiece(c.id)}>
                      <div className={styles.selectEmoji}>
                        {c.img ? <img src={c.img} alt={c.name} className={styles.selectThumb} /> : CAT_EMOJI[c.category] || '🧺'}
                      </div>
                      <div className={styles.selectName}>{c.name}</div>
                      {selected.includes(c.id) && <div className={styles.selectCheck}>✓</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className={modalStyles.btnPrimary} onClick={handleSave}>✓ Guardar Outfit</button>
            <button className={modalStyles.btnSecondary} onClick={() => { setShowModal(false); setSelected([]); setOutfitName('') }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}