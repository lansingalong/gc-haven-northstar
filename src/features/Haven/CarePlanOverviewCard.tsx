import { useState } from 'react'
import { Icon } from '@/components/Icons'
import styles from './SummaryCard.module.css'
import type { CarePlanItem } from '@/mocks'

// ── Date helpers ──────────────────────────────────────────────────────────────

const TODAY = '2026-08-06'
const DUE_SOON_DATE = '2026-08-20'   // +14 days
const WITHIN_30_DATE = '2026-09-05'  // +30 days

function fmtDate(iso: string): string {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function isDueSoon(dateStr: string): boolean {
  if (!dateStr) return false
  return dateStr <= DUE_SOON_DATE && dateStr >= TODAY
}

function isOverdue(dateStr: string): boolean {
  return !!dateStr && dateStr < TODAY
}

function isWithin30(dateStr: string): boolean {
  if (!dateStr) return false
  return dateStr >= TODAY && dateStr <= WITHIN_30_DATE
}

function dueLabelFor(dateStr: string): string | null {
  if (!dateStr) return null
  if (dateStr < TODAY) return 'Overdue'
  const todayMs = new Date(TODAY).getTime()
  const dueMs = new Date(dateStr).getTime()
  const diffDays = Math.round((dueMs - todayMs) / 86400000)
  if (diffDays === 0) return 'Due today'
  if (diffDays <= 7) return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
  if (diffDays <= 14) return 'Due next week'
  if (diffDays <= 30) return `Due in ${diffDays} days`
  return null
}

// ── Local card helpers (pattern from PreCallBriefCard) ────────────────────────

function CardFooter({ href, lastUpdated }: { href: string; lastUpdated: string }) {
  return (
    <div className={styles.cardFooter}>
      <a href={href} target="_blank" rel="noreferrer" className={styles.cardFooterLink}>
        View full details
      </a>
      <span className={styles.cardFooterLastUpdated}>Last updated {lastUpdated}</span>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  'Call member',
  'Doctor Appointment',
  'Education Session',
  'Care Plan Review',
  'Follow-up',
  'Medication Review',
]

// ── State shapes ──────────────────────────────────────────────────────────────

interface InterventionRow {
  opportunityAlias: string
  interventionAlias: string
  activityType: string
  scheduledDate: string
  dueDate: string
  note: string
  targetDate: string
  status: string
  priority: string
  condition: string
  dueLabel?: string
}

interface MemberActionRow {
  memberPlan: string
  memberGoal: string
  targetDate: string
  memberStatus: string
  priority: string
  condition: string
}

// ── Main component ────────────────────────────────────────────────────────────

export function CarePlanOverviewCard({ items }: { items: CarePlanItem[] }) {
  const [open, setOpen] = useState(false)
  const [editingInterventionIdx, setEditingInterventionIdx] = useState<number | null>(null)
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null)

  const [interventions, setInterventions] = useState<InterventionRow[]>(() =>
    items.map(item => ({
      opportunityAlias: item.opportunityAlias,
      interventionAlias: item.interventionAlias,
      activityType: '',
      scheduledDate: item.startDate ?? '',
      dueDate: item.targetDate,
      note: item.careStaffComments ?? '',
      targetDate: item.targetDate,
      status: item.status,
      priority: item.priority,
      condition: item.condition,
      dueLabel: item.dueLabel,
    }))
  )

  const [memberActions, setMemberActions] = useState<MemberActionRow[]>(() =>
    items.map(item => ({
      memberPlan: item.memberPlan,
      memberGoal: item.memberGoal,
      targetDate: item.targetDate,
      memberStatus: item.memberStatus,
      priority: item.priority,
      condition: item.condition,
    }))
  )

  // ── Section 1 derived counts ──

  const totalActive = items.filter(i => i.status !== 'Completed' && i.status !== 'Closed').length
  const categories = [...new Set(items.map(i => i.category))]
  const highPriorityInProgress = items.filter(i => i.priority === 'High' && i.status === 'In Progress').length
  const completedCount = items.filter(i => i.status === 'Completed').length
  const conditions = [...new Set(items.map(i => i.condition.split('(')[0].trim()))]

  // Most recent targetDate across all items
  const lastUpdated = items.reduce<string>((max, i) => (i.targetDate > max ? i.targetDate : max), '')

  // ── Section 3 sorted member actions (track original indices for edit state) ──

  const sortedMemberActions = memberActions
    .map((row, idx) => ({ row, idx }))
    .sort((a, b) => {
      const aHigh = isWithin30(a.row.targetDate) || a.row.memberStatus === 'Pending' ? 0 : 1
      const bHigh = isWithin30(b.row.targetDate) || b.row.memberStatus === 'Pending' ? 0 : 1
      return aHigh - bHigh
    })

  // ── Updaters ──

  function setInterventionField<K extends keyof InterventionRow>(
    idx: number,
    key: K,
    value: InterventionRow[K]
  ) {
    setInterventions(prev => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)))
  }

  function setMemberField<K extends keyof MemberActionRow>(
    idx: number,
    key: K,
    value: MemberActionRow[K]
  ) {
    setMemberActions(prev => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)))
  }

  // ── Collapsed header counts ──

  const allDates = [
    ...interventions.map(r => r.targetDate),
    ...memberActions.map(r => r.targetDate),
  ]
  const dueSoonCount = allDates.filter(d => d && d >= TODAY && d <= DUE_SOON_DATE).length
  const overdueCount = allDates.filter(d => d && d < TODAY).length

  // ── Render ──

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>

        {/* Header */}
        <button
          type="button"
          className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Icon name="Assignment" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Care Plan Overview</span>
            {!open && overdueCount > 0 && (
              <span className={`${styles.badge} ${styles.badgeHigh}`}>{overdueCount} overdue</span>
            )}
            {!open && dueSoonCount > 0 && (
              <span className={`${styles.badge} ${styles.badgeWarning}`}>{dueSoonCount} due soon</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && (
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Copy"
                onClick={() => {
                  const text = interventions.map(r =>
                    `${r.opportunityAlias} · ${r.interventionAlias} · Due: ${fmtDate(r.targetDate)} · ${r.status}`
                  ).join('\n')
                  navigator.clipboard.writeText(text)
                }}
              >
                <Icon name="ContentCopy" size="sm" aria-hidden />
              </button>
            )}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <>
            {/* ── Section 1: Plan of Care Summary ── */}
            <p className={styles.fieldValueSm} style={{ margin: '0 0 4px' }}>
              Managing {totalActive} active record{totalActive !== 1 ? 's' : ''} across{' '}
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}.{' '}
              {highPriorityInProgress} high-priority goal{highPriorityInProgress !== 1 ? 's' : ''} in progress.{' '}
              {completedCount} goal{completedCount !== 1 ? 's' : ''} completed.
            </p>
            <p className={styles.fieldValueSm} style={{ margin: 0 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Primary conditions being managed:
              </span>{' '}
              {conditions.join(', ')}
            </p>
            <hr className={styles.sectionDivider} />

            {/* ── Section 2: Clinical Interventions ── */}
            <span className={styles.fieldLabel}>CLINICAL INTERVENTIONS</span>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {interventions.map((row, idx) => {
                const dueText = row.dueLabel || dueLabelFor(row.targetDate)

                if (editingInterventionIdx === idx) {
                  return (
                    <div
                      key={idx}
                      className={styles.driverRow}
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, paddingTop: 10 }}
                    >
                      {/* Two date inputs side by side */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="date"
                          className={styles.editInputSm}
                          aria-label="Scheduled date"
                          value={row.scheduledDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInterventionField(idx, 'scheduledDate', e.target.value)
                          }
                        />
                        <input
                          type="date"
                          className={styles.editInputSm}
                          aria-label="Target date"
                          value={row.targetDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setInterventionField(idx, 'targetDate', e.target.value)
                            setInterventionField(idx, 'dueDate', e.target.value)
                          }}
                        />
                      </div>
                      {/* Activity type select */}
                      <select
                        className={styles.editInputSm}
                        aria-label="Activity type"
                        value={row.activityType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setInterventionField(idx, 'activityType', e.target.value)
                        }
                      >
                        <option value="">Select activity type…</option>
                        {ACTIVITY_TYPES.map(at => (
                          <option key={at} value={at}>{at}</option>
                        ))}
                      </select>
                      {/* Note textarea */}
                      <textarea
                        className={styles.editInputSm}
                        aria-label="Note"
                        rows={2}
                        value={row.note}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setInterventionField(idx, 'note', e.target.value)
                        }
                      />
                      {/* Save / Cancel */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          className={styles.iconBtnCheck}
                          aria-label="Save"
                          onClick={() => setEditingInterventionIdx(null)}
                        >
                          <Icon name="Check" size="xs" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label="Cancel"
                          onClick={() => {
                            setInterventions(prev =>
                              prev.map((r, i) =>
                                i === idx
                                  ? {
                                      ...r,
                                      activityType: r.activityType,
                                      scheduledDate: r.scheduledDate,
                                      targetDate: r.targetDate,
                                      note: r.note,
                                    }
                                  : r
                              )
                            )
                            setEditingInterventionIdx(null)
                          }}
                        >
                          <Icon name="Close" size="xs" aria-hidden />
                        </button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={idx} className={styles.driverRow} style={{ alignItems: 'flex-start' }}>
                    <div className={styles.driverBody}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <strong className={styles.driverTitle}>{row.opportunityAlias}</strong>
                        {dueText && (
                          <span className={`${styles.badge} ${dueText === 'Overdue' ? styles.badgeHigh : styles.badgeWarning}`}>{dueText}</span>
                        )}
                      </span>
                      <span className={styles.driverDetail}>{row.condition}</span>
                      <span className={styles.driverDetail}>
                        {[row.activityType || null, fmtDate(row.targetDate), row.status]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Edit ${row.opportunityAlias}`}
                      onClick={() => setEditingInterventionIdx(idx)}
                    >
                      <Icon name="Edit" size="xs" aria-hidden />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* ── Section 3: Member Plan ── */}
            <hr className={styles.sectionDivider} />
            <span className={styles.fieldLabel}>MEMBER PLAN</span>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {sortedMemberActions.map(({ row, idx: origIdx }) => {
                const highlight = isDueSoon(row.targetDate) || row.memberStatus === 'Pending'
                const rowClass = highlight ? styles.driverRowNew : styles.driverRow
                const dueText = dueLabelFor(row.targetDate)

                if (editingMemberIdx === origIdx) {
                  return (
                    <div
                      key={origIdx}
                      className={rowClass}
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, paddingTop: 10 }}
                    >
                      <select
                        className={styles.editInputSm}
                        aria-label="Member status"
                        value={row.memberStatus}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setMemberField(origIdx, 'memberStatus', e.target.value)
                        }
                      >
                        {['Engaged', 'Partially Engaged', 'Pending', 'Completed', 'Not Engaged'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        className={styles.editInputSm}
                        aria-label="Priority"
                        value={row.priority}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setMemberField(origIdx, 'priority', e.target.value)
                        }
                      >
                        {['High', 'Medium', 'Low'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className={styles.editInputSm}
                        aria-label="Target date"
                        value={row.targetDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setMemberField(origIdx, 'targetDate', e.target.value)
                        }
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          className={styles.iconBtnCheck}
                          aria-label="Save"
                          onClick={() => setEditingMemberIdx(null)}
                        >
                          <Icon name="Check" size="xs" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label="Cancel"
                          onClick={() => setEditingMemberIdx(null)}
                        >
                          <Icon name="Close" size="xs" aria-hidden />
                        </button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={origIdx} className={rowClass} style={{ alignItems: 'flex-start' }}>
                    <div className={styles.driverBody}>
                      <span className={styles.driverTitle}>{row.memberPlan}</span>
                      <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>
                        {row.memberGoal}
                      </span>
                      <span className={styles.driverDetail} style={{ marginTop: 2 }}>
                        {`Status: ${row.memberStatus}`}{row.priority ? ` · Priority: ${row.priority}` : ''}
                        {row.targetDate ? ` · Target: ${fmtDate(row.targetDate)}` : ''}
                        {dueText ? ` (${dueText})` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label="Edit member plan item"
                      onClick={() => setEditingMemberIdx(origIdx)}
                    >
                      <Icon name="Edit" size="xs" aria-hidden />
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {open && (
        <CardFooter href="#care-plan" lastUpdated={lastUpdated ? fmtDate(lastUpdated) : 'N/A'} />
      )}
    </div>
  )
}
