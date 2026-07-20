import { useState } from 'react'
import { Icon } from '@/components/Icons'
import styles from './SummaryCard.module.css'
import { marcusEligibility, marcusPrograms, marcusMemberDetail, marcusGapsInCare, marcusActivitySummary } from '@/mocks/marcusWebb'

function fmtDate(iso: string): string {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function CardFooter({ href, lastUpdated, onPrompt }: { href: string; lastUpdated: string; onPrompt?: (text: string) => void }) {
  return (
    <div className={styles.cardFooter}>
      <a href={href} target="_blank" rel="noreferrer" className={styles.cardFooterLink}>
        View full details
      </a>
      <span className={styles.cardFooterLastUpdated}>Last updated {lastUpdated}</span>
    </div>
  )
}

function CardCopy() {
  return (
    <div className={styles.cardActions}>
      <button type="button" className={styles.iconBtn} aria-label="Copy">
        <Icon name="ContentCopy" size="sm" aria-hidden />
      </button>
    </div>
  )
}

export function MarcusReferralCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  const program = marcusPrograms.find(p => p.status === 'Active') ?? marcusPrograms[0]
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="PersonAdd" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Referral Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Referral reason</span>
              <span className={styles.fieldValue}>{program?.program ?? 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Referred by</span>
              <span className={styles.fieldValue}>{program?.referralSource ?? 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Referral date</span>
              <span className={styles.fieldValue}>{fmtDate(program?.createdOn ?? '')}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <span className={styles.fieldValue}>{program?.status ?? 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
      {open && <CardFooter href="#referral" lastUpdated={fmtDate(program?.updatedOn ?? '')} onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusEligibilityCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  const [programsOpen, setProgramsOpen] = useState(false)
  const elig = marcusEligibility.eligibilities[0]
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="VerifiedUser" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Eligibility Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && elig && (
          <>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Status</span>
                <div className={styles.activeValue}><Icon name="CheckCircle" size="sm" aria-hidden />{elig.status}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Effective date</span>
                <span className={styles.fieldValue}>{fmtDate(elig.startDate)}</span>
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Plan name</span>
                <span className={styles.fieldValue}>{elig.eligiblityRecords.map(r => r.desc).join(' → ')}</span>
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Line of business</span>
                <span className={styles.fieldValue}>{elig.planType}</span>
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <button
                  type="button"
                  className={styles.driverToggle}
                  onClick={() => setProgramsOpen(o => !o)}
                  aria-expanded={programsOpen}
                  style={{ width: '100%' }}
                >
                  <span className={styles.fieldLabel} style={{ margin: 0 }}>Eligible programs</span>
                  <Icon name={programsOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
                </button>
                {programsOpen && (
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Care Coordination', 'Complex Care Management', 'DCB-T', 'Diabetes Management', 'Health and Wellness', 'Maternal Health Program', 'Substance Use Disorder Program', 'Transitions of Care'].map(name => (
                      <span key={name} className={styles.fieldValue}>{name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {open && <CardFooter href="#eligibility" lastUpdated={fmtDate(elig?.startDate ?? '')} onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusClaimsCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="Receipt" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Claims Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <>
            <div className={styles.fieldGrid} style={{ marginBottom: 16 }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Recent claims (last 90 days)</span>
                <span className={styles.fieldValue}>4</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Approved</span>
                <div className={styles.activeValue}><Icon name="CheckCircle" size="sm" aria-hidden />3</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Pending</span>
                <span className={styles.fieldValue}>
                  1
                  <span className={`${styles.badge} ${styles.badgeWarning}`} style={{ marginLeft: 6 }}>Pending</span>
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Denied</span>
                <span className={styles.fieldValue}>0</span>
              </div>
            </div>
            <hr className={styles.sectionDivider} />
            <div className={styles.sectionTitle}>Recent visits</div>
            <div className={styles.activityRow}>
              <div className={styles.activityBody}>
                <div className={styles.activityTitle}>PCP office visit — 02/20/2026</div>
                <div className={styles.activityMeta}>
                  <span>Dr. Kim · UCSF Medical Center</span>
                  <span className={styles.activitySep}>·</span>
                  <span>Diabetes &amp; hypertension follow-up</span>
                </div>
              </div>
              <span className={`${styles.badge} ${styles.badgeDone}`}>Approved</span>
            </div>
            <div className={styles.activityRow}>
              <div className={styles.activityBody}>
                <div className={styles.activityTitle}>Sleep consult — 11/20/2025</div>
                <div className={styles.activityMeta}>
                  <span>Sleep Medicine, UCSF</span>
                  <span className={styles.activitySep}>·</span>
                  <span>CPAP titration / OSA management</span>
                </div>
              </div>
              <span className={`${styles.badge} ${styles.badgeDone}`}>Approved</span>
            </div>
            <div className={styles.activityRow}>
              <div className={styles.activityBody}>
                <div className={styles.activityTitle}>Urgent care — 06/05/2025</div>
                <div className={styles.activityMeta}>
                  <span>Sutter Health Urgent Care</span>
                  <span className={styles.activitySep}>·</span>
                  <span>Upper respiratory infection (J06.9)</span>
                </div>
              </div>
              <span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span>
            </div>
          </>
        )}
      </div>
      {open && <CardFooter href="#claims" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusNotesCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="StickyNote2" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Notes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <div className={styles.contactEntry}>
            <div className={styles.contactBody}>
              <div className={styles.contactMetaRow}>
                <span className={styles.contactDate}>07/16/2026</span>
                <span className={styles.contactSep}>·</span>
                <span className={styles.contactChannel}>Telephonic</span>
                <span className={styles.contactSep}>·</span>
                <span className={styles.contactChannel}>Sandra Ortiz, Care Coordinator</span>
              </div>
              <p className={styles.contactSummary}>Called Marcus to connect. He was easy to talk to and engaged quickly once we got talking. He mentioned he's been managing his diabetes on his own for a few years and feels like he has a handle on it, but admitted his eating habits have slipped since starting a new role at work about 8 months ago — skipping lunch most days, eating late. He's aware his A1C ticked up at his last visit and wants to bring it back down before his September lab draw.</p>
              <p className={styles.contactSummary} style={{ marginTop: 8 }}>He brought up unprompted that he's been more stressed than usual — new job pressure and his teenage son having some issues at school. Didn't elaborate much but said it's been weighing on him. He wasn't resistant, just matter-of-fact about it. May be open to a behavioral health conversation if it comes up naturally. He also mentioned he prefers handling things on his own schedule — may be a good candidate for digital care management. His wife Jennifer handles most of the family scheduling and may be a useful coordination contact. Best reached on his cell after 5pm on weekdays. Handing off for full clinical assessment and care plan build.</p>
            </div>
          </div>
        )}
      </div>
      {open && <CardFooter href="#notes" lastUpdated="07/16/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusMedicationsCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  const meds = [
    { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', startDate: '2023-05-01', dispensedDate: '2026-02-20', prescribedBy: 'Dr. Kim' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2022-08-15', dispensedDate: '2026-02-20', prescribedBy: 'Dr. Kim' },
    { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily (evening)', startDate: '2022-08-15', dispensedDate: '2026-02-20', prescribedBy: 'Dr. Kim' },
    { name: 'CPAP therapy', dosage: '—', frequency: 'Nightly', startDate: '2024-03-10', dispensedDate: '2026-02-20', prescribedBy: 'Dr. Kim' },
  ]

  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="Medication" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Medications Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (<>
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
                {meds.map((m, idx) => (
                  <tr key={idx} className={styles.medTr}>
                    <td className={`${styles.medTd} ${styles.medTdBold}`}>{m.name}</td>
                    <td className={styles.medTd}>{m.dosage}</td>
                    <td className={styles.medTd}>{m.frequency}</td>
                    <td className={styles.medTd}>{fmtDate(m.startDate)}</td>
                    <td className={styles.medTd}>{fmtDate(m.dispensedDate)}</td>
                    <td className={styles.medTd}>{m.prescribedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr className={styles.sectionDivider} />
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Last reconciliation</span>
              <span className={styles.fieldValueSm}>02/20/2026 · Dr. Kim, UCSF</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Pharmacy</span>
              <span className={styles.fieldValueSm}>CVS — San Francisco, CA</span>
            </div>
          </div>
        </>)}
      </div>
      {open && <CardFooter href="#medications" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusDiagnosesCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="LocalHospital" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Diagnoses & Conditions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <>
            <div className={styles.sectionTitle}>Conditions tied to this referral</div>
            <div className={styles.itemBlock}>
              <div className={styles.itemTitle}>Type 2 Diabetes Mellitus (E11.9)</div>
              <div className={styles.itemSubtitle}>Primary referral driver · Diagnosed Mar 2023</div>
            </div>
            <div className={styles.itemBlock}>
              <div className={styles.itemTitle}>Essential Hypertension (I10)</div>
              <div className={styles.itemSubtitle}>Diagnosed Aug 2022</div>
            </div>
            <div className={styles.itemBlock}>
              <div className={styles.itemTitle}>Hyperlipidemia (E78.5)</div>
              <div className={styles.itemSubtitle}>Diagnosed Aug 2022</div>
            </div>
            <div className={styles.itemBlock}>
              <div className={styles.itemTitle}>Obesity (E66.09)</div>
              <div className={styles.itemSubtitle}>Diagnosed Mar 2023</div>
            </div>
            <hr className={styles.sectionDivider} />
            <div className={styles.sectionTitle}>Prior care management history</div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Previous enrollment</span>
                <span className={styles.fieldValue}>Chronic Disease Management · Active since 02/01/2026</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last HRA</span>
                <span className={styles.fieldValue}>Completed 01/15/2026 · Score 52 · 1 social risk identified</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last PCP visit</span>
                <span className={styles.fieldValue}>02/20/2026 · Dr. Kim, UCSF — diabetes & hypertension follow-up</span>
              </div>
            </div>
          </>
        )}
      </div>
      {open && <CardFooter href="#diagnoses" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusRiskScoreCard({ onPrompt, defaultOpen = false }: { onPrompt: (text: string) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [driversOpen, setDriversOpen] = useState(false)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="MonitorHeart" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Risk Score Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <>
            <div className={styles.fieldGrid} style={{ marginBottom: 16 }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Risk tier</span>
                <span className={styles.fieldValue}>Tier 2</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Risk level</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>Moderate</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Score</span>
                <span className={styles.fieldValue}>52 / 100</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last updated</span>
                <span className={styles.fieldValue}>02/20/2026</span>
              </div>
            </div>
            <button type="button" className={styles.driverToggle} onClick={() => setDriversOpen(o => !o)} aria-expanded={driversOpen}>
              <span>Why this score?</span>
              <Icon name={driversOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
            </button>
            {driversOpen && (
              <div style={{ marginTop: 8 }}>
                {[
                  { condition: 'Type 2 Diabetes Mellitus', detail: 'A1C at 7.2%, active monitoring needed' },
                  { condition: 'Essential Hypertension', detail: 'Controlled on Amlodipine, home monitoring' },
                  { condition: 'Obesity', detail: 'BMI elevated, sedentary work schedule' },
                ].map((d, i) => (
                  <div key={i} className={styles.activityRow}>
                    <div className={styles.activityBody}>
                      <div className={styles.activityTitle}>{d.condition}</div>
                      <div className={styles.activityMeta}><span>{d.detail}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {open && <CardFooter href="#risk" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusContactInfoCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  const preferred = marcusMemberDetail.phones.find(p => p.isPreferred)
  const other = marcusMemberDetail.phones.find(p => !p.isPreferred)
  const addr = marcusMemberDetail.addresses.find(a => a.isPrimary)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="ContactPhone" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Member Contact Info</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <div className={styles.fieldGrid}>
            {preferred && (
              <>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Preferred phone ({preferred.phoneType})</span>
                  <span className={styles.fieldValue}>{preferred.phoneNumber}</span>
                </div>
                {preferred.bestTimeToCall && (
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Best time to call</span>
                    <span className={styles.fieldValue}>{preferred.bestTimeToCall}</span>
                  </div>
                )}
              </>
            )}
            {other && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>{other.phoneType} phone</span>
                <span className={styles.fieldValue}>{other.phoneNumber}</span>
              </div>
            )}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Preferred contact</span>
              <span className={styles.fieldValue}>{marcusMemberDetail.preferredContactFormat}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Preferred language</span>
              <span className={styles.fieldValue}>{marcusMemberDetail.primaryLanguage}</span>
            </div>
            {addr && (
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Address</span>
                <span className={styles.fieldValue}>{addr.address1}, {addr.city}, {addr.state} {addr.zip}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {open && <CardFooter href="#contact" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusGapsInCareCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  const openGaps = marcusGapsInCare.filter(g => g.opportunityStatus === 'Open')
  const closedGaps = marcusGapsInCare.filter(g => g.opportunityStatus !== 'Open')
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="Healing" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Gaps in Care</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <>
            {openGaps.map((g, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityBody}>
                  <div className={styles.activityTitle}>{g.opportunity}</div>
                  <div className={styles.activityMeta}><span>Open · {g.measureDescription}</span></div>
                </div>
              </div>
            ))}
            {closedGaps.length > 0 && (
              <>
                <hr className={styles.sectionDivider} />
                <div className={styles.sectionTitle}>Closed</div>
                {closedGaps.map((g, i) => (
                  <div key={i} className={styles.activityRow}>
                    <div className={styles.activityBody}>
                      <div className={styles.activityTitle}>{g.opportunity}</div>
                      <div className={styles.activityMeta}><span>Closed</span></div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
      {open && <CardFooter href="#gaps" lastUpdated="01/01/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusAssessmentsCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="Assignment" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Assessments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>
        {open && (
          <>
            {marcusActivitySummary.map((a, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityBody}>
                  <div className={styles.activityTitle}>{a.assessmentName}</div>
                  <div className={styles.activityMeta}>
                    <span>{a.assessmentStatus}</span>
                    <span className={styles.activitySep}>·</span>
                    <span>{fmtDate(a.assessmentCompletedDateTime.split('T')[0])}</span>
                    {a.assessmentScore != null && (
                      <>
                        <span className={styles.activitySep}>·</span>
                        <span>Score: {a.assessmentScore}</span>
                      </>
                    )}
                  </div>
                  <a href="#assessments" className={styles.cardFooterLink} style={{ marginTop: 4 }}>
                    {a.assessmentName.includes('SDOH') ? 'View SDOH Assessment' : 'View HRA'}
                  </a>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {open && <CardFooter href="#assessments" lastUpdated="01/15/2026" onPrompt={onPrompt} />}
    </div>
  )
}

const PROGRAM_ELIGIBILITY = [
  { name: 'Care Coordination',            eligible: true,  status: 'Enrolled',     reason: 'Active enrollment since 02/01/2026' },
  { name: 'Diabetes Management',          eligible: true,  status: 'Enrolled',     reason: 'T2DM (E11.9) — primary referral driver' },
  { name: 'Complex Care Management',      eligible: true,  status: 'Not enrolled', reason: 'Meets criteria: HCC score 2.4, 2+ chronic conditions' },
  { name: 'Health and Wellness',          eligible: true,  status: 'Not enrolled', reason: 'Eligible via Blue Shield PPO Silver' },
  { name: 'Transitions of Care',          eligible: true,  status: 'Not enrolled', reason: 'Eligible following any future acute episode' },
  { name: 'DCB-T',                        eligible: false, status: 'Not eligible', reason: 'Does not meet clinical criteria' },
  { name: 'Maternal Health Program',      eligible: false, status: 'Not eligible', reason: 'Not applicable' },
  { name: 'Substance Use Disorder Program', eligible: false, status: 'Not eligible', reason: 'No SUD diagnosis on record' },
]

export function MarcusProgramEligibilityCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="PlaylistAddCheck" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>Program Eligibility</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <>
            <div className={styles.fieldGrid} style={{ marginBottom: 12 }}>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Plan</span>
                <span className={styles.fieldValue}>Blue Shield PPO Silver · Commercial · Active since 01/01/2026</span>
              </div>
            </div>
            <hr className={styles.sectionDivider} />
            <div className={styles.sectionTitle}>Clinical programs</div>
            {PROGRAM_ELIGIBILITY.map((p, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityBody}>
                  <div className={styles.activityTitle}>{p.name}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {open && <CardFooter href="#programs" lastUpdated="07/15/2026" onPrompt={onPrompt} />}
    </div>
  )
}

export function MarcusERVisitsCard({ onPrompt }: { onPrompt: (text: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={open ? styles.cardExpanded : styles.card}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button type="button" className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`} onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="LocalHospital" size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>ER Visits & Hospitalizations</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {open && <CardCopy />}
            <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
          </div>
        </button>

        {open && (
          <>
            <div className={styles.fieldGrid} style={{ marginBottom: 12 }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>ER visits (past 12 months)</span>
                <span className={styles.fieldValue}>0</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Hospitalizations (past 12 months)</span>
                <span className={styles.fieldValue}>0</span>
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.fieldLabel}>Last acute episode</span>
                <span className={styles.fieldValue}>None on record in the past 12 months</span>
              </div>
            </div>
            <hr className={styles.sectionDivider} />
            <div className={styles.sectionTitle}>Recent visits</div>
            {[
              { date: '02/20/2026', type: 'PCP Office Visit', provider: 'Dr. Kim · UCSF Medical Center', reason: 'Diabetes & hypertension follow-up' },
              { date: '11/20/2025', type: 'Sleep Medicine Consult', provider: 'Dr. Nguyen · UCSF Sleep Disorders Center', reason: 'CPAP titration · Obstructive sleep apnea' },
              { date: '09/14/2025', type: 'PCP Office Visit', provider: 'Dr. Kim · UCSF Medical Center', reason: 'Lab review — HbA1c and lipid panel' },
              { date: '06/05/2025', type: 'Urgent Care', provider: 'UCSF Urgent Care · San Francisco', reason: 'Upper respiratory infection (J06.9)' },
            ].map((v, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityBody}>
                  <div className={styles.activityTitle}>{v.type} — {v.date}</div>
                  <div className={styles.activityMeta}>
                    <span>{v.provider}</span>
                    <span className={styles.activitySep}>·</span>
                    <span>{v.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {open && <CardFooter href="#visits" lastUpdated="02/20/2026" onPrompt={onPrompt} />}
    </div>
  )
}
