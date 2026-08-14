import { useEffect, useRef, useState } from 'react'
import styles from './SukiWindow.module.css'

const SUKI_W = 440
const SUKI_H = 660

interface Note { name: string; date: string; status: 'done' | 'pending' }

export interface Alert {
  id: string
  label: string
  detail: string
  tasks: string[]
}

interface MemberScript {
  currentNotes: Note[]
  priorNotes: Note[]
  noteText: string
  summaryText: string
  transcriptLines: { speaker: string; text: string }[]
  transcriptAlerts: Record<number, Alert>
}

// ── Jackson Thomas (default / fallback) ──────────────────────────────────────
const JACKSON_SCRIPT: MemberScript = {
  currentNotes: [
    { name: 'Note Name', date: '06/10/2026', status: 'done' },
    { name: 'Note Name', date: '06/09/2026', status: 'pending' },
  ],
  priorNotes: [
    { name: 'Diabetes Management Check-In', date: '04/30/2026', status: 'done' },
    { name: 'Hypertension & Medication Review', date: '04/28/2026', status: 'done' },
  ],
  noteText:
    "67 year old male with history of Type 2 diabetes mellitus and essential hypertension. A1C 9.8%, recent DKA hospitalization 05/2026; now on basal insulin. Blood pressure 144/92 at last visit, above target. Diabetic nephropathy Stage G2 noted with eGFR 68. Bilateral foot numbness reported; podiatry not yet scheduled.",
  summaryText:
    "The care manager conducted a check-in call with Jackson Thomas regarding ongoing management of Type 2 diabetes mellitus and essential hypertension. The member reported missing evening Metformin doses and difficulty with dietary modifications. Fasting glucose has been elevated, averaging approximately 180 mg/dL. Blood pressure was self-reported at 142/88 mmHg.\n\nThe member has no personal vehicle and may need transportation support for upcoming appointments. The member expressed interest in speaking with a nutritionist and raised concerns about knee pain limiting physical activity. Care gaps reviewed include overdue HbA1c lab work and a pending nephrology follow-up. The member agreed to schedule an appointment with their PCP within the next two weeks and confirmed willingness to participate in a structured care plan review.\n\nClinical notes: A1C is trending up (last 7.8%, up from 7.2%); blood pressure remains above the 130/80 goal. Member is eligible for the Diabetes Prevention Program and expressed interest in dietary support. Member has not yet completed the diabetes self-management assessment.",
  transcriptLines: [
    { speaker: 'CM', text: 'Hi, this is Beatrice calling from GuidingCare. Am I speaking with Jackson?' },
    { speaker: 'Member', text: 'Yes, this is Jackson.' },
    { speaker: 'CM', text: "Great! I'm calling to check in on how you've been doing with your medications." },
    { speaker: 'Member', text: "I've been taking the Metformin most days, but I sometimes forget the evening dose." },
    { speaker: 'CM', text: 'Got it. And how have your blood sugar levels been lately?' },
    { speaker: 'Member', text: "They've been a bit high - usually around 180 in the morning." },
    { speaker: 'CM', text: "Okay, I'll note that. Have you had any issues with transportation to your upcoming PCP visit?" },
    { speaker: 'Member', text: "Yeah, I don't have a car so I was hoping my brother could drive me." },
    { speaker: 'CM', text: "Understood. We can also look into a ride service if needed. I'll flag that in your care plan." },
  ],
  transcriptAlerts: {
    3: {
      id: 'med-adherence',
      label: 'Medication adherence issue detected',
      detail: 'Member reports missing evening Metformin doses — not documented in care plan.',
      tasks: [
        'Add Metformin to medication list',
      ],
    },
    7: {
      id: 'transportation',
      label: 'New issue identified: Transportation barrier',
      detail: 'Member reports no personal vehicle — not documented as a care barrier.',
      tasks: [
        'Add transportation barrier to care plan',
      ],
    },
  },
}

