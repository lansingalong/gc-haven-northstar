import { useState } from 'react'
import { Icon } from '@/components/Icons'
import styles from './SummaryCard.module.css'
import { CarePlanOverviewCard } from './CarePlanOverviewCard'
import type { CarePlanItem } from '@/mocks'

export interface PreCallBriefEligibility {
  status: string
  startDate: string
  planName: string
  lineOfBusiness: string
}

export interface PreCallBriefCondition {
  condition: string
  code: string
  level: string
  isPrimary?: boolean
  isNew?: boolean
}

export interface PreCallBriefClaim {
  visitType: string
  date: string
  provider: string
  procedureCode: string
  reasonForVisit: string
}

export interface PreCallBriefOGI {
  opportunity: string
  category: string
  status: string
  targetDate: string
}

export interface AssessmentItem {
  name: string
  lastCompleted: string   // ISO date string
  score?: number
  scoreLabel?: string     // e.g. "Moderate (6/27)"
  dueDate: string         // ISO date string
  frequency: string       // e.g. "Annual", "Every 6 months"
  status: 'Due' | 'Due Soon' | 'Up to Date'
}

export interface PreCallBriefCardData {
  memberFirstName: string

  // Referral
  referralProgram: string
  referralBy: string
  referralDate: string
  referralLastUpdated: string

  // Eligibility
  eligibilities: PreCallBriefEligibility[]
  eligibilityLastUpdated: string

  // Risk
  riskTier: string
  riskLabel: string
  riskScore?: number
  riskScoreMax?: number
  riskDrivers: Array<{ condition: string; detail: string }>
  riskLastUpdated: string

  // Medications
  activeMedCount: number
  keyMedications: Array<{
    name: string
    dosage: string
    frequency: string
    medicationClass: string
    prescribedBy: string
    startDate: string
    dispensedDate: string
  }>
  medsLastUpdated: string
  discontinuedMedications: Array<{
    name: string
    dosage: string
    endDate: string
    prescribedBy: string
  }>

  // Claims
  recentClaims: PreCallBriefClaim[]
  claimsApproved: number
  claimsPending: number
  claimsDenied: number
  claimsTypeBreakdown: Array<{ type: string; count: number }>

  // Conditions
  conditions: PreCallBriefCondition[]

  // Care gaps
  openCareGaps: Array<{ opportunity: string; measureCode: string; ncqaGrouping: string; measureDescription: string }>

  // OGIs
  activeOGIs: PreCallBriefOGI[]

  // Preferences
  preferredPhone: string
  bestTimeToCall: string
  communicationImpairments: string[]
  preferredLanguage: string
  preferredContactFormat: string

  // Assessments
  assessments: AssessmentItem[]

  // Last update
  lastRecordUpdate: string
}

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

function riskBannerClass(label: string) {
  const lc = label.toLowerCase()
  if (lc.includes('high')) return styles.riskHigh
  if (lc.includes('moderate')) return styles.riskMedium
  return styles.riskLow
}

/* Shared card footer */
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

/* Shared card action buttons */
function CardActions({ editing, onEdit, onSave, onCopy }: { editing: boolean; onEdit: () => void; onSave: () => void; onCopy?: () => void }) {
  return (
    <div className={styles.cardActions}>
      {editing ? (
        <button type="button" className={styles.iconBtnCheck} aria-label="Save" onClick={onSave}>
          <Icon name="Check" size="sm" aria-hidden />
        </button>
      ) : (
        <button type="button" className={styles.iconBtn} aria-label="Edit" onClick={onEdit}>
          <Icon name="Edit" size="sm" aria-hidden />
        </button>
      )}
      <button type="button" className={styles.iconBtn} aria-label="Copy" onClick={onCopy}>
        <Icon name="ContentCopy" size="sm" aria-hidden />
      </button>
    </div>
  )
}

function CopyButton({ onCopy }: { onCopy: () => void }) {
  return (
    <button type="button" className={styles.iconBtn} aria-label="Copy" onClick={onCopy}>
      <Icon name="ContentCopy" size="sm" aria-hidden />
    </button>
  )
}

/* ── Card 1: Referral Reason ── */
function ReferralCard({ data }: { data: PreCallBriefCardData }) {
  const copyText = [
    `Referral reason: ${data.referralProgram}`,
    `Referred by: ${data.referralBy || 'N/A'}`,
    `Referral date: ${fmtDate(data.referralDate) || 'N/A'}`,
  ].join('\n')

  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="PersonAdd" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Referral Overview</span>
          </div>
          <div className={styles.cardActions}>
            <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />
          </div>
        </div>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Referral reason</span>
            <span className={styles.fieldValue}>{data.referralProgram}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Referred by</span>
            <span className={styles.fieldValue}>{data.referralBy || 'N/A'}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Referral date</span>
            <span className={styles.fieldValue}>{fmtDate(data.referralDate) || 'N/A'}</span>
          </div>
        </div>
      </div>
      <CardFooter href="#programs" lastUpdated={fmtDate(data.referralDate)} />
    </div>
  )
}

