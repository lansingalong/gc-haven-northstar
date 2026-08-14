import { useState } from 'react'
import * as MuiIcons from '@mui/icons-material'
import { Icon } from '@/components/Icons'
import styles from './SummaryCard.module.css'
import type { PreCallBriefCardData } from './PreCallBriefCard'
import type { CarePlanItem } from '@/mocks'

type IconName = keyof typeof MuiIcons

type Goal = { goal: string; status: string; category: string; targetDate: string; intervention: string }

function fmtDate(iso: string): string {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function riskBadgeClass(label: string) {
  const lc = label.toLowerCase()
  if (lc.includes('high')) return styles.badgeHigh
  if (lc.includes('moderate')) return styles.badgeWarning
  return styles.badgeDone
}

/* ── Sub-card shell ── */
function SubCard({
  title,
  icon,
  badge,
  badgeClass,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: IconName
  badge?: string
  badgeClass?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button
          type="button"
          className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={icon} size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>{title}</span>
            {badge && badgeClass && (
              <span className={`${styles.badge} ${badgeClass}`}>{badge}</span>
            )}
          </div>
          <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
        </button>
        {open && <div style={{ paddingBottom: 12 }}>{children}</div>}
      </div>
    </div>
  )
}

/* ── 1. Needs Attention ── */
function NeedsAttentionCard({ data, goals }: { data: PreCallBriefCardData; goals: Goal[] }) {
  const items: { label: string; detail: string }[] = []

  const overdueAssessments = data.assessments.filter(a => a.status === 'Due')
  overdueAssessments.forEach(a => {
    items.push({ label: `Overdue assessment: ${a.name}`, detail: `Due ${fmtDate(a.dueDate)}` })
  })

  if (data.openCareGaps.length > 0) {
    items.push({ label: `${data.openCareGaps.length} open care gap${data.openCareGaps.length > 1 ? 's' : ''}`, detail: 'All incomplete — review and address' })
  }

  if (data.discontinuedMedications.length > 0) {
    data.discontinuedMedications.forEach(m => {
      items.push({ label: `Discontinued medication: ${m.name}`, detail: `Stopped ${fmtDate(m.endDate)}` })
    })
  }

  if (data.claimsPending > 0) {
    items.push({ label: `${data.claimsPending} pending claim${data.claimsPending > 1 ? 's' : ''}`, detail: 'Awaiting decision — follow up as needed' })
  }

  const activeGoals = goals.filter(g => g.status !== 'Completed' && g.status !== 'Closed')
  if (activeGoals.length > 0) {
    items.push({ label: `${activeGoals.length} active care plan goal${activeGoals.length > 1 ? 's' : ''}`, detail: 'Review with receiving care manager' })
  }

  const count = items.length
  const badgeClass = count > 0 ? styles.badgeHigh : styles.badgeActive
  const badgeLabel = count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'All clear'

  return (
    <SubCard title="Needs Attention" icon="PriorityHigh" badge={badgeLabel} badgeClass={badgeClass} defaultOpen>
      {items.length === 0 ? (
        <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No immediate attention items.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => (
            <div key={i} className={styles.driverRowNew} style={{ borderLeftColor: 'var(--color-error)', background: 'rgba(211,47,47,0.04)' }}>
              <div className={styles.driverBody}>
                <span className={styles.driverTitle}>{item.label}</span>
                <span className={styles.driverDetail}>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubCard>
  )
}

/* ── 2. Member Snapshot ── */
function MemberSnapshotCard({ data }: { data: PreCallBriefCardData }) {
  return (
    <SubCard title="Member Snapshot" icon="PersonOutlined">
      <div className={styles.fieldGrid} style={{ marginTop: 4 }}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Preferred phone</span>
          <span className={styles.fieldValue}>{data.preferredPhone || 'N/A'}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Best time to call</span>
          <span className={styles.fieldValue}>{data.bestTimeToCall || 'N/A'}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Language</span>
          <span className={styles.fieldValue}>{data.preferredLanguage || 'N/A'}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Contact format</span>
          <span className={styles.fieldValue}>{data.preferredContactFormat || 'N/A'}</span>
        </div>
        {data.communicationImpairments.length > 0 && (
          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <span className={styles.fieldLabel}>Communication impairments</span>
            <span className={styles.fieldValue}>{data.communicationImpairments.join(', ')}</span>
          </div>
        )}
      </div>
    </SubCard>
  )
}

/* ── 3. Risk & Conditions ── */
function RiskConditionsCard({ data }: { data: PreCallBriefCardData }) {
  const topDrivers = data.riskDrivers.slice(0, 3)
  const badge = data.riskLabel
  const badgeClass = riskBadgeClass(data.riskLabel)

  return (
    <SubCard title="Risk & Conditions" icon="MonitorHeart" badge={badge} badgeClass={badgeClass}>
      <div className={styles.fieldGrid} style={{ marginTop: 4, marginBottom: 12 }}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Risk tier</span>
          <span className={styles.fieldValue}>{data.riskTier}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Risk label</span>
          <span className={styles.fieldValue}>{data.riskLabel}</span>
        </div>
      </div>
      {topDrivers.length > 0 && (
        <>
          <p className={styles.sectionTitle}>Top risk drivers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 12 }}>
            {topDrivers.map((d, i) => (
              <div key={i} className={styles.driverRow}>
                <div className={styles.driverBody}>
                  <span className={styles.driverTitle}>{d.condition}</span>
                  <span className={styles.driverDetail}>{d.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className={styles.sectionTitle}>Conditions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.conditions.map((c, i) => (
          <div key={i} className={styles.driverRow}>
            <div className={styles.driverBody}>
              <span className={styles.driverTitle}>{c.condition}</span>
              <span className={styles.driverDetail}>{c.code}{c.isPrimary ? ' · Primary' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </SubCard>
  )
}

/* ── 4. Medications ── */
function MedicationsCard({ data }: { data: PreCallBriefCardData }) {
  const activeCount = data.keyMedications.length
  return (
    <SubCard title="Medications" icon="Medication" badge={`${activeCount} active`} badgeClass={styles.badgeActive}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
        {data.keyMedications.map((m, i) => (
          <div key={i} className={styles.driverRow}>
            <div className={styles.driverBody}>
              <span className={styles.driverTitle}>{m.name}</span>
              <span className={styles.driverDetail}>{m.dosage} · {m.frequency}</span>
              <span className={styles.driverDetail}>Prescribed by {m.prescribedBy}</span>
            </div>
          </div>
        ))}
      </div>
      {data.discontinuedMedications.length > 0 && (
        <>
          <hr className={styles.sectionDivider} />
          <p className={styles.sectionTitle}>Discontinued</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.discontinuedMedications.map((m, i) => (
              <div key={i} className={styles.driverRow}>
                <div className={styles.driverBody}>
                  <span className={styles.driverTitle} style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>{m.name}</span>
                  <span className={styles.driverDetail}>{m.dosage} · Stopped {fmtDate(m.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SubCard>
  )
}

/* ── 5. Open Care Gaps ── */
function CareGapsCard({ data }: { data: PreCallBriefCardData }) {
  const count = data.openCareGaps.length
  return (
    <SubCard
      title="Care Gaps"
      icon="AssignmentLate"
      badge={count > 0 ? `${count} open` : 'None'}
      badgeClass={count > 0 ? styles.badgeWarning : styles.badgeActive}
    >
      {count === 0 ? (
        <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No open care gaps.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
          {data.openCareGaps.map((g, i) => (
            <div key={i} className={styles.driverRow}>
              <div className={styles.driverBody}>
                <span className={styles.driverTitle}>{g.opportunity}</span>
                <span className={styles.driverDetail}>{g.measureCode}{g.ncqaGrouping ? ` · ${g.ncqaGrouping}` : ''}</span>
                {g.measureDescription && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{g.measureDescription}</span>}
                <span className={`${styles.badge} ${styles.badgeWarning}`} style={{ marginTop: 4, alignSelf: 'flex-start' }}>Incomplete</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubCard>
  )
}

/* ── 6. Assessments ── */
function AssessmentsCard({ data }: { data: PreCallBriefCardData }) {
  const assessments = data.assessments ?? []
  const sorted = [...assessments].sort((a, b) => {
    const order: Record<string, number> = { 'Due': 0, 'Due Soon': 1, 'Up to Date': 2 }
    return (order[a.status] ?? 3) - (order[b.status] ?? 3)
  })
  const overdueCount = assessments.filter(a => a.status === 'Due').length
  const badge = overdueCount > 0 ? `${overdueCount} overdue` : undefined
  const badgeClass = overdueCount > 0 ? styles.badgeHigh : undefined

  return (
    <SubCard title="Assessments" icon="Assignment" badge={badge} badgeClass={badgeClass}>
      {sorted.length === 0 ? (
        <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No assessments on file.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
          {sorted.map((a, i) => {
            const isOverdue = a.status === 'Due'
            const rowClass = isOverdue ? styles.driverRowNew : styles.driverRow
            const rowStyle = isOverdue ? { borderLeftColor: 'var(--color-error)', background: 'rgba(211,47,47,0.04)' } : {}
            return (
              <div key={i} className={rowClass} style={rowStyle}>
                <div className={styles.driverBody}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                    <span className={styles.driverTitle}>{a.name}</span>
                    {isOverdue && <span className={`${styles.badge} ${styles.badgeHigh}`}>Overdue</span>}
                    {a.status === 'Due Soon' && <span className={`${styles.badge} ${styles.badgeWarning}`}>Due Soon</span>}
                    {a.status === 'Up to Date' && <span className={`${styles.badge} ${styles.badgeActive}`}>Up to Date</span>}
                  </span>
                  <span className={styles.driverDetail}>Last: {fmtDate(a.lastCompleted)}{a.scoreLabel ? ` · ${a.scoreLabel}` : ''}</span>
                  <span className={styles.driverDetail}>Due: {fmtDate(a.dueDate)} · {a.frequency}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SubCard>
  )
}

/* ── 7. Care Plan Goals ── */
function GoalsCard({ goals }: { goals: Goal[] }) {
  const sorted = [...goals].sort((a, b) => {
    const isDoneA = a.status === 'Completed' || a.status === 'Closed' ? 1 : 0
    const isDoneB = b.status === 'Completed' || b.status === 'Closed' ? 1 : 0
    return isDoneA - isDoneB
  })

  function statusBadge(status: string) {
    if (status === 'Completed' || status === 'Closed') return <span className={`${styles.badge} ${styles.badgeDone}`}>{status}</span>
    if (status === 'Active') return <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
    if (status === 'In Progress') return <span className={`${styles.badge} ${styles.badgeInProgress}`}>In Progress</span>
    return <span className={`${styles.badge} ${styles.badgeNeutral}`}>{status}</span>
  }

  return (
    <SubCard title="Care Plan Goals" icon="Flag">
      {sorted.length === 0 ? (
        <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No care plan goals on file.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
          {sorted.map((g, i) => (
            <div key={i} className={styles.driverRow}>
              <div className={styles.driverBody}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                  <span className={styles.driverTitle}>{g.goal}</span>
                  {statusBadge(g.status)}
                </span>
                <span className={styles.driverDetail}>{g.category}{g.targetDate ? ` · Target: ${fmtDate(g.targetDate)}` : ''}</span>
                {g.intervention && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{g.intervention}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </SubCard>
  )
}

/* ── 8. Recent Claims ── */
function ClaimsCard({ data }: { data: PreCallBriefCardData }) {
  const headerBadge = data.claimsPending > 0 ? `${data.claimsPending} pending` : undefined
  const badgeClass = data.claimsPending > 0 ? styles.badgeWarning : undefined

  return (
    <SubCard title="Claims" icon="Receipt" badge={headerBadge} badgeClass={badgeClass}>
      <div className={styles.fieldGrid} style={{ marginTop: 4, marginBottom: 12 }}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Approved</span>
          <span className={styles.fieldValue}>{data.claimsApproved}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Pending</span>
          <span className={styles.fieldValue}>{data.claimsPending}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Denied</span>
          <span className={styles.fieldValue}>{data.claimsDenied}</span>
        </div>
      </div>
      {data.recentClaims.length > 0 && (
        <>
          <hr className={styles.sectionDivider} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.recentClaims.map((c, i) => (
              <div key={i} className={styles.driverRow}>
                <div className={styles.driverBody}>
                  <span className={styles.driverTitle}>{c.visitType}</span>
                  <span className={styles.driverDetail}>{fmtDate(c.date)} · {c.provider}</span>
                  <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{c.reasonForVisit}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SubCard>
  )
}

/* ── Main export ── */
export function HandoffSummaryCard({
  data,
  goals,
  carePlanItems: _carePlanItems,
}: {
  data: PreCallBriefCardData
  goals: Goal[]
  carePlanItems?: CarePlanItem[]
}) {
  return (
    <div className={styles.wrapper}>
      <NeedsAttentionCard data={data} goals={goals} />
      <MemberSnapshotCard data={data} />
      <RiskConditionsCard data={data} />
      <MedicationsCard data={data} />
      <CareGapsCard data={data} />
      <AssessmentsCard data={data} />
      <GoalsCard goals={goals} />
      <ClaimsCard data={data} />
    </div>
  )
}
