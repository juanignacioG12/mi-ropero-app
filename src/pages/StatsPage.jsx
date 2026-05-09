import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useStore } from '../store'
import styles from './StatsPage.module.css'

const CHART_COLORS = ['#d4a853','#5da8d4','#3a7d4a','#d4607a','#6a4abf','#c86020','#888880']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg3)', border: '0.5px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>
      <strong>{payload[0].name || payload[0].dataKey}</strong>: {payload[0].value}
    </div>
  )
}

export default function StatsPage() {
  const clothes = useStore((s) => s.clothes)
  const getInsights = useStore((s) => s.getInsights)
  const getStatsByCategory = useStore((s) => s.getStatsByCategory)
  const getStatsByType = useStore((s) => s.getStatsByType)

  if (!clothes.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <div className={styles.emptyText}>Agregá prendas para ver tus estadísticas</div>
      </div>
    )
  }

  const insights = getInsights()
  const byCat = getStatsByCategory()
  const byType = getStatsByType()
  const unused = clothes.filter((c) => c.uses === 0)
  const topUsed = [...clothes].sort((a, b) => b.uses - a.uses).slice(0, 5)

  return (
    <div className={styles.page}>
      <div className={styles.summaryGrid}>
        {[
          { label: 'Total prendas', value: clothes.length, icon: '👗' },
          { label: 'Total usos', value: clothes.reduce((a, c) => a + c.uses, 0), icon: '📊' },
          { label: 'Sin usar', value: unused.length, icon: '💤' },
          { label: 'Más usada', value: topUsed[0]?.uses || 0, icon: '🏆' },
        ].map(({ label, value, icon }) => (
          <div key={label} className={styles.summaryCard}>
            <div className={styles.summaryIcon}>{icon}</div>
            <div className={styles.summaryValue}>{value}</div>
            <div className={styles.summaryLabel}>{label}</div>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Insights</div>
          {insights.map((ins, i) => (
            <div key={i} className={`${styles.insightCard} ${styles['insight_' + ins.type]}`}>
              <span className={styles.insightIcon}>{ins.icon}</span>
              <div>
                <div className={styles.insightTitle}>{ins.title}</div>
                <div className={styles.insightDesc}>{ins.desc}</div>
                {ins.items.length > 0 && (
                  <div className={styles.insightItems}>{ins.items.join(', ')}</div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {byCat.some((d) => d.uses > 0) && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Usos por categoría</div>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCat} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
                <XAxis dataKey="cat" tick={{ fontSize: 10, fill: '#6b6865' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b6865' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,168,83,0.07)' }} />
                <Bar dataKey="uses" name="Usos" radius={[4, 4, 0, 0]}>
                  {byCat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {byType.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Distribución por tipo de uso</div>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="uses"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ type, percent }) => `${type} ${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {byType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Top prendas más usadas</div>
        {topUsed.map((c, i) => {
          const max = topUsed[0].uses || 1
          return (
            <div key={c.id} className={styles.rankRow}>
              <div className={styles.rankNum}>#{i + 1}</div>
              <div className={styles.rankName}>{c.name}</div>
              <div className={styles.rankBar}>
                <div className={styles.rankFill} style={{ width: `${(c.uses / max) * 100}%`, background: CHART_COLORS[i] }} />
              </div>
              <div className={styles.rankVal}>{c.uses}</div>
            </div>
          )
        })}
      </section>

      {unused.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Prendas sin uso ({unused.length})</div>
          {unused.map((c) => (
            <div key={c.id} className={styles.unusedRow}>
              <span className={styles.unusedEmoji}>
                {c.img ? <img src={c.img} alt="" className={styles.unusedThumb} /> : '🧺'}
              </span>
              <div className={styles.unusedName}>{c.name}</div>
              <div className={styles.unusedCat}>{c.category}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}