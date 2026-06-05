import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore, HABIT_CATEGORIES, HABIT_ICONS } from '../store'
import styles from './Modal.module.css'

export default function AddHabitModal({ onClose }) {
  const addHabit = useStore((s) => s.addHabit)
  const [form, setForm] = useState({ name: '', icon: '🎯', category: '', color: '#7BBDE8' })

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    addHabit(form)
    toast.success(`Hábito "${form.name}" agregado`)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <h2 className={styles.title}>Nuevo Hábito</h2>

        <div className={styles.section}>
          <label className={styles.label}>Ícono</label>
          <div className={styles.pillGroup}>
            {HABIT_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                className={`${styles.pill} ${form.icon === ic ? styles.pillActive : ''}`}
                onClick={() => setField('icon', ic)}
                style={{ fontSize: 20 }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Nombre *</label>
          <input
            className={styles.input}
            placeholder='ej: Ir al gimnasio'
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            maxLength={60}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Categoría</label>
          <div className={styles.pillGroup}>
            {HABIT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.pill} ${form.category === c ? styles.pillActive : ''}`}
                onClick={() => setField('category', form.category === c ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit}>✓ Guardar Hábito</button>
        <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}