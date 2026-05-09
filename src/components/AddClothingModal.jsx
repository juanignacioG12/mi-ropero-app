import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useStore, CATEGORIES, USE_TYPES, SEASONS, COLORS, CAT_EMOJI } from '../store'
import styles from './Modal.module.css'

export default function AddClothingModal({ onClose }) {
  const addClothing = useStore((s) => s.addClothing)

  const [form, setForm] = useState({
    name: '', category: '', season: '', type: '', color: '', notes: '',
  })
  const [imgData, setImgData] = useState('')
  const [loading, setLoading] = useState(false)

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 800
        let w = img.width, h = img.height
        if (w > max) { h = (h * max) / w; w = max }
        if (h > max) { w = (w * max) / h; h = max }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        setImgData(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const cameraRef = useRef()
  const handleCameraCapture = (e) => processFile(e.target.files[0])
  const handleFileSelect = (e) => processFile(e.target.files[0])
  const fileRef = useRef()

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.category) { toast.error('Elegí una categoría'); return }
    setLoading(true)
    try {
      addClothing({ ...form, img: imgData })
      toast.success(`"${form.name}" agregada al ropero`)
      onClose()
    } catch (err) {
      toast.error('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <h2 className={styles.title}>Nueva Prenda</h2>

        <div className={styles.section}>
          <label className={styles.label}>Foto</label>
          <div
            className={`${styles.imgZone} ${imgData ? styles.imgZoneHasImg : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {imgData ? (
              <img src={imgData} alt="preview" className={styles.imgPreview} />
            ) : (
              <div className={styles.imgPlaceholder}>
                <span className={styles.imgIcon}>📷</span>
                <span className={styles.imgText}>Tocar para seleccionar foto</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
          <button className={styles.cameraBtn} onClick={() => cameraRef.current?.click()} type="button">
            📸 Abrir cámara
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleCameraCapture} />
          {imgData && (
            <button className={styles.removeImg} onClick={() => setImgData('')} type="button">
              × Quitar foto
            </button>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Nombre *</label>
          <input
            className={styles.input}
            placeholder='ej: Remera blanca Nike'
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            maxLength={80}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.section}>
            <label className={styles.label}>Categoría *</label>
            <select
              className={`${styles.input} ${styles.select}`}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value=''>Elegir...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className={styles.section}>
            <label className={styles.label}>Temporada</label>
            <select
              className={`${styles.input} ${styles.select}`}
              value={form.season}
              onChange={(e) => setField('season', e.target.value)}
            >
              <option value=''>Elegir...</option>
              {SEASONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Tipo de uso</label>
          <div className={styles.pillGroup}>
            {USE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.pill} ${form.type === t ? styles.pillActive : ''}`}
                onClick={() => setField('type', form.type === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Color</label>
          <div className={styles.colorGrid}>
            {COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                className={`${styles.colorDot} ${form.color === c.name ? styles.colorDotActive : ''}`}
                style={{ background: c.hex }}
                onClick={() => setField('color', form.color === c.name ? '' : c.name)}
              />
            ))}
          </div>
          {form.color && <div className={styles.colorLabel}>{form.color}</div>}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Notas</label>
          <textarea
            className={styles.input}
            style={{ resize: 'none', minHeight: 72 }}
            placeholder='Marca, talle, dónde la compraste...'
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            maxLength={300}
          />
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : '✓ Guardar Prenda'}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}