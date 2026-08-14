import { useRef, useState } from 'react'
import { Icon } from '@/components/Icons'
import styles from './UracChecklistCard.module.css'

interface UracItem {
  id: number
  text: string
  checked: boolean
}

interface UracSection {
  title: string
  icon: string
  items: UracItem[]
}

let _id = 1000
const uid = () => ++_id

type SectionDef = { title: string; icon: string; rawItems: string[]; preChecked: number[] }

export type ChecklistType = 'case-closure' | 'compliance' | 'handoff' | 'general'

// ── Case closure (URAC/NCQA) ──────────────────────────────────────────────────
const CASE_CLOSURE_DEFS: SectionDef[] = [
  {
    title: 'Member identification & intake', icon: '01',
    rawItems: [
      'Verify member eligibility and active enrollment status',
      'Confirm member has been assessed for care management eligibility',
      'Document the referral source and referral date',
      'Record member consent for care management participation',
      'Assign appropriate acuity level / stratification tier',
    ],
    preChecked: [0, 1, 3],
  },
  {
    title: 'Assessment & care planning', icon: '02',
    rawItems: [
      'Complete or review initial comprehensive health assessment',
      "Identify member's primary diagnoses, comorbidities, and SDOH factors",
      'Document member goals using person-centered language',
      'Ensure care plan is individualized and evidence-based',
      'Set measurable outcomes with target timeframes',
      'Obtain member agreement on care plan goals',
    ],
    preChecked: [0, 1, 3],
  },
  {
    title: 'Care coordination & outreach', icon: '03',
    rawItems: [
      'Document all outreach attempts (date, time, method, outcome)',
      'Coordinate with treating providers as needed for this member',
      'Facilitate transitions of care following inpatient or ER discharge',
      'Address barriers to care access (transport, cost, language)',
      'Verify follow-up appointments are scheduled post-discharge',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Documentation & timeliness', icon: '04',
    rawItems: [
      'Document all member contacts within required timeframe (typically 24–48 hrs)',
      'Ensure all notes include date, time, duration, and method of contact',
      'Update care plan within required interval after significant changes',
      'Record interventions, referrals made, and member response',
      'Close or escalate open action items appropriately',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Utilization & clinical criteria', icon: '05',
    rawItems: [
      'Apply evidence-based clinical criteria for utilization decisions (e.g., MCG, InterQual)',
      'Document clinical rationale for all approval or denial decisions',
      'Ensure authorization decisions are made within required turnaround times',
      'Route complex cases to physician reviewer when criteria not met',
      'Notify members and providers of adverse determinations per policy',
    ],
    preChecked: [],
  },
  {
    title: 'Appeals & grievances', icon: '06',
    rawItems: [
      'Inform member of right to appeal any adverse determination',
      'Log grievances and appeals in the tracking system on day received',
      'Adhere to acknowledgment and resolution timeframes per URAC standards',
      'Escalate quality-of-care concerns to clinical leadership as needed',
    ],
    preChecked: [0, 1, 2, 3],
  },
  {
    title: 'Quality & compliance', icon: '07',
    rawItems: [
      'Confirm staff credentials and licensure are current in the system',
      'Participate in required QI activities and case review meetings',
      'Follow HIPAA protocols for all member communications and record handling',
      'Flag potential quality-of-care issues for review',
      'Complete required continuing education per URAC staff training standards',
    ],
    preChecked: [0, 1, 2, 3, 4],
  },
]

// Sarah Williams: ~90% — 3 items missing across 3 sections
const SARAH_CASE_CLOSURE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4],
  1: [0, 1, 2, 3, 4],     // missing item 5 (member agreement)
  2: [0, 1, 2, 4],        // missing item 3 (barriers to care)
  3: [0, 1, 2, 3],        // missing item 4 (close/escalate open items)
  4: [0, 1, 2, 3, 4],
  5: [0, 1, 2, 3],
  6: [0, 1, 2, 3, 4],
}

// James O'Connor: ~75% complete
const JAMES_CASE_CLOSURE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4],
  1: [0, 1, 2, 3],        // missing items 4 & 5
  2: [0, 1],              // missing items 2–4
  3: [0, 1, 2],           // missing items 3 & 4
  4: [0, 1, 2, 3, 4],
  5: [0, 1, 2, 3],
  6: [0, 1, 2, 3, 4],
}

// Jackson Thomas: ~65% — more gaps
const JACKSON_CASE_CLOSURE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 3],
  1: [0, 1, 3],
  2: [0, 1],
  3: [0, 1],
  4: [],
  5: [0, 1, 2, 3],
  6: [0, 1, 2, 3, 4],
}

// ── Compliance audit ──────────────────────────────────────────────────────────
const COMPLIANCE_DEFS: SectionDef[] = [
  {
    title: 'Enrollment & eligibility verification', icon: '01',
    rawItems: [
      'Confirm member enrollment is active in all relevant programs',
      'Verify eligibility records match payer system of record',
      'Validate consent forms are on file and within required validity period',
      'Confirm correct line of business and program assignment',
      'Check for dual eligibility or coordination of benefits requirements',
    ],
    preChecked: [0, 1, 3],
  },
  {
    title: 'Care plan compliance', icon: '02',
    rawItems: [
      'Confirm care plan was completed within 30 days of enrollment',
      'Verify care plan has been reviewed and updated within the last 90 days',
      'Ensure goals are measurable, time-bound, and member-centered',
      'Confirm all open goals have assigned interventions and target dates',
      'Validate care plan reflects current diagnoses and risk stratification',
      'Confirm member or authorized representative signed or verbally agreed to the plan',
    ],
    preChecked: [0, 1, 2],
  },
  {
    title: 'Outreach & contact documentation', icon: '03',
    rawItems: [
      'Verify at least one successful contact is documented within the required interval',
      'Confirm all outreach attempts are logged with date, method, and outcome',
      'Validate that unanswered outreach has documented follow-up attempts',
      'Confirm contact notes include duration and care manager identifier',
      'Check that no required contact windows are missed or overdue',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Authorization & utilization management', icon: '04',
    rawItems: [
      'Confirm all active authorizations are within validity window',
      'Verify no services were rendered without required prior authorization',
      'Confirm authorization decisions were documented within turnaround time standards',
      'Validate that pending authorizations have status updates within required intervals',
      'Confirm denied authorizations have appropriate adverse determination notices sent',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'HEDIS & quality measure compliance', icon: '05',
    rawItems: [
      'Review open HEDIS gaps in care for this member',
      'Confirm any closed gaps have supporting documentation or claim evidence',
      'Verify appropriate screenings are ordered or scheduled',
      'Confirm medication adherence measures are being tracked',
      'Check that supplemental data submissions are complete and accurate',
    ],
    preChecked: [0],
  },
  {
    title: 'Privacy & documentation standards', icon: '06',
    rawItems: [
      'Confirm all notes are entered under the correct member record',
      'Verify no PHI was transmitted via unsecured channels',
      'Confirm all disclosures are documented in the member record',
      'Validate that corrections to records follow approved amendment procedures',
    ],
    preChecked: [0, 1, 2, 3],
  },
]

// Sarah: mostly compliant except gaps in care and authorization
const SARAH_COMPLIANCE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4],
  1: [0, 1, 2, 3, 4, 5],
  2: [0, 1, 2, 3, 4],
  3: [0, 1, 2, 4],        // missing item 3 (pending auth updates)
  4: [0, 1, 3],           // missing items 2 & 4 (screenings, supplemental data)
  5: [0, 1, 2, 3],
}

const JAMES_COMPLIANCE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3],        // missing dual-eligibility check
  1: [0, 1, 2, 3],        // missing items 4 & 5
  2: [0, 1],              // missing items 2–4
  3: [0, 1],              // missing items 2–4
  4: [0],                 // mostly open
  5: [0, 1, 2, 3],
}

const JACKSON_COMPLIANCE_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 3],
  1: [0, 2],
  2: [0, 1],
  3: [],                  // all pending
  4: [],
  5: [0, 1, 2, 3],
}

// ── Handoff summary ───────────────────────────────────────────────────────────
const HANDOFF_DEFS: SectionDef[] = [
  {
    title: 'Member overview', icon: '01',
    rawItems: [
      'Document member demographics, preferred contact method, and best time to call',
      'Confirm active program enrollment(s) and payer line of business',
      'Note any communication impairments, language needs, or accessibility requirements',
      'Include primary caregiver or emergency contact information',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Clinical summary', icon: '02',
    rawItems: [
      'List all active diagnoses with ICD-10 codes in order of acuity',
      'Include most recent risk score, tier, and key risk drivers',
      'Document current medication list including dosage and prescribing provider',
      'Note any known allergies or adverse drug reactions',
      'Summarize recent hospitalizations, ER visits, or specialist consultations',
      'Highlight any pending labs, imaging, or diagnostic results',
    ],
    preChecked: [0, 1, 2],
  },
  {
    title: 'Care plan & goals', icon: '03',
    rawItems: [
      'Summarize active care plan goals and current status for each',
      'Identify barriers to goal achievement and interventions in place',
      'Note any goals closed, completed, or paused — with rationale',
      'Confirm target dates for each active goal',
      'Include member strengths that support goal achievement',
    ],
    preChecked: [0, 1, 3],
  },
  {
    title: 'Open action items', icon: '04',
    rawItems: [
      'List all pending referrals and their current status',
      'Document open authorizations requiring follow-up',
      'Note any care gaps not yet addressed with recommended next steps',
      'Include outstanding outreach attempts or scheduled callbacks',
      'Flag any escalations, grievances, or quality concerns in progress',
    ],
    preChecked: [0],
  },
  {
    title: 'Transition & receiving care manager notes', icon: '05',
    rawItems: [
      'Document reason for transfer (workload rebalance, reassignment, case ownership change)',
      'Note last contact date, what was discussed, and any commitments made to the member',
      "Describe member's engagement level and preferred communication style",
      'Flag upcoming appointments or deadlines the receiving CM should be aware of',
      'Include any sensitive context (grief, housing instability, trust concerns)',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Documentation sign-off', icon: '06',
    rawItems: [
      'Confirm all recent contacts and notes are finalized in the system',
      'Verify care plan status is current and reflects last interaction',
      'Confirm handoff note is saved and linked to member record',
      'Notify receiving care manager and confirm acceptance of transfer',
    ],
    preChecked: [0, 1],
  },
]

const SARAH_HANDOFF_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3],
  1: [0, 1, 2, 3, 4, 5],
  2: [0, 1, 2, 3, 4],
  3: [0, 1, 2, 3],        // missing item 4 (escalations)
  4: [0, 1, 2],           // missing items 3 & 4
  5: [0, 1],              // handoff note and CM notification not done
}

const JAMES_HANDOFF_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3],
  1: [0, 1, 2],           // missing items 3–5
  2: [0, 1, 3],
  3: [0],
  4: [0, 1],
  5: [],                  // sign-off not started
}

const JACKSON_HANDOFF_OVERRIDES: Record<number, number[]> = {
  0: [0, 1],
  1: [0, 1, 2],
  2: [0, 1],
  3: [],
  4: [0],
  5: [],
}

// ── General compliance ────────────────────────────────────────────────────────
const GENERAL_DEFS: SectionDef[] = [
  {
    title: 'Consent & member rights', icon: '01',
    rawItems: [
      'Confirm signed consent for care management on file',
      'Verify member rights notice was provided and documented',
      'Confirm authorization for release of information is current',
      'Document verbal consent when written is not available',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Documentation completeness', icon: '02',
    rawItems: [
      'All contact notes include date, time, duration, and contact method',
      'Each note is entered under the correct member record',
      'All corrections follow approved amendment procedure',
      'Notes are finalized within 24 hours of contact',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'Care plan timeliness', icon: '03',
    rawItems: [
      'Initial care plan completed within 30 days of enrollment',
      'Care plan reviewed and updated within the last 90 days',
      'All active goals have interventions and target dates assigned',
      'Member or representative confirmed agreement to care plan',
    ],
    preChecked: [0, 1, 2],
  },
  {
    title: 'Outreach compliance', icon: '04',
    rawItems: [
      'Required contact frequency met per program guidelines',
      'All unanswered outreach attempts documented with follow-up',
      'No required contact windows missed or overdue',
      'Preferred contact method honored when documented',
    ],
    preChecked: [0, 1],
  },
  {
    title: 'HEDIS / quality measures', icon: '05',
    rawItems: [
      'Open HEDIS gaps reviewed and addressed or escalated',
      'Appropriate screenings ordered or scheduled',
      'Medication adherence measures tracked',
      'Supplemental data submissions up to date',
    ],
    preChecked: [0],
  },
  {
    title: 'Authorization & utilization', icon: '06',
    rawItems: [
      'All active authorizations within validity window',
      'No services rendered without required prior authorization',
      'Adverse determination notices sent within required timeframe',
      'Pending authorizations have status updates per policy',
    ],
    preChecked: [0, 1],
  },
]

// Reuse same override patterns as compliance
const SARAH_GENERAL_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2, 3],
  1: [0, 1, 2, 3],
  2: [0, 1, 2, 3],
  3: [0, 1, 2, 3],
  4: [0, 1, 3],
  5: [0, 1, 2, 3],
}

const JAMES_GENERAL_OVERRIDES: Record<number, number[]> = {
  0: [0, 1, 2],
  1: [0, 1],
  2: [0, 1, 2],
  3: [0, 1],
  4: [0],
  5: [0, 1],
}

const JACKSON_GENERAL_OVERRIDES: Record<number, number[]> = {
  0: [0, 1],
  1: [0, 1],
  2: [0, 2],
  3: [],
  4: [],
  5: [0, 1, 2, 3],
}

// ── Builder ───────────────────────────────────────────────────────────────────
type OverrideMap = Record<string, Record<number, number[]>>

const DEFS_MAP: Record<ChecklistType, SectionDef[]> = {
  'case-closure': CASE_CLOSURE_DEFS,
  'compliance':   COMPLIANCE_DEFS,
  'handoff':      HANDOFF_DEFS,
  'general':      GENERAL_DEFS,
}

const OVERRIDES_MAP: Record<ChecklistType, OverrideMap> = {
  'case-closure': {
    AH91427634: SARAH_CASE_CLOSURE_OVERRIDES,
    AH60273845: JAMES_CASE_CLOSURE_OVERRIDES,
    AH58319473: JACKSON_CASE_CLOSURE_OVERRIDES,
  },
  'compliance': {
    AH91427634: SARAH_COMPLIANCE_OVERRIDES,
    AH60273845: JAMES_COMPLIANCE_OVERRIDES,
    AH58319473: JACKSON_COMPLIANCE_OVERRIDES,
  },
  'handoff': {
    AH91427634: SARAH_HANDOFF_OVERRIDES,
    AH60273845: JAMES_HANDOFF_OVERRIDES,
    AH58319473: JACKSON_HANDOFF_OVERRIDES,
  },
  'general': {
    AH91427634: SARAH_GENERAL_OVERRIDES,
    AH60273845: JAMES_GENERAL_OVERRIDES,
    AH58319473: JACKSON_GENERAL_OVERRIDES,
  },
}

export function buildSections(type: ChecklistType, memberId?: string): UracSection[] {
  const defs = DEFS_MAP[type]
  const memberOverrides = memberId ? (OVERRIDES_MAP[type][memberId] ?? null) : null
  return defs.map((s, si) => {
    const preChecked = memberOverrides ? (memberOverrides[si] ?? s.preChecked) : s.preChecked
    return {
      title: s.title,
      icon: s.icon,
      items: s.rawItems.map((text, i) => ({
        id: uid(),
        text,
        checked: preChecked.includes(i),
      })),
    }
  })
}

export function UracChecklistCard({ memberId, checklistType = 'case-closure' }: { memberId?: string; checklistType?: ChecklistType }) {
  const [sections, setSections] = useState<UracSection[]>(() => buildSections(checklistType, memberId))
  const [open, setOpen] = useState<boolean[]>(DEFS_MAP[checklistType].map(() => false))
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [addingIn, setAddingIn] = useState<number | null>(null)
  const [addText, setAddText] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const totalAll = sections.reduce((s, sec) => s + sec.items.length, 0)
  const totalDone = sections.reduce((s, sec) => s + sec.items.filter(i => i.checked).length, 0)
  const pct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0

  const toggleCheck = (si: number, id: number) => {
    setSections(prev => prev.map((sec, r) =>
      r !== si ? sec : { ...sec, items: sec.items.map(it => it.id === id ? { ...it, checked: !it.checked } : it) }
    ))
    setOpen(prev => prev.map((v, r) => r === si ? true : v))
  }

  const deleteItem = (si: number, id: number) => {
    setSections(prev => prev.map((sec, r) =>
      r !== si ? sec : { ...sec, items: sec.items.filter(it => it.id !== id) }
    ))
  }

  const startEdit = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const commitEdit = (si: number, id: number) => {
    if (editText.trim()) {
      setSections(prev => prev.map((sec, r) =>
        r !== si ? sec : { ...sec, items: sec.items.map(it => it.id === id ? { ...it, text: editText.trim() } : it) }
      ))
    }
    setEditingId(null)
  }

  const startAdd = (si: number) => {
    setAddingIn(si)
    setAddText('')
    setOpen(prev => prev.map((v, r) => r === si ? true : v))
    setTimeout(() => addInputRef.current?.focus(), 0)
  }

  const commitAdd = (si: number) => {
    if (addText.trim()) {
      setSections(prev => prev.map((sec, r) =>
        r !== si ? sec : { ...sec, items: [...sec.items, { id: uid(), text: addText.trim(), checked: false }] }
      ))
    }
    setAddingIn(null)
    setAddText('')
  }

  return (
    <div className={styles.card}>
      <div
        className={styles.topBar}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall checklist completion: ${totalDone} of ${totalAll} items`}
      >
        <div className={styles.progressWrap}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.progressLabel} aria-hidden="true">{totalDone} / {totalAll} complete</span>
      </div>

      {sections.map((section, si) => {
        const done = section.items.filter(i => i.checked).length
        const total = section.items.length
        const isOpen = open[si]
        const badgeVariant = total === 0 ? 'none' : done === total ? 'done' : done > 0 ? 'partial' : 'none'
        const statusLabel = total === 0 ? '0 of 0' : done === total ? 'complete' : `${done} of ${total} complete`
        const panelId = `checklist-panel-${si}`

        return (
          <div key={si} className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setOpen(prev => prev.map((v, r) => r === si ? !v : v))}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={`${section.title}, ${statusLabel}`}
            >
              <div className={styles.sectionTitle} aria-hidden="true">
                <span className={styles.sectionIcon} aria-hidden="true">{section.icon}</span>
                {section.title}
                <span className={`${styles.badge} ${styles[`badge_${badgeVariant}`]}`}>
                  {total === 0 ? '0/0' : done === total ? 'Complete' : `${done}/${total}`}
                </span>
              </div>
              <Icon name={isOpen ? 'ExpandMore' : 'ChevronRight'} size="xs" color="action" aria-hidden />
            </button>

            {isOpen && (
              <div
                id={panelId}
                className={styles.items}
                role="list"
                aria-label={`${section.title} checklist items`}
              >
                {section.items.map(item => (
                  <div key={item.id} className={styles.item} role="listitem">
                    <input
                      type="checkbox"
                      id={`checklist-cb-${item.id}`}
                      className={styles.checkbox}
                      checked={item.checked}
                      onChange={() => toggleCheck(si, item.id)}
                      aria-label={item.text}
                    />
                    {editingId === item.id ? (
                      <input
                        ref={editInputRef}
                        className={styles.editInput}
                        value={editText}
                        aria-label="Edit checklist item"
                        onChange={e => setEditText(e.target.value)}
                        onBlur={() => commitEdit(si, item.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit(si, item.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        className={`${styles.itemLabel} ${item.checked ? styles.itemLabelChecked : ''}`}
                        aria-label={`Edit: ${item.text}`}
                        onClick={() => startEdit(item.id, item.text)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            startEdit(item.id, item.text)
                          }
                        }}
                      >
                        {item.text}
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => deleteItem(si, item.id)}
                      aria-label={`Delete: ${item.text}`}
                    >
                      <Icon name="Close" size="xs" color="action" aria-hidden />
                    </button>
                  </div>
                ))}

                {addingIn === si ? (
                  <div className={styles.addRow} role="listitem">
                    <input
                      ref={addInputRef}
                      className={styles.editInput}
                      placeholder="New item…"
                      aria-label={`Add new item to ${section.title}`}
                      value={addText}
                      onChange={e => setAddText(e.target.value)}
                      onBlur={() => commitAdd(si)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitAdd(si)
                        if (e.key === 'Escape') { setAddingIn(null); setAddText('') }
                      }}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => startAdd(si)}
                    aria-label={`Add item to ${section.title}`}
                  >
                    <Icon name="Add" size="xs" color="primary" aria-hidden />
                    Add item
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