// ── Marcus Webb — first outreach call ────────────────────────────────────────
const MARCUS_SCRIPT: MemberScript = {
  currentNotes: [
    { name: 'First Outreach Call', date: '08/06/2026', status: 'pending' },
  ],
  priorNotes: [],
  noteText:
    "44 year old male, first outreach call for Chronic Disease Management enrollment. Diagnoses: Type 2 Diabetes Mellitus (A1C 7.2%), Essential Hypertension (controlled), Hyperlipidemia, Obesity (BMI elevated), Obstructive Sleep Apnea (CPAP). Meds: Metformin 1000mg BID, Amlodipine 5mg, Atorvastatin 40mg, CPAP nightly. Reports skipping Metformin on days without breakfast due to GI upset. Sedentary desk job; no structured exercise. Diet described as inconsistent — better on weekends. Motivated to lower A1C before September labs. Two open care gaps (EED, KED) — member unaware, agreed to schedule. No transportation barriers. Support: wife Jennifer manages scheduling. Best contact: cell 415-782-3901, M-F after 5pm.",
  summaryText:
    "FIRST OUTREACH CALL — 08/06/2026\nCare Manager: Beatrice | Program: Chronic Disease Management\n\nMember Introduction & Purpose\nFirst contact with Marcus Webb following referral from Sandra Ortiz, Care Coordinator. Member was receptive and engaged throughout the call. Purpose of the Chronic Disease Management program was explained; member expressed willingness to participate.\n\nHealth History Confirmed\nMember confirmed the following active diagnoses: Type 2 Diabetes Mellitus (most recent A1C 7.2%), Essential Hypertension (self-reports BP is 'usually okay' on medication), Hyperlipidemia, Obesity, and Obstructive Sleep Apnea. Member has had diabetes for approximately 4 years; was started on Metformin by his primary care physician. Hypertension diagnosed around the same time.\n\nMedications Reviewed\nMetformin 1000mg twice daily — member reports skipping doses on mornings when he skips breakfast due to GI upset (nausea). Amlodipine 5mg daily — adherent, no issues reported. Atorvastatin 40mg — takes consistently. CPAP (AirSense 10) — uses nightly, reports it has improved his sleep significantly; no mask or comfort issues.\n\nLifestyle & Daily Routine\nMember works a demanding desk job with a long commute; describes daily schedule as leaving little time for exercise. Has not engaged in structured physical activity in over a year. Diet is inconsistent — reports eating better on weekends when he has more time to cook. Tends to skip breakfast on weekdays, which contributes to Metformin skipping. Wife Jennifer is actively involved in his health and manages most scheduling.\n\nMember Goals\nMember expressed strong motivation to lower his A1C before his next lab draw in September. Interested in practical strategies that fit his work schedule. Open to digital tools and app-based check-ins.\n\nCare Gaps Identified\nTwo open HEDIS gaps flagged: Diabetic Eye Exam (EED) and Kidney Health Evaluation (KED). Member was unaware of either gap. Expressed particular concern about the eye exam, which he has been delaying. Agreed to schedule both; requested referrals. Wife Jennifer will assist with scheduling.\n\nBarriers & SDOH\nNo transportation barriers — member drives himself. No language barriers (English-speaking). No communication impairments noted. Primary barrier identified: time constraints from work schedule limiting healthy habits and appointment follow-through.\n\nAction Plan\n• Place referrals for Diabetic Eye Exam (EED) and Kidney Health Evaluation (KED)\n• Document Metformin adherence barrier in care plan; discuss taking with a small snack\n• Schedule pharmacist medication review for GI side effect management\n• Add 30-day follow-up call to confirm care gap appointments and review A1C progress\n• Best contact: 415-782-3901 (cell), M-F after 5pm",
  transcriptLines: [
    { speaker: 'CM', text: 'Hi, may I speak with Marcus Webb? This is Beatrice calling from GuidingCare.' },
    { speaker: 'Member', text: "Yes, this is Marcus. Who's this?" },
    { speaker: 'CM', text: "Hi Marcus! My name is Beatrice — I'm a care manager with GuidingCare. Your doctor referred you to our Chronic Disease Management program. Do you have about 10 minutes to chat?" },
    { speaker: 'Member', text: "Yeah, sure. I've actually been meaning to get more on top of my health stuff." },
    { speaker: 'CM', text: "Great, glad we caught you. This is our first time speaking, so I'd like to learn a bit about how you've been feeling and what's been going on with your health. Can you tell me a little about your diagnoses — what conditions are you managing right now?" },
    { speaker: 'Member', text: "Yeah so I have diabetes and high blood pressure. And they told me I have high cholesterol too. Oh, and sleep apnea — I use a CPAP machine at night." },
    { speaker: 'CM', text: "Thank you for walking me through all of that. How long have you been managing the diabetes?" },
    { speaker: 'Member', text: "About four years now. My doctor put me on Metformin when I was first diagnosed." },
    { speaker: 'CM', text: "Got it. And how have you been taking your medications day to day — the Metformin, the blood pressure pill, the cholesterol medication?" },
    { speaker: 'Member', text: "The blood pressure one and the cholesterol pill I take every night, no problem. The Metformin is hit or miss — if I skip breakfast it upsets my stomach so I just don't take it those days." },
    { speaker: 'CM', text: "That's really important to know. GI side effects are actually pretty common with Metformin. Taking it with even a small snack can help. We'll want to flag that in your care plan and also connect you with a pharmacist who can help." },
    { speaker: 'Member', text: "Yeah I didn't know that. I just figured it was easier to skip it." },
    { speaker: 'CM', text: "Totally understandable. I also want to ask about your daily routine — do you have much time for exercise or physical activity?" },
    { speaker: 'Member', text: "Honestly, not really. I sit at a desk all day and by the time I get home after the commute I'm wiped. I keep meaning to start walking but I haven't gotten there." },
    { speaker: 'CM', text: "That makes sense. What about your eating — how would you describe your diet lately?" },
    { speaker: 'Member', text: "It's inconsistent. Weekends are better when I have time to cook. Weekdays I'm grabbing whatever's quick, and like I said I usually skip breakfast." },
    { speaker: 'CM', text: "Okay, that's helpful context. Now I also wanted to flag two things your records show as open — a Diabetic Eye Exam and a Kidney Health Evaluation. Have you had either of those done recently?" },
    { speaker: 'Member', text: "No. I didn't even know I needed a kidney test. The eye exam — I know I've been putting that off." },
    { speaker: 'CM', text: "Both are really important for diabetes management. I can put in referrals for you today. Is there a specialist you prefer, or should we find someone in your network?" },
    { speaker: 'Member', text: "Please find someone. My wife Jennifer usually handles the scheduling — she'd want to be looped in." },
    { speaker: 'CM', text: "Noted, I'll document that. And do you have any trouble getting to appointments — transportation, work schedule conflicts?" },
    { speaker: 'Member', text: "Transportation is fine, I drive. Getting time off work is harder but I can usually manage mornings." },
    { speaker: 'CM', text: "Perfect. I'll note morning availability. Last question — what's your main health goal right now, the thing you really want to work on?" },
    { speaker: 'Member', text: "I want to get my A1C down. My doctor said my last one was 7.2 and I have labs again in September. I want to show improvement." },
    { speaker: 'CM', text: "That's a great goal and very achievable. I'll set up a follow-up call in 30 days to check in on the medication, the referrals, and start building a plan around that September target. Does that work?" },
    { speaker: 'Member', text: "That works. After 5pm on weekdays is best for me." },
  ],
  transcriptAlerts: {
    9: {
      id: 'med-adherence-marcus',
      label: 'Medication adherence barrier identified',
      detail: 'Member skips Metformin on days without breakfast due to GI side effects (nausea). Not documented in care plan. Occurs multiple days per week.',
      tasks: [
        'Document Metformin adherence barrier in care plan (GI side effects on empty stomach)',
        'Advise member to take Metformin with a small snack to reduce nausea',
        'Schedule pharmacist medication review',
        'Set Metformin adherence reminder in care plan',
      ],
    },
    17: {
      id: 'care-gaps-marcus',
      label: 'Two open HEDIS care gaps — member unaware',
      detail: 'Member was unaware of open Diabetic Eye Exam (EED) and Kidney Health Evaluation (KED). Agreed to schedule both; requested referrals. Wife Jennifer will assist with scheduling.',
      tasks: [
        'Place referral: Diabetic Eye Exam (EED)',
        'Place referral: Kidney Health Evaluation (KED)',
        'Document member agreement to schedule both in care plan',
        'Flag for 30-day follow-up to confirm appointments are scheduled',
      ],
    },
  },
}