/* ── Card 2: Current Eligibility ── */
function EligibilityCard({ data, defaultOpen = false }: { data: PreCallBriefCardData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const e0 = data.eligibilities[0]

  const copyText = !e0 ? 'No active coverage on record' : [
    `Status: ${e0.status}`,
    `Effective date: ${fmtDate(e0.startDate)}`,
    `Plan name: ${e0.planName}`,
    `Line of business: ${e0.lineOfBusiness}`,
  ].join('\n')

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="VerifiedUser" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Eligibility Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (!e0 ? (
          <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No active coverage on record</span>
        ) : (
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <div className={styles.activeValue}><Icon name="CheckCircle" size="sm" aria-hidden />{e0.status}</div>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Effective date</span>
              <span className={styles.fieldValue}>{fmtDate(e0.startDate)}</span>
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.fieldLabel}>Plan name</span>
              <span className={styles.fieldValue}>{e0.planName}</span>
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.fieldLabel}>Line of business</span>
              <span className={styles.fieldValue}>{e0.lineOfBusiness}</span>
            </div>
          </div>
        ))}
      </div>
      {open && <CardFooter href="#eligibility" lastUpdated={fmtDate(data.eligibilityLastUpdated)} />}
    </div>
  )
}

/* ── Card 3: Risk Score ── */
function RiskScoreCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)
  const [driversOpen, setDriversOpen] = useState(false)

  const copyText = [
    `Risk Tier: ${data.riskTier}`,
    `Risk Label: ${data.riskLabel}`,
    data.riskScore != null ? `Score: ${data.riskScore}${data.riskScoreMax ? `/${data.riskScoreMax}` : ''}` : null,
    data.riskDrivers.length > 0 ? `Drivers:\n${data.riskDrivers.map(d => `  • ${d.condition}: ${d.detail}`).join('\n')}` : null,
  ].filter(Boolean).join('\n')

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="MonitorHeart" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Risk Score Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <>
            <div className={`${styles.riskBanner} ${riskBannerClass(data.riskLabel)}`} style={{ marginBottom: 16 }}>
              <div>
                <div className={styles.riskLabel}>Risk Tier</div>
                <div className={styles.riskValue}>{data.riskTier}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {data.riskScore != null && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Score: <strong style={{ color: 'var(--color-text-primary)' }}>
                      {data.riskScore}{data.riskScoreMax ? `/${data.riskScoreMax}` : ''}
                    </strong>
                  </span>
                )}
                <span className={`${styles.badge} ${riskBadgeClass(data.riskLabel)}`}>{data.riskLabel}</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.driverToggle}
              onClick={() => setDriversOpen(o => !o)}
              aria-expanded={driversOpen}
            >
              <span>Why this score?</span>
              <Icon name={driversOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
            </button>
            {driversOpen && (
              <div className={styles.driverList}>
                {data.riskDrivers.map((d, idx) => (
                  <div key={idx} className={styles.driverRow}>
                    <div className={styles.driverBody}>
                      <span className={styles.driverTitle}>{d.condition}</span>
                      <span className={styles.driverDetail}>{d.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {open && <CardFooter href="#risk" lastUpdated={data.riskLastUpdated} />}
    </div>
  )
}

/* ── Card 4: Claims Overview ── */
function ClaimsOverviewCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)

  const copyText = [
    `Recent claims (last 90 days): ${data.recentClaims.length}`,
    `Approved: ${data.claimsApproved}`,
    `Pending: ${data.claimsPending}`,
    `Denied: ${data.claimsDenied}`,
  ].join('\n')

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Receipt" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Claims Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div className={styles.fieldGrid} style={{ marginBottom: 16 }}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Recent claims (last 90 days)</span>
              <span className={styles.fieldValue}>{data.recentClaims.length}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Approved</span>
              <div className={styles.activeValue}><Icon name="CheckCircle" size="sm" aria-hidden />{data.claimsApproved}</div>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Pending</span>
              <span className={styles.fieldValue}>
                {data.claimsPending}
                {data.claimsPending > 0 && <span className={`${styles.badge} ${styles.badgeWarning}`} style={{ marginLeft: 6 }}>Pending</span>}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Denied</span>
              <span className={styles.fieldValue}>
                {data.claimsDenied}
                {data.claimsDenied > 0 && <span className={`${styles.badge} ${styles.badgeHigh}`} style={{ marginLeft: 6 }}>Denied</span>}
              </span>
            </div>
          </div>
        )}
      </div>
      {open && <CardFooter href="#claims" lastUpdated={data.recentClaims[0] ? fmtDate(data.recentClaims[0].date) : 'N/A'} />}
    </div>
  )
}