// Bar heights (px) for the waveform - alternating yellow accent bars
const BAR_HEIGHTS = [18,32,48,26,54,22,40,60,28,44,70,30,52,24,64,38,56,20,46,66,34,58,22,50,72,28,42,62,36,54]
const YELLOW_BARS  = new Set([2,6,10,14,18,22,26])

interface SukiWindowProps {
  onClose: () => void
  onNoteSent?: (summaryText: string) => void
  onAlert?: (alert: Alert) => void
  memberName: string
  memberId: string
  memberKey?: string
  phone: string
  pcp: string
  age?: string
  gender?: string
  dob?: string
  havenLeft: number
  havenTop: number
}

type View = 'notes' | 'detail' | 'summary'

export function SukiWindow({ onClose, onNoteSent, onAlert, memberName, memberId, memberKey, phone, pcp, age, gender, dob, havenLeft, havenTop }: SukiWindowProps) {
  const script = (memberKey ?? memberId) === 'marcus-webb' ? MARCUS_SCRIPT : JACKSON_SCRIPT

  const [view, setView]                   = useState<View>('notes')
  const [ambientActive, setAmbientActive] = useState(false)
  const [ambientPaused, setAmbientPaused] = useState(false)
  const [elapsed, setElapsed]             = useState(0)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [reminderSent, setReminderSent]     = useState(false)

  // Transcript state: list of fully-revealed lines + the current line being typed
  const [transcriptLines, setTranscriptLines] = useState<{ speaker: string; text: string }[]>([])
  const [currentLine, setCurrentLine] = useState<{ speaker: string; text: string } | null>(null)
  const transcriptBottomRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const firedAlertsRef = useRef<Set<string>>(new Set())

  const stopAmbient = () => {
    setAmbientActive(false)
    setAmbientPaused(false)
    pausedRef.current = false
  }

  useEffect(() => {
    if (!ambientActive || ambientPaused) { return }
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [ambientActive, ambientPaused])

  // Stream transcript lines word-by-word while ambient is active
  useEffect(() => {
    if (!ambientActive) {
      setTranscriptLines([])
      setCurrentLine(null)
      setElapsed(0)
      firedAlertsRef.current = new Set()
      return
    }

    let cancelled = false
    let lineIdx = 0
    let wordIdx = 0

    const tick = () => {
      if (cancelled) return
      if (pausedRef.current) { setTimeout(tick, 100); return }

      const line = script.transcriptLines[lineIdx]
      if (!line) return

      const words = line.text.split(' ')
      wordIdx++
      setCurrentLine({ speaker: line.speaker, text: words.slice(0, wordIdx).join(' ') })

      if (wordIdx >= words.length) {
        const completed = { speaker: line.speaker, text: line.text }
        setTranscriptLines(prev => [...prev, completed])
        setCurrentLine(null)
        // Fire alert if this line index has one
        const alert = script.transcriptAlerts[lineIdx]
        if (alert && !firedAlertsRef.current.has(alert.id)) {
          firedAlertsRef.current.add(alert.id)
          setTimeout(() => onAlert?.(alert), 400)
        }
        lineIdx++
        wordIdx = 0
        if (lineIdx < script.transcriptLines.length) {
          setTimeout(tick, 900)
        }
      } else {
        setTimeout(tick, 120)
      }
    }

    setTimeout(tick, 800)
    return () => { cancelled = true }
  }, [ambientActive])

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcriptLines, currentLine])

  const fmtTimer = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `00.${mm}.${ss}`
  }

  const handleAmbientDone = () => {
    setAmbientActive(false)
    setSummaryLoading(true)
    setView('summary')
    setTimeout(() => setSummaryLoading(false), 2200)
  }

  const handleSummaryDone = () => {
    onNoteSent?.(script.summaryText)
    onClose()
  }

  // Use first two name parts for display
  const displayName = memberName.split(' ').slice(0, 2).join(' ')
  const firstName = memberName.split(' ')[0] || 'Member'
  const dateOfService = (memberKey ?? memberId) === 'marcus-webb' ? '08/06/2026' : '06/09/2026'

  const left = Math.max(16, havenLeft - SUKI_W)
  const top  = havenTop

  return (
    <div
      data-suki
      className={styles.window}
      style={{ left, top, width: SUKI_W, height: SUKI_H }}
      role="dialog"
      aria-label="Suki"
      aria-modal="false"
    >
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <span className={styles.poweredBy}>
          Powered by <strong className={styles.sukiBrand}>Suki</strong>
        </span>
        <div className={styles.topActions}>
          <button className={styles.iconBtn} type="button" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <button className={styles.iconBtn} type="button" aria-label="Close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── NOTES LIST VIEW ── */}
      {view === 'notes' && (
        <div className={styles.notesView}>
          {/* Member hero */}
          <div className={styles.hero}>
            <h1 className={styles.heroName}>{displayName}</h1>
            <p className={styles.heroMeta}>{age} . {gender}. DOB:{dob}</p>
            <button
              className={`${styles.startAmbientBtn}${ambientActive ? ` ${styles.startAmbientBtnActive}` : ''}`}
              type="button"
              onClick={() => setAmbientActive(true)}
            >
              Start Ambient
            </button>
          </div>

          {/* Notes */}
          <div className={styles.notesList}>
            <p className={styles.sectionLabel}>CURRENT NOTES</p>
            {script.currentNotes.map((note, i) => (
              <button key={i} className={styles.noteRow} type="button" onClick={() => setView('detail')}>
                <span className={styles.noteName}>{note.name}</span>
                <span className={styles.noteDate}>{note.date}</span>
                {note.status === 'done'
                  ? <span className={styles.statusCheck} aria-label="Complete">✓</span>
                  : <span className={styles.statusDot} aria-label="Pending" />
                }
              </button>
            ))}

            {script.priorNotes.length > 0 && (
              <>
                <p className={styles.sectionLabel} style={{ marginTop: 20 }}>PRIOR NOTES</p>
                {script.priorNotes.map((note, i) => (
                  <button key={i} className={styles.noteRow} type="button" onClick={() => setView('detail')}>
                    <span className={styles.noteName}>{note.name}</span>
                    <span className={styles.noteDate}>{note.date}</span>
                    {note.status === 'done'
                      ? <span className={styles.statusCheck} aria-label="Complete">✓</span>
                      : <span className={styles.statusDot} aria-label="Pending" />
                    }
                  </button>
                ))}
              </>
            )}
          </div>

          {/* ── Ambient overlay (Frame 6490) ── */}
          {ambientActive && (
            <div className={styles.ambientOverlay}>
              <button
                className={styles.ambientCloseBtn}
                type="button"
                aria-label="Close ambient"
                onClick={stopAmbient}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>

              {/* Waveform */}
              <div className={styles.waveformWrap} aria-hidden="true">
                <div className={styles.waveformBars}>
                  {BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className={`${styles.waveBar} ${YELLOW_BARS.has(i) ? styles.waveBarYellow : styles.waveBarWhite}`}
                      style={{
                        height: h,
                        animationDelay: `${(i * 0.07).toFixed(2)}s`,
                        animationPlayState: ambientPaused ? 'paused' : 'running',
                      }}
                    />
                  ))}
                </div>
                <div className={styles.waveformLine} />
              </div>

              {/* Listening row */}
              <div className={styles.ambientInfo}>
                <span className={styles.listeningLabel}>Listening...</span>
                <span className={styles.timerLabel}>{fmtTimer(elapsed)}</span>
              </div>

              {/* Controls */}
              <div className={styles.ambientControls}>
                <button
                  className={styles.pauseBtn}
                  type="button"
                  onClick={() => {
                    const next = !ambientPaused
                    setAmbientPaused(next)
                    pausedRef.current = next
                  }}
                >
                  {ambientPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  className={styles.ambientDoneBtn}
                  type="button"
                  aria-label="Done"
                  onClick={handleAmbientDone}
                >
                  <svg width="18" height="14" viewBox="0 0 22 17" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 8l7 7L21 1"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NOTE DETAIL VIEW ── */}
      {view === 'detail' && (
        <div className={styles.detailView}>
          <div className={styles.detailNav}>
            <button className={styles.backBtn} type="button" aria-label="Back" onClick={() => setView('notes')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <button className={styles.moreBtn} type="button" aria-label="More options">
              <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
                <circle cx="2" cy="2" r="2"/>
                <circle cx="2" cy="9" r="2"/>
                <circle cx="2" cy="16" r="2"/>
              </svg>
            </button>
          </div>

          <div className={styles.detailDivider} />

          <div className={styles.detailScroll}>
            <div className={styles.notePageHeader}>
              <h2 className={styles.detailNoteLabel}>NOTE</h2>
              <span className={styles.readOnlyBadge} aria-label="Read only">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Read Only
              </span>
            </div>

            <p className={styles.detailNoteName}>{memberName}</p>
            <p className={styles.detailNoteSubMeta}>{age} • {gender} • {memberId}</p>

            <div className={styles.detailMetaRow}>
              <div>
                <p className={styles.detailMetaKey}>DATE OF BIRTH</p>
                <p className={styles.detailMetaVal}>{dob}</p>
              </div>
              <div>
                <p className={styles.detailMetaKey}>DATE OF SERVICE</p>
                <p className={styles.detailMetaVal}>{dateOfService}</p>
              </div>
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Assessment</p>
              <p className={styles.detailSectionBody}>{script.noteText}</p>
            </div>
          </div>

          <div className={styles.detailFooter}>
            <button className={styles.addSectionBtn} type="button" aria-label="Add section">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </button>
            <button className={styles.doneBtn} type="button" onClick={() => setView('notes')}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── SUMMARY VIEW ── */}
      {view === 'summary' && (
        <div className={styles.summaryView}>
          <div className={styles.detailNav}>
            <button className={styles.backBtn} type="button" aria-label="Back" onClick={() => setView('notes')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          </div>

          <div className={styles.detailDivider} />

          <div className={styles.summaryScroll}>
            <div className={styles.notePageHeader}>
              <h2 className={styles.detailNoteLabel}>NOTE</h2>
              <span className={styles.readOnlyBadge} aria-label="Read only">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Read Only
              </span>
            </div>

            <p className={styles.detailNoteName}>{memberName}</p>
            <p className={styles.detailNoteSubMeta}>{age} • {gender} • {memberId}</p>

            <div className={styles.detailMetaRow}>
              <div>
                <p className={styles.detailMetaKey}>DATE OF BIRTH</p>
                <p className={styles.detailMetaVal}>{dob}</p>
              </div>
              <div>
                <p className={styles.detailMetaKey}>DATE OF SERVICE</p>
                <p className={styles.detailMetaVal}>{dateOfService}</p>
              </div>
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>AI Summary</p>
              {summaryLoading ? (
                <div className={styles.summaryGenerating} aria-label="Generating summary">
                  <div className={styles.generatingDots}>
                    <span /><span /><span />
                  </div>
                  <p className={styles.generatingLabel}>Summarizing this call…</p>
                </div>
              ) : (
                <p className={styles.detailSectionBody}>{script.summaryText}</p>
              )}
            </div>
          </div>

          <div className={styles.detailFooter}>
            <button className={styles.doneBtn} type="button" onClick={handleSummaryDone}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