/* ── Card 5: Medications Overview ── */
export function MedicationsOverviewCard({ data, defaultOpen = false, defaultEditing = false, medicationChanges }: { data: PreCallBriefCardData; defaultOpen?: boolean; defaultEditing?: boolean; medicationChanges?: MedChange[] }) {
  const [open, setOpen] = useState(defaultOpen)
  const [editing, setEditing] = useState(defaultEditing)
  const [meds, setMeds] = useState(data.keyMedications.map(m => ({ ...m })))
  const [medsLastUpdated] = useState(data.medsLastUpdated)
  const [discOpen, setDiscOpen] = useState(false)

  const changes = medicationChanges ?? []
  const newNames = new Set(changes.filter(c => c.changeType === 'New').map(c => c.name.toLowerCase()))
  const switchedNames = new Set(changes.filter(c => c.changeType === 'Switched').map(c => c.name.toLowerCase()))
  const doseChangedNames = new Set(changes.filter(c => c.changeType === 'DoseChange').map(c => c.name.toLowerCase()))
  const recentlyStoppedNames = new Set(
    changes.filter(c => c.changeType === 'Discontinued' || c.changeType === 'Switched').map(c => (c.stoppedName ?? c.name).toLowerCase())
  )
  const totalChanges = changes.length

  const changedNameSet = new Set([...newNames, ...switchedNames, ...doseChangedNames])
  const sortedMeds = [...meds].sort((a, b) => {
    const aChanged = changedNameSet.has(a.name.toLowerCase()) ? 1 : 0
    const bChanged = changedNameSet.has(b.name.toLowerCase()) ? 1 : 0
    return aChanged - bChanged
  })

  const setMedField = (idx: number, key: keyof typeof meds[0]) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setMeds(prev => prev.map((m, i) => i === idx ? { ...m, [key]: e.target.value } : m))

  function medRowClass(name: string) {
    const lc = name.toLowerCase()
    if (newNames.has(lc)) return styles.medTrNew
    if (switchedNames.has(lc)) return styles.medTrChanged
    if (doseChangedNames.has(lc)) return styles.medTrChanged
    return styles.medTr
  }

  function medChangeBadge(name: string) {
    const lc = name.toLowerCase()
    const change = changes.find(c => c.name.toLowerCase() === lc)
    if (!change) return null
    if (change.changeType === 'New') return <span className={styles.medBadgeNew}>New</span>
    if (change.changeType === 'Switched') return <span className={styles.medBadgeChanged}>Switched</span>
    if (change.changeType === 'DoseChange') return <span className={styles.medBadgeChanged}>Dose changed</span>
    return null
  }

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Medication" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Medications Overview</span>
            {totalChanges > 0 && (
              <span className={`${styles.badge} ${styles.badgeInProgress}`}>{totalChanges} New Change{totalChanges > 1 ? 's' : ''}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardActions editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && meds.length > 0 && (
          <div className={styles.medTableWrap}>
            <table className={styles.medTable}>
              <thead>
                <tr>
                  <th className={styles.medTh}>Medication</th>
                  <th className={styles.medTh}>Dosage</th>
                  <th className={styles.medTh}>Frequency</th>
                  <th className={styles.medTh}>Prescribed</th>
                  <th className={styles.medTh}>Last Refill</th>
                  <th className={styles.medTh}>Provider</th>
                </tr>
              </thead>
              <tbody>
                {sortedMeds.map((m) => {
                  const origIdx = meds.findIndex(x => x.name === m.name)
                  return (
                  <tr key={m.name} className={medRowClass(m.name)}>
                    {editing ? (
                      <>
                        <td className={styles.medTd}><input className={styles.editInputSm} aria-label="Medication name" value={m.name} onChange={setMedField(origIdx, 'name')} /></td>
                        <td className={styles.medTd}><input className={styles.editInputSm} aria-label="Dosage" value={m.dosage} onChange={setMedField(origIdx, 'dosage')} /></td>
                        <td className={styles.medTd}><input className={styles.editInputSm} aria-label="Frequency" value={m.frequency} onChange={setMedField(origIdx, 'frequency')} /></td>
                        <td className={styles.medTd}>{fmtDate(m.startDate)}</td>
                        <td className={styles.medTd}>{fmtDate(m.dispensedDate)}</td>
                        <td className={styles.medTd}><input className={styles.editInputSm} aria-label="Provider" value={m.prescribedBy} onChange={setMedField(origIdx, 'prescribedBy')} /></td>
                      </>
                    ) : (
                      <>
                        <td className={styles.medTd}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {m.name}
                            {medChangeBadge(m.name)}
                          </span>
                          {(() => {
                            const lc = m.name.toLowerCase()
                            const change = changes.find(c => c.name.toLowerCase() === lc)
                            if (change?.changeType === 'Switched' && change.replacedName) {
                              return <span className={styles.medSwitchedFrom}>Replaced {change.replacedName}</span>
                            }
                            if (change?.notes) {
                              return <span className={styles.medSwitchedFrom}>{change.notes}</span>
                            }
                            return null
                          })()}
                        </td>
                        <td className={styles.medTd}>{m.dosage}</td>
                        <td className={styles.medTd}>{m.frequency}</td>
                        <td className={styles.medTd}>{fmtDate(m.startDate)}</td>
                        <td className={styles.medTd}>{fmtDate(m.dispensedDate)}</td>
                        <td className={styles.medTd}>{m.prescribedBy}</td>
                      </>
                    )}
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {open && (data.discontinuedMedications.length > 0 || recentlyStoppedNames.size > 0) && (
          <>
            <hr className={styles.sectionDivider} />
            <button type="button" className={styles.driverToggle} onClick={() => setDiscOpen(o => !o)} aria-expanded={discOpen}>
              Discontinued ({data.discontinuedMedications.length})
              {recentlyStoppedNames.size > 0 && (
                <span className={styles.medBadgeChanged} style={{ marginLeft: 6 }}>{recentlyStoppedNames.size} recent</span>
              )}
              <Icon name={discOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" aria-hidden />
            </button>
            {discOpen && (
              <div className={styles.medTableWrap} style={{ marginTop: 10 }}>
                <table className={styles.medTable}>
                  <thead>
                    <tr>
                      <th className={styles.medTh}>Medication</th>
                      <th className={styles.medTh}>Dosage</th>
                      <th className={styles.medTh}>Stopped</th>
                      <th className={styles.medTh}>Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.discontinuedMedications.map((m, idx) => {
                      const isRecent = recentlyStoppedNames.has(m.name.toLowerCase())
                      return (
                        <tr key={idx} className={isRecent ? styles.medTrDiscRecent : styles.medTr}>
                          <td className={styles.medTd}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className={styles.medTdStrike}>{m.name}</span>
                              {isRecent && <span className={styles.medBadgeDisc}>Stopped</span>}
                            </span>
                            {(() => {
                              const switchChange = changes.find(c => c.changeType === 'Switched' && c.stoppedName?.toLowerCase() === m.name.toLowerCase())
                              if (switchChange) return <span className={styles.medSwitchedFrom}>Switched to {switchChange.name}</span>
                              return null
                            })()}
                          </td>
                          <td className={styles.medTd}>{m.dosage}</td>
                          <td className={styles.medTd}>{fmtDate(m.endDate)}</td>
                          <td className={styles.medTd}>{m.prescribedBy}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      {open && <CardFooter href="#medications" lastUpdated={fmtDate(medsLastUpdated)} />}
    </div>
  )
}

/* ── Card 6: Conditions ── */
function ConditionsCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)
  const primary = data.conditions.filter(c => c.isPrimary)
  const secondary = data.conditions.filter(c => !c.isPrimary)
  const copyText = [
    ...primary.map(c => `${c.condition} (${c.code}) · Primary`),
    ...secondary.map(c => `${c.condition} (${c.code})`),
  ].join('\n')
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="LocalHospital" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Active Conditions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 12 }}>
            {primary.map((c, i) => (
              <div key={i} className={styles.driverRow}>
                <div className={styles.driverBody}>
                  <span className={styles.driverTitle}>{c.condition}</span>
                  <span className={styles.driverDetail}>{c.code} · Primary</span>
                </div>
              </div>
            ))}
            {secondary.map((c, i) => (
              <div key={i} className={styles.driverRow}>
                <div className={styles.driverBody}>
                  <span className={styles.driverTitle}>{c.condition}</span>
                  <span className={styles.driverDetail}>{c.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {open && <CardFooter href="#diagnosis" lastUpdated="N/A" />}
    </div>
  )
}

/* ── Card 7: Care Gaps Overview ── */
function CareGapsCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)
  const gaps = data.openCareGaps
  const copyText = gaps.length === 0
    ? 'No open care gaps'
    : gaps.map(g => `${g.opportunity} (${g.measureCode}${g.ncqaGrouping ? ` · ${g.ncqaGrouping}` : ''})`).join('\n')
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="AssignmentLate" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Care Gaps Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 12 }}>
            {gaps.length === 0
              ? <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No open care gaps</span>
              : gaps.map((g, i) => (
                  <div key={i} className={styles.driverRow}>
                    <div className={styles.driverBody}>
                      <span className={styles.driverTitle}>{g.opportunity}</span>
                      <span className={styles.driverDetail}>{g.measureCode}{g.ncqaGrouping ? ` · ${g.ncqaGrouping}` : ''}</span>
                      {g.measureDescription && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{g.measureDescription}</span>}
                      <span className={`${styles.badge} ${styles.badgeWarning}`} style={{ marginTop: 4, alignSelf: 'flex-start' }}>Incomplete</span>
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>
      {open && <CardFooter href="#care-gaps" lastUpdated="N/A" />}
    </div>
  )
}

/* ── Card 8: Care Plan Goal Overview ── */
type Goal = { goal: string; status: string; category: string; targetDate: string; intervention: string }

export function ActiveGoalsCard({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [items, setItems] = useState<Goal[]>(() => goals.filter(g => g.status !== 'Closed' && g.status !== 'Completed'))

  const setField = (i: number, k: keyof Goal) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setItems(prev => prev.map((g, idx) => idx === i ? { ...g, [k]: e.target.value } : g))

  const addGoal = () => setItems(prev => [...prev, { goal: '', status: 'Active', category: '', targetDate: '', intervention: '' }])
  const removeGoal = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const latestDate = items.reduce<string>((max, g) => g.targetDate > max ? g.targetDate : max, '')


  const copyText = items.map(g =>
    `Goal: ${g.goal}\nCategory: ${g.category}\nTarget: ${g.targetDate}\nIntervention: ${g.intervention}`
  ).join('\n\n')

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Flag" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Care Plan Goal Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && (
              <CardActions
                editing={editing}
                onEdit={() => setEditing(true)}
                onSave={() => setEditing(false)}
                onCopy={() => navigator.clipboard.writeText(copyText)}
              />
            )}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
            {items.length === 0 && !editing
              ? <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No active goals</span>
              : items.map((g, i) => (
                <div key={i} className={styles.driverRow} style={{ alignItems: 'flex-start' }}>
                  <div className={styles.driverBody} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {editing ? (
                      <>
                        <input className={styles.editInputSm} aria-label="Goal" placeholder="Goal" value={g.goal} onChange={setField(i, 'goal')} />
                        <input className={styles.editInputSm} aria-label="Category" placeholder="Category" value={g.category} onChange={setField(i, 'category')} />
                        <input className={styles.editInputSm} aria-label="Target date" placeholder="Target date (YYYY-MM-DD)" value={g.targetDate} onChange={setField(i, 'targetDate')} />
                        <input className={styles.editInputSm} aria-label="Intervention" placeholder="Intervention" value={g.intervention} onChange={setField(i, 'intervention')} />
                      </>
                    ) : (
                      <>
                        <span className={styles.driverTitle}>{g.goal}</span>
                        <span className={styles.driverDetail}>{g.category}{g.targetDate ? ` · Target: ${fmtDate(g.targetDate)}` : ''}</span>
                        {g.intervention && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{g.intervention}</span>}
                      </>
                    )}
                  </div>
                  {editing && (
                    <button type="button" className={styles.iconBtn} aria-label="Remove goal" onClick={() => removeGoal(i)} style={{ flexShrink: 0, marginTop: 2 }}>
                      <Icon name="Close" size="sm" aria-hidden />
                    </button>
                  )}
                </div>
              ))
            }
            {editing && (
              <button type="button" className={styles.showMoreBtn} onClick={addGoal}>
                <Icon name="Add" size="sm" aria-hidden />
                Add goal
              </button>
            )}
          </div>
        )}
      </div>
      {open && <CardFooter href="#care-plan" lastUpdated={latestDate ? fmtDate(latestDate) : 'N/A'} />}
    </div>
  )
}

/* ── Card: Assessments Overview ── */
export function AssessmentsOverviewCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)
  const assessments = data.assessments ?? []
  const overdue = assessments.filter(a => a.status === 'Due')
  const dueSoon = assessments.filter(a => a.status === 'Due Soon')
  const alertCount = overdue.length + dueSoon.length

  const sorted = [...assessments].sort((a, b) => {
    const order = { 'Due': 0, 'Due Soon': 1, 'Up to Date': 2 }
    return order[a.status] - order[b.status]
  })

  function statusBadge(a: AssessmentItem) {
    if (a.status === 'Due') return <span className={`${styles.badge} ${styles.badgeHigh}`}>Overdue</span>
    if (a.status === 'Due Soon') return <span className={`${styles.badge} ${styles.badgeWarning}`}>Due Soon</span>
    return <span className={`${styles.badge} ${styles.badgeActive}`}>Up to Date</span>
  }

  const copyText = sorted.length === 0
    ? 'No assessments on file'
    : sorted.map(a => `${a.name}: ${a.status} · Last completed: ${fmtDate(a.lastCompleted)} · Due: ${fmtDate(a.dueDate)}`).join('\n')

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Assignment" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Assessments Overview</span>
            {alertCount > 0 && (
              <span className={`${styles.badge} ${overdue.length > 0 ? styles.badgeHigh : styles.badgeWarning}`}>
                {alertCount} {overdue.length > 0 ? 'Overdue' : 'Due Soon'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingBottom: 12 }}>
            {sorted.length === 0
              ? <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No assessments on file</span>
              : sorted.map((a, i) => (
                <div key={i} className={a.status !== 'Up to Date' ? styles.driverRowNew : styles.driverRow}
                  style={a.status === 'Up to Date' ? {} : a.status === 'Due' ? { borderLeftColor: 'var(--color-error)', background: 'rgba(211,47,47,0.04)' } : {}}>
                  <div className={styles.driverBody}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className={styles.driverTitle}>{a.name}</span>
                      {statusBadge(a)}
                    </span>
                    <span className={styles.driverDetail}>
                      Last completed: {fmtDate(a.lastCompleted)}
                      {a.scoreLabel ? ` · Score: ${a.scoreLabel}` : a.score !== undefined ? ` · Score: ${a.score}` : ''}
                    </span>
                    <span className={styles.driverDetail}>
                      Due: {fmtDate(a.dueDate)} · {a.frequency}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
      {open && <CardFooter href="#assessments" lastUpdated={sorted[0] ? fmtDate(sorted[0].lastCompleted) : 'N/A'} />}
    </div>
  )
}

/* ── Card: Contact Preferences ── */
function ContactPreferencesCard({ data }: { data: PreCallBriefCardData }) {
  const [open, setOpen] = useState(false)
  const hasAny = data.preferredPhone || data.bestTimeToCall || data.preferredLanguage || data.preferredContactFormat || (data.communicationImpairments?.length ?? 0) > 0

  const copyText = [
    data.preferredPhone    ? `Phone: ${data.preferredPhone}` : '',
    data.bestTimeToCall    ? `Best time to call: ${data.bestTimeToCall}` : '',
    data.preferredLanguage ? `Language: ${data.preferredLanguage}` : '',
    data.preferredContactFormat ? `Preferred contact: ${data.preferredContactFormat}` : '',
    (data.communicationImpairments?.length ?? 0) > 0 ? `Impairments: ${data.communicationImpairments.join(', ')}` : '',
  ].filter(Boolean).join('\n')

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
            <Icon name="ContactPhone" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Member Contact Info</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CopyButton onCopy={() => navigator.clipboard.writeText(copyText)} />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div className={styles.fieldGrid}>
            {!hasAny && (
              <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>No contact preferences on file</span>
            )}
            {data.preferredPhone && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Preferred phone</span>
                <span className={styles.fieldValue}>{data.preferredPhone}</span>
              </div>
            )}
            {data.bestTimeToCall && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Best time to call</span>
                <span className={styles.fieldValue}>{data.bestTimeToCall}</span>
              </div>
            )}
            {data.preferredContactFormat && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Preferred contact</span>
                <span className={styles.fieldValue}>{data.preferredContactFormat}</span>
              </div>
            )}
            {data.preferredLanguage && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Preferred language</span>
                <span className={styles.fieldValue}>{data.preferredLanguage}</span>
              </div>
            )}
            {(data.communicationImpairments?.length ?? 0) > 0 && (
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Communication impairments</span>
                <span className={styles.fieldValue}>{data.communicationImpairments.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {open && <CardFooter href="#contact" lastUpdated={data.lastRecordUpdate || 'N/A'} />}
    </div>
  )
}

/* ── Main export: First outreach ── */
export function PreCallBriefCard({ data }: { data: PreCallBriefCardData }) {
  return (
    <div className={styles.wrapper}>
      <ReferralCard data={data} />
      <EligibilityCard data={data} />
      <MedicationsOverviewCard data={data} />
      <ClaimsOverviewCard data={data} />
      <ContactPreferencesCard data={data} />
      <CareGapsCard data={data} />
      <AssessmentsOverviewCard data={data} />
    </div>
  )
}

/* ── Intake call layout ── */
/* Focus: confirm coverage, understand complexity, set initial care plan goals */
export function IntakeCallCard({ data, goals, carePlanItems = [] }: { data: PreCallBriefCardData; goals: Array<{ goal: string; status: string; category: string; targetDate: string; intervention: string }>; carePlanItems?: CarePlanItem[] }) {
  return (
    <div className={styles.wrapper}>
      <EligibilityCard data={data} defaultOpen={true} />
      <ReferralCard data={data} />
      <MedicationsOverviewCard data={data} />
      <CarePlanOverviewCard items={carePlanItems} />
      <CareGapsCard data={data} />
      <AssessmentsOverviewCard data={data} />
    </div>
  )
}

/* ── Follow-up call layout ── */
/* Focus: review progress, adherence, what's still open */
export function FollowUpCallCard({ data, goals, carePlanItems = [] }: { data: PreCallBriefCardData; goals: Array<{ goal: string; status: string; category: string; targetDate: string; intervention: string }>; carePlanItems?: CarePlanItem[] }) {
  return (
    <div className={styles.wrapper}>
      <CarePlanOverviewCard items={carePlanItems} />
      <AssessmentsOverviewCard data={data} />
      <MedicationsOverviewCard data={data} />
      <CareGapsCard data={data} />
      <ClaimsOverviewCard data={data} />
    </div>
  )
}

/* ── Medication change shape (used by CatchMeUpCardData) ── */
export interface MedChange {
  name: string
  changeType: 'New' | 'Discontinued' | 'Switched' | 'DoseChange'
  /* for Switched: the name of the medication it replaced */
  replacedName?: string
  /* for Discontinued/Switched: the med that was stopped */
  stoppedName?: string
  date: string
  notes?: string
}

/* ── Authorization data shape (used by CatchMeUpCardData) ── */
export interface CatchMeUpAuthorization {
  service: string
  authNumber: string
  status: 'Approved' | 'Pending' | 'Denied'
  requestedDate: string
  decisionDate: string
  validThrough: string
  requestedBy: string
  units?: string
}

/* ── Admission / ER visit data shape ── */
export interface CatchMeUpAdmission {
  visitType: string
  admitDate: string
  dischargeDate?: string
  lengthOfStay?: number
  facility: string
  reason: string
  diagnosisCode: string
  disposition?: string
}

/* ── Diagnosis change data shape ── */
export interface CatchMeUpDiagnosisChange {
  condition: string
  code: string
  changeType: 'New' | 'Resolved' | 'Updated'
  date: string
  notes?: string
}

/* ── Catch Me Up card data ── */
export interface CatchMeUpCardData {
  memberFirstName: string
  lastCallDate: string
  preCallData: PreCallBriefCardData
  medicationChanges: MedChange[]
  authorizations: CatchMeUpAuthorization[]
  admissions: CatchMeUpAdmission[]
  diagnosisChanges: CatchMeUpDiagnosisChange[]
}

/* ── Card: Claims & Authorizations Overview ── */
export function ClaimsWithAuthCard({ data, authorizations, lastCallDate }: { data: PreCallBriefCardData; authorizations: CatchMeUpAuthorization[]; lastCallDate?: string }) {
  const [open, setOpen] = useState(false)
  const pendingAuths = authorizations.filter(a => a.status === 'Pending')
  const [authOpen, setAuthOpen] = useState(pendingAuths.length > 0)

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Receipt" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Claims & Authorizations</span>
            {authorizations.filter(a => a.status === 'Pending').length > 0 && (
              <span className={`${styles.badge} ${styles.badgeInProgress}`}>
                {authorizations.filter(a => a.status === 'Pending').length} New Change{authorizations.filter(a => a.status === 'Pending').length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
        </button>
        {open && (
          <>
            {/* Claims summary */}
            <div className={styles.fieldGrid} style={{ marginBottom: 12 }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Recent claims (90 days)</span>
                <span className={styles.fieldValue}>{data.recentClaims.length}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Approved</span>
                <div className={styles.activeValue}><Icon name="CheckCircle" size="sm" aria-hidden />{data.claimsApproved}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Pending</span>
                <span className={styles.fieldValue}>{data.claimsPending}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Denied</span>
                <span className={styles.fieldValue}>
                  {data.claimsDenied}
                  {data.claimsDenied > 0 && <span className={`${styles.badge} ${styles.badgeHigh}`} style={{ marginLeft: 6 }}>Denied</span>}
                </span>
              </div>
            </div>

            {/* Recent claims list */}
            {data.recentClaims.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {data.recentClaims.slice(0, 2).map((c, i) => {
                  const isNew = !!lastCallDate && c.date >= lastCallDate
                  return (
                    <div key={i} className={isNew ? styles.driverRowNew : styles.driverRow}>
                      <div className={styles.driverBody}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={styles.driverTitle}>{c.visitType}</span>
                          {isNew && <span className={styles.medBadgeNew}>New</span>}
                        </span>
                        <span className={styles.driverDetail}>{fmtDate(c.date)} · {c.provider}</span>
                        <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{c.reasonForVisit}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Authorizations */}
            <hr className={styles.sectionDivider} />
            <button type="button" className={styles.driverToggle} onClick={() => setAuthOpen(o => !o)} aria-expanded={authOpen}>
              <span>Authorizations ({authorizations.length})</span>
              <Icon name={authOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" aria-hidden />
            </button>
            {authOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, paddingBottom: 4 }}>
                {authorizations.length === 0
                  ? <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No authorizations on file</span>
                  : authorizations.map((a, i) => {
                    const isPending = a.status === 'Pending'
                    return (
                      <div key={i} className={isPending ? styles.driverRowNew : styles.driverRow}>
                        <div className={styles.driverBody}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={styles.driverTitle}>{a.service}</span>
                            {isPending && <span className={`${styles.badge} ${styles.badgeInProgress}`}>Pending</span>}
                          </span>
                          <span className={styles.driverDetail}>
                            Auth #{a.authNumber}{a.decisionDate ? ` · Decision ${fmtDate(a.decisionDate)}` : ' · Awaiting decision'}
                          </span>
                          {a.validThrough && <span className={styles.driverDetail}>Valid through {fmtDate(a.validThrough)}{a.units ? ` · ${a.units}` : ''}</span>}
                          <span className={styles.driverDetail}>Requested by {a.requestedBy}</span>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}
          </>
        )}
      </div>
      {open && <CardFooter href="#claims" lastUpdated={data.recentClaims[0] ? fmtDate(data.recentClaims[0].date) : 'N/A'} />}
    </div>
  )
}

/* ── Card: Admissions & ER Visits Overview ── */
export function AdmissionsERCard({ admissions, lastCallDate }: { admissions: CatchMeUpAdmission[]; lastCallDate?: string }) {
  const [open, setOpen] = useState(false)

  const isNew = (a: CatchMeUpAdmission) => !!lastCallDate && a.admitDate >= lastCallDate
  const newCount = admissions.filter(isNew).length

  // Unchanged (historical) first, new/recent last
  const sortedAdmissions = [...admissions].sort((a, b) => {
    const aNew = isNew(a) ? 1 : 0
    const bNew = isNew(b) ? 1 : 0
    return aNew - bNew
  })

  function renderAdmission(a: CatchMeUpAdmission, i: number) {
    const rowClass = isNew(a) ? styles.driverRowNew : styles.driverRow
    return (
      <div key={i} className={rowClass}>
        <div className={styles.driverBody}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={styles.driverTitle}>{a.facility}</span>
            {isNew(a) && <span className={styles.medBadgeNew}>New</span>}
          </span>
          <span className={styles.driverDetail}>
            {a.visitType} · {fmtDate(a.admitDate)}{a.dischargeDate ? ` – ${fmtDate(a.dischargeDate)}` : ''}
            {a.lengthOfStay ? ` · ${a.lengthOfStay} day${a.lengthOfStay > 1 ? 's' : ''}` : ''}
            {' · '}{a.diagnosisCode}
          </span>
          <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{a.reason}</span>
          {a.disposition && <span className={styles.driverDetail}>Disposition: {a.disposition}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="LocalHospital" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Admissions & ER Visits</span>
            {newCount > 0 && (
              <span className={`${styles.badge} ${styles.badgeInProgress}`}>{newCount} New Change{newCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
            {admissions.length === 0 ? (
              <span className={styles.fieldValueSm} style={{ color: 'var(--color-text-secondary)' }}>No admissions or ER visits on record</span>
            ) : (
              sortedAdmissions.map((a, i) => renderAdmission(a, i))
            )}
          </div>
        )}
      </div>
      {open && <CardFooter href="#admissions" lastUpdated={admissions[0] ? fmtDate(admissions[0].admitDate) : 'N/A'} />}
    </div>
  )
}

/* ── Card: Diagnosis Overview ── */
export function DiagnosisOverviewCard({ data, changes }: { data: PreCallBriefCardData; changes: CatchMeUpDiagnosisChange[] }) {
  const [open, setOpen] = useState(false)

  const changeMap = new Map(changes.map(c => [c.condition, c]))

  // Unchanged conditions first, changed/new last
  const sortedConditions = [...data.conditions].sort((a, b) => {
    const aChanged = changeMap.has(a.condition) ? 1 : 0
    const bChanged = changeMap.has(b.condition) ? 1 : 0
    return aChanged - bChanged
  })

  // New diagnoses from changes that aren't already in conditions list
  const conditionNames = new Set(data.conditions.map(c => c.condition))
  const newOnlyChanges = changes.filter(c => !conditionNames.has(c.condition))

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="MedicalInformation" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Diagnosis Overview</span>
            {changes.length > 0 && (
              <span className={`${styles.badge} ${styles.badgeInProgress}`}>{changes.length} New Change{changes.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
        </button>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {sortedConditions.map((c, i) => {
              const change = changeMap.get(c.condition)
              const rowClass = change ? styles.driverRowNew : styles.driverRow
              return (
                <div key={i} className={rowClass}>
                  <div className={styles.driverBody}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={styles.driverTitle}>{c.condition}</span>
                      {change && (
                        <span className={change.changeType === 'New' ? styles.medBadgeNew : styles.medBadgeChanged}>
                          {change.changeType}
                        </span>
                      )}
                    </span>
                    <span className={styles.driverDetail}>
                      {c.code}{c.isPrimary ? ' · Primary' : ''}
                      {change ? ` · ${fmtDate(change.date)}` : ''}
                    </span>
                    {change?.notes && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{change.notes}</span>}
                  </div>
                </div>
              )
            })}
            {newOnlyChanges.map((d, i) => (
              <div key={`new-${i}`} className={styles.driverRowNew}>
                <div className={styles.driverBody}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={styles.driverTitle}>{d.condition}</span>
                    <span className={styles.medBadgeNew}>New</span>
                  </span>
                  <span className={styles.driverDetail}>{d.code} · {fmtDate(d.date)}</span>
                  {d.notes && <span className={styles.driverDetail} style={{ fontStyle: 'italic' }}>{d.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {open && <CardFooter href="#diagnosis" lastUpdated={data.lastRecordUpdate ? fmtDate(data.lastRecordUpdate) : 'N/A'} />}
    </div>
  )
}

/* ── Catch Me Up layout — changes since last call ── */
export function CatchMeUpCard({ data }: { data: CatchMeUpCardData }) {
  return (
    <div className={styles.wrapper}>
      <MedicationsOverviewCard data={data.preCallData} defaultOpen medicationChanges={data.medicationChanges} />
      <ClaimsWithAuthCard data={data.preCallData} authorizations={data.authorizations} lastCallDate={data.lastCallDate} />
      <AdmissionsERCard admissions={data.admissions} lastCallDate={data.lastCallDate} />
      <DiagnosisOverviewCard data={data.preCallData} changes={data.diagnosisChanges} />
    </div>
  )
}
