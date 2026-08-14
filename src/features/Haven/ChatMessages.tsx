import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { Icon } from '@/components/Icons'
import contentCopy from '@/assets/content_copy.png'
import checkIcon from '@/assets/check.png'
import thumbUp from '@/assets/thumb_up.png'
import thumbUpFill from '@/assets/thumb_up_fill.png'
import thumbDown from '@/assets/thumb_down.png'
import thumbDownFill from '@/assets/thumb_down_fill.png'
import styles from './ChatMessages.module.css'
import type { Alert as CallAlert } from './SukiWindow'
import { CallInsightsCard } from './CallInsightsCard'
import { AddMedicationModal } from './AddMedicationModal'
import { AddNoteModal } from './AddNoteModal'
import { SmartGoalCard, type SmartGoalData, type SmartGoalAddedPayload } from './SmartGoalCard'
import { UracChecklistCard, type ChecklistType } from './UracChecklistCard'
import { AdminChecklistCard } from './AdminChecklistCard'
import { HandoffSummaryCard } from './HandoffSummaryCard'
import { CarePlanSummaryCard } from './CarePlanSummaryCard'
import { LastUpdateCard, type LastUpdateData } from './LastUpdateCard'
import { PreCallBriefCard, IntakeCallCard, FollowUpCallCard, MedicationsOverviewCard, CatchMeUpCard, type PreCallBriefCardData, type CatchMeUpCardData } from './PreCallBriefCard'
import type { CarePlanItem } from '@/mocks'

// ── Full message serializer (prose + all card data → plain text) ──────────────

function fmtDate(iso: string): string {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function serializePreCallData(data: PreCallBriefCardData): string {
  const lines: string[] = []

  lines.push('--- REFERRAL OVERVIEW ---')
  lines.push(`Referral reason: ${data.referralProgram}`)
  lines.push(`Referred by: ${data.referralBy || 'N/A'}`)
  lines.push(`Referral date: ${fmtDate(data.referralDate)}`)

  lines.push('')
  lines.push('--- ELIGIBILITY ---')
  data.eligibilities.forEach(e => {
    lines.push(`Status: ${e.status} | Plan: ${e.planName} | LOB: ${e.lineOfBusiness} | Effective: ${fmtDate(e.startDate)}`)
  })

  lines.push('')
  lines.push('--- RISK SCORE ---')
  lines.push(`Tier: ${data.riskTier} | Label: ${data.riskLabel}${data.riskScore != null ? ` | Score: ${data.riskScore}/${data.riskScoreMax ?? ''}` : ''}`)
  if (data.riskDrivers.length) {
    lines.push('Risk drivers:')
    data.riskDrivers.forEach(d => lines.push(`  • ${d.condition}: ${d.detail}`))
  }

  lines.push('')
  lines.push('--- MEDICATIONS ---')
  lines.push(`Active medications (${data.activeMedCount}):`)
  data.keyMedications.forEach(m => {
    lines.push(`  • ${m.name} ${m.dosage} — ${m.frequency} | Class: ${m.medicationClass} | Prescribed by: ${m.prescribedBy}`)
  })
  if (data.discontinuedMedications.length) {
    lines.push('Discontinued:')
    data.discontinuedMedications.forEach(m => {
      lines.push(`  • ${m.name} ${m.dosage} — ended ${fmtDate(m.endDate)} (${m.prescribedBy})`)
    })
  }

  lines.push('')
  lines.push('--- CONDITIONS / DIAGNOSES ---')
  data.conditions.forEach(c => {
    lines.push(`  • ${c.condition} (${c.code})${c.isPrimary ? ' [Primary]' : ''}${c.isNew ? ' [New]' : ''}`)
  })

  lines.push('')
  lines.push('--- CLAIMS & AUTHORIZATIONS ---')
  lines.push(`Recent claims (90 days): ${data.recentClaims.length} | Approved: ${data.claimsApproved} | Pending: ${data.claimsPending} | Denied: ${data.claimsDenied}`)
  data.recentClaims.forEach(c => {
    lines.push(`  • ${fmtDate(c.date)} ${c.visitType} — ${c.provider} | ${c.reasonForVisit}`)
  })

  if (data.openCareGaps.length) {
    lines.push('')
    lines.push('--- CARE GAPS ---')
    data.openCareGaps.forEach(g => {
      lines.push(`  • ${g.opportunity} (${g.measureCode}) — ${g.ncqaGrouping}`)
      if (g.measureDescription) lines.push(`    ${g.measureDescription}`)
    })
  }

  if (data.assessments.length) {
    lines.push('')
    lines.push('--- ASSESSMENTS ---')
    data.assessments.forEach(a => {
      lines.push(`  • ${a.name}: ${a.status} | Last: ${fmtDate(a.lastCompleted)} | Due: ${fmtDate(a.dueDate)} | Frequency: ${a.frequency}${a.scoreLabel ? ` | Score: ${a.scoreLabel}` : ''}`)
    })
  }

  if (data.preferredPhone || data.bestTimeToCall || data.preferredLanguage) {
    lines.push('')
    lines.push('--- CONTACT PREFERENCES ---')
    if (data.preferredPhone) lines.push(`Phone: ${data.preferredPhone}`)
    if (data.bestTimeToCall) lines.push(`Best time to call: ${data.bestTimeToCall}`)
    if (data.preferredLanguage) lines.push(`Language: ${data.preferredLanguage}`)
    if (data.preferredContactFormat) lines.push(`Format: ${data.preferredContactFormat}`)
    if (data.communicationImpairments.length) lines.push(`Impairments: ${data.communicationImpairments.join(', ')}`)
  }

  return lines.join('\n')
}

function serializeCarePlanItems(items: CarePlanItem[]): string {
  if (!items.length) return ''
  const lines: string[] = ['--- CARE PLAN OVERVIEW ---']

  const interventions = items.filter(i => i.interventionAlias)
  if (interventions.length) {
    lines.push('Clinical Interventions:')
    interventions.forEach(i => {
      lines.push(`  • ${i.interventionAlias} (${i.opportunityAlias}) | Status: ${i.status} | Priority: ${i.priority} | Target: ${fmtDate(i.targetDate)} | Condition: ${i.condition}`)
    })
  }

  const memberActions = items.filter(i => i.memberGoal)
  if (memberActions.length) {
    lines.push('Member Actions:')
    memberActions.forEach(i => {
      lines.push(`  • ${i.memberGoal} | Status: ${i.memberStatus} | Priority: ${i.priority} | Target: ${fmtDate(i.targetDate)}`)
    })
  }

  return lines.join('\n')
}

function serializeMessageForNote(msg: Message): string {
  const parts: string[] = []

  if (msg.content) parts.push(msg.content)

  if (msg.lastUpdate) {
    const u = msg.lastUpdate
    parts.push(`--- LAST UPDATE ---\nLast call: ${fmtDate(u.callDate)}\nNote (${fmtDate(u.note.date)} by ${u.note.author}, ${u.note.role}):\n${u.note.body}\nActivity: ${u.activity.type} | Due: ${fmtDate(u.activity.due)} | Assigned to: ${u.activity.assignedTo} | Status: ${u.activity.status}`)
  }

  if (msg.smartGoal) {
    const goals = msg.smartGoal.goals.map(g =>
      `${g.name}: ${g.description}\n${g.fields.map(f => `  ${f.label}: ${f.value}`).join('\n')}`
    ).join('\n\n')
    parts.push(`--- SMART GOALS ---\n${goals}`)
  }

  if (msg.preCallBriefCard) {
    parts.push(serializePreCallData(msg.preCallBriefCard))
  }

  if (msg.medicationCard) {
    const d = msg.medicationCard
    const medLines = [`--- MEDICATIONS OVERVIEW ---`, `Active medications (${d.activeMedCount}):`]
    d.keyMedications.forEach(m => {
      medLines.push(`  • ${m.name} ${m.dosage} — ${m.frequency} | Class: ${m.medicationClass} | Prescribed by: ${m.prescribedBy}`)
    })
    if (d.discontinuedMedications.length) {
      medLines.push('Discontinued:')
      d.discontinuedMedications.forEach(m => {
        medLines.push(`  • ${m.name} ${m.dosage} — ended ${fmtDate(m.endDate)}`)
      })
    }
    parts.push(medLines.join('\n'))
  }

  if (msg.intakeCallCard) {
    parts.push(serializePreCallData(msg.intakeCallCard.data))
    if (msg.intakeCallCard.goals.length) {
      const goalLines = ['--- CARE PLAN GOALS ---']
      msg.intakeCallCard.goals.forEach(g => {
        goalLines.push(`  • [${g.status}] ${g.goal} | Category: ${g.category} | Target: ${fmtDate(g.targetDate)} | Intervention: ${g.intervention}`)
      })
      parts.push(goalLines.join('\n'))
    }
    if (msg.intakeCallCard.carePlanItems?.length) {
      parts.push(serializeCarePlanItems(msg.intakeCallCard.carePlanItems))
    }
  }

  if (msg.followUpCallCard) {
    parts.push(serializePreCallData(msg.followUpCallCard.data))
    if (msg.followUpCallCard.goals.length) {
      const goalLines = ['--- CARE PLAN GOALS ---']
      msg.followUpCallCard.goals.forEach(g => {
        goalLines.push(`  • [${g.status}] ${g.goal} | Category: ${g.category} | Target: ${fmtDate(g.targetDate)} | Intervention: ${g.intervention}`)
      })
      parts.push(goalLines.join('\n'))
    }
    if (msg.followUpCallCard.carePlanItems?.length) {
      parts.push(serializeCarePlanItems(msg.followUpCallCard.carePlanItems))
    }
  }

  if (msg.handoffCard) {
    const hf = msg.handoffCard
    parts.push(serializePreCallData(hf.data))
    if (hf.goals.length) {
      const goalLines = ['--- CARE PLAN GOALS (HANDOFF) ---']
      hf.goals.forEach(g => {
        goalLines.push(`  • [${g.status}] ${g.goal} | Category: ${g.category} | Target: ${fmtDate(g.targetDate)} | Intervention: ${g.intervention}`)
      })
      parts.push(goalLines.join('\n'))
    }
    if (hf.carePlanItems?.length) {
      parts.push(serializeCarePlanItems(hf.carePlanItems))
    }
  }

  if (msg.adminChecklist) {
    parts.push('--- COMPLIANCE CHECKLISTS ---\nURAC Compliance, NCQA Compliance, and General Compliance checklists attached.')
  }

  if (msg.catchMeUpCard) {
    const c = msg.catchMeUpCard
    const catchLines = [`--- CATCH ME UP (since ${fmtDate(c.lastCallDate)}) ---`]
    if (c.medicationChanges.length) {
      catchLines.push('Medication changes:')
      c.medicationChanges.forEach(m => {
        const detail = m.changeType === 'Switched'
          ? `Switched from ${m.stoppedName} to ${m.name}`
          : `${m.changeType}: ${m.name}`
        catchLines.push(`  • ${detail}${m.notes ? ' — ' + m.notes : ''} (${fmtDate(m.date)})`)
      })
    }
    if (c.authorizations.length) {
      catchLines.push('Authorizations:')
      c.authorizations.forEach(a => {
        catchLines.push(`  • ${a.service} [${a.status}] Auth #${a.authNumber} | Valid through: ${fmtDate(a.validThrough)}`)
      })
    }
    if (c.admissions.length) {
      catchLines.push('Admissions / ER visits:')
      c.admissions.forEach(a => {
        catchLines.push(`  • ${fmtDate(a.admitDate)} ${a.visitType} — ${a.facility} | ${a.reason}`)
      })
    }
    if (c.diagnosisChanges.length) {
      catchLines.push('Diagnosis changes:')
      c.diagnosisChanges.forEach(d => {
        catchLines.push(`  • ${d.changeType}: ${d.condition} (${d.code})${d.notes ? ' — ' + d.notes : ''} (${fmtDate(d.date)})`)
      })
    }
    parts.push(catchLines.join('\n'))
  }

  return parts.join('\n\n')
}

export interface FollowUpChip {
  label: string
  query: string
  isComplete?: boolean
  inlineRow?: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
  isCallSummary?: boolean
  callAlerts?: CallAlert[]
  showCallInsightsCard?: boolean
  feedback?: 'up' | 'down' | null
  followUp?: string
  followUpQuery?: string
  followUpChips?: FollowUpChip[]
  smartGoal?: SmartGoalData
  uracChecklist?: true
  uracMemberId?: string
  checklistType?: ChecklistType
  carePlanSummary?: true
  lastUpdate?: LastUpdateData
  preCallBriefCard?: PreCallBriefCardData
  medicationCard?: PreCallBriefCardData
  intakeCallCard?: { data: PreCallBriefCardData; goals: Array<{ goal: string; status: string; category: string; targetDate: string; intervention: string }>; carePlanItems?: CarePlanItem[] }
  followUpCallCard?: { data: PreCallBriefCardData; goals: Array<{ goal: string; status: string; category: string; targetDate: string; intervention: string }>; carePlanItems?: CarePlanItem[] }
  catchMeUpCard?: CatchMeUpCardData
  handoffCard?: { data: PreCallBriefCardData; goals: Array<{ goal: string; status: string; category: string; targetDate: string; intervention: string }>; carePlanItems?: CarePlanItem[] }
  adminChecklist?: { memberId?: string }
}

export interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
  thinkingSteps?: string[] | null
  memberName?: string
  memberDob?: string
  memberDisplayId?: string
  onFeedback?: (id: string, value: 'up' | 'down') => void
  onGoalAdded?: (payload: SmartGoalAddedPayload) => void
  onFollowUpChip?: (query: string) => void
  onNavigateNote?: () => void
  onNavigateActivity?: () => void
  onRequestMedCard?: () => void
}

/* ── Thinking steps ── */
function ThinkingSteps({ steps }: { steps: string[] }) {
  const [count, setCount] = useState(1)
  useEffect(() => {
    if (count >= steps.length) return
    const t = setTimeout(() => setCount(c => c + 1), 700)
    return () => clearTimeout(t)
  }, [count, steps.length])
  return (
    <div className={styles.thinkingWrap}>
      {steps.slice(0, count).map((step, i) => {
        const done = i < count - 1
        return (
          <div key={i} className={`${styles.thinkingStep} ${done ? styles.thinkingDone : styles.thinkingActive}`}>
            {done ? <Icon name="CheckCircle" size="xs" color="action" /> : <span className={styles.thinkingSpinner} />}
            <span>{step}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className={styles.row}>
      <div className={styles.typing}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  )
}

/* ── Line renderer ── */
function renderContent(
  content: string,
  onNavigateNote?: () => void,
  onNavigateActivity?: () => void,
) {
  return content.split('\n').map((line, i) => {
    // detect by unicode code point to avoid emoji encoding issues
    const cp = line.codePointAt(0)
    const isNoteHeader     = cp === 0x1F4CB  // 📋
    const isActivityHeader = cp === 0x2705   // ✅
    const isHeader = isNoteHeader || isActivityHeader || /^[A-Z][A-Z\s&/]{2,}$/.test(line.trim())

    if (isNoteHeader && onNavigateNote) {
      return <button key={i} type="button" className={styles.activityLink} onClick={onNavigateNote}>{line}</button>
    }
    if (isActivityHeader && onNavigateActivity) {
      return <button key={i} type="button" className={styles.activityLink} onClick={onNavigateActivity}>{line}</button>
    }
    const boldMatch = line.match(/^\*\*(.+)\*\*$/)
    if (boldMatch) {
      return <span key={i} style={{ fontWeight: 600, display: 'block' }}>{boldMatch[1]}</span>
    }
    return (
      <span key={i} style={isHeader ? { fontWeight: 600, display: 'block' } : { display: 'block' }}>
        {line || ' '}
      </span>
    )
  })
}

/* ── Note saved toast ── */
function NoteToast({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300) }, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return createPortal(
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
      opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease, transform 0.25s ease',
      background: '#1e1e1e', color: '#fff', borderRadius: 8,
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-family-base)', fontSize: 'var(--font-size-sm)', fontWeight: 500,
      boxShadow: '0 4px 16px rgba(0,0,0,0.24)', zIndex: 2000, whiteSpace: 'nowrap',
    }}>
      <Icon name="CheckCircle" size="sm" color="success" aria-hidden />
      Health Note successfully added.
    </div>,
    document.body
  )
}

/* ── Call Summary card ── */
function CallSummaryCard({ content, onOpenNoteModal }: { content: string; onOpenNoteModal: () => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className={styles.summaryEditBubble}>
      <div className={styles.summaryEditHeader}>
        <Icon name="StickyNote2" size="sm" color="primary" aria-hidden />
        <span className={styles.summaryEditLabel}>Call Summary</span>
        <div className={styles.summaryHeaderActions}>
          <button
            type="button"
            className={styles.summaryIconBtn}
            aria-label={copied ? 'Copied' : 'Copy summary'}
            title={copied ? 'Copied!' : 'Copy'}
            onClick={handleCopy}
          >
            <img src={copied ? checkIcon : contentCopy} width={15} height={15} alt="" aria-hidden />
          </button>
          <button
            type="button"
            className={`${styles.summaryIconBtn}${editing ? ` ${styles.summaryIconBtnActive}` : ''}`}
            aria-label={editing ? 'Done editing' : 'Edit summary'}
            title={editing ? 'Done' : 'Edit'}
            onClick={() => setEditing(e => !e)}
          >
            <Icon name={editing ? 'Check' : 'Edit'} size="xs" color="action" aria-hidden />
          </button>
        </div>
      </div>
      {editing ? (
        <textarea
          className={styles.summaryTextarea}
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Edit call summary"
          rows={8}
        />
      ) : (
        <div className={styles.summaryReadBody}>{text}</div>
      )}
    </div>
  )
}

/* ── Call Insights section (alerts from the call) ── */
function CallInsightsSection({
  alerts,
  onRequestMedCard,
}: {
  alerts: CallAlert[]
  onRequestMedCard?: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(alerts[0]?.id ?? null)

  if (!alerts.length) return null

  return (
    <div className={styles.callInsightsSection}>
      <div className={styles.callInsightsSectionHeader}>
        <Icon name="Insights" size="sm" color="warning" aria-hidden />
        <span className={styles.callInsightsSectionTitle}>Call Insights</span>
        <span className={styles.callInsightsSectionHint}>{alerts.length} item{alerts.length > 1 ? 's' : ''} flagged during this call</span>
      </div>
      {alerts.map(alert => {
        const isOpen = expandedId === alert.id
        return (
          <div key={alert.id} className={styles.callInsightCard}>
            <button
              type="button"
              className={styles.callInsightCardHeader}
              onClick={() => setExpandedId(isOpen ? null : alert.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.callInsightBadge} aria-hidden>!</span>
              <span className={styles.callInsightTitle}>{alert.label}</span>
              <Icon name={isOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
            </button>
            {isOpen && (
              <div className={styles.callInsightBody}>
                <p className={styles.callInsightDetail}>{alert.detail}</p>
                <div className={styles.callInsightActions}>
                  {(alert.id === 'med-adherence' || alert.id === 'med-adherence-marcus') && onRequestMedCard && (
                    <button
                      type="button"
                      className={styles.callInsightActionBtn}
                      onClick={onRequestMedCard}
                    >
                      <Icon name="Medication" size="xs" color="primary" aria-hidden />
                      Review medications overview
                    </button>
                  )}
                  {alert.id === 'transportation' && (
                    <button
                      type="button"
                      className={styles.callInsightActionBtn}
                      onClick={() => {}}
                    >
                      <Icon name="AddCircleOutlined" size="xs" color="primary" aria-hidden />
                      Add transportation barrier to care plan
                    </button>
                  )}
                  {alert.id === 'care-gaps-marcus' && (
                    <button
                      type="button"
                      className={styles.callInsightActionBtn}
                      onClick={() => {}}
                    >
                      <Icon name="AssignmentLate" size="xs" color="primary" aria-hidden />
                      Place referrals for EED &amp; KED care gaps
                    </button>
                  )}
                  <div className={styles.callInsightTasks}>
                    {alert.tasks.map((task, i) => (
                      <div key={i} className={styles.callInsightTask}>
                        <Icon name="RadioButtonUnchecked" size="xs" color="action" aria-hidden />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Assistant message ── */
function AssistantMessage({
  msg,
  memberName,
  memberDob,
  memberDisplayId,
  onFeedback,
  onGoalAdded,
  onFollowUpChip,
  onNavigateNote,
  onNavigateActivity,
  onRequestMedCard,
}: {
  msg: Message
  memberName?: string
  memberDob?: string
  memberDisplayId?: string
  onFeedback?: (id: string, value: 'up' | 'down') => void
  onGoalAdded?: (payload: SmartGoalAddedPayload) => void
  onFollowUpChip?: (query: string) => void
  onNavigateNote?: () => void
  onNavigateActivity?: () => void
  onRequestMedCard?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  const fullText = serializeMessageForNote(msg)

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 5000)
  }

  if (msg.isError) {
    return (
      <div className={styles.row}>
        <div className={styles.errorBubble}>
          <div className={styles.errorHeader}>
            <Icon name="ErrorOutline" size="sm" color="error" />
            <span className={styles.errorTitle}>Unable to retrieve data</span>
          </div>
          <p className={styles.errorBody}>{msg.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.assistantGroup}>
      {msg.content && (
        <div className={styles.row}>
          {msg.isCallSummary ? (
            <CallSummaryCard content={msg.content} onOpenNoteModal={() => setNoteModalOpen(true)} />
          ) : (
            <div className={styles.assistantBubble}>
              {renderContent(msg.content, onNavigateNote, onNavigateActivity)}
            </div>
          )}
        </div>
      )}
      {msg.isCallSummary && msg.showCallInsightsCard ? (
        <CallInsightsCard
          alerts={msg.callAlerts}
          memberFirstName={memberName?.split(' ')[0]}
          memberName={memberName}
          memberDob={memberDob}
          memberDisplayId={memberDisplayId}
          hideSummary
        />
      ) : (
        msg.isCallSummary && msg.callAlerts && msg.callAlerts.length > 0 && (
          <CallInsightsSection alerts={msg.callAlerts} onRequestMedCard={onRequestMedCard} />
        )
      )}
      {msg.uracChecklist && <UracChecklistCard memberId={msg.uracMemberId} checklistType={msg.checklistType ?? 'case-closure'} />}
      {msg.carePlanSummary && <CarePlanSummaryCard />}
      {msg.smartGoal && <SmartGoalCard data={msg.smartGoal} onGoalAdded={onGoalAdded} />}
      {msg.lastUpdate && (
        <LastUpdateCard
          data={msg.lastUpdate}
          onNavigateNote={onNavigateNote}
          onNavigateActivity={onNavigateActivity}
        />
      )}
      {msg.preCallBriefCard && <PreCallBriefCard data={msg.preCallBriefCard} />}
      {msg.medicationCard && <MedicationsOverviewCard data={msg.medicationCard} defaultOpen />}
      {msg.intakeCallCard && <IntakeCallCard data={msg.intakeCallCard.data} goals={msg.intakeCallCard.goals} carePlanItems={msg.intakeCallCard.carePlanItems} />}
      {msg.followUpCallCard && <FollowUpCallCard data={msg.followUpCallCard.data} goals={msg.followUpCallCard.goals} carePlanItems={msg.followUpCallCard.carePlanItems} />}
      {msg.catchMeUpCard && <CatchMeUpCard data={msg.catchMeUpCard} />}
      {msg.handoffCard && <HandoffSummaryCard data={msg.handoffCard.data} goals={msg.handoffCard.goals} carePlanItems={msg.handoffCard.carePlanItems} />}
      {msg.adminChecklist && <AdminChecklistCard memberId={msg.adminChecklist.memberId} />}
      {msg.followUp && <p className={styles.followUpText}>{msg.followUp}</p>}
      {msg.followUpChips && msg.followUpChips.length > 0 && (
        <div className={styles.followUpChips}>
          {(() => {
            const rows: JSX.Element[] = []
            let i = 0
            while (i < msg.followUpChips!.length) {
              const chip = msg.followUpChips![i]
              if (chip.inlineRow) {
                const group = [chip]
                let j = i + 1
                while (j < msg.followUpChips!.length && msg.followUpChips![j].inlineRow) {
                  group.push(msg.followUpChips![j])
                  j++
                }
                rows.push(
                  <div key={chip.query} className={styles.followUpChipRow}>
                    {group.map(c => (
                      <button key={c.query} type="button" className={styles.followUpChip} onClick={() => onFollowUpChip?.(c.query)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )
                i = j
              } else {
                rows.push(
                  <button key={chip.query} type="button" className={chip.isComplete ? styles.followUpChipComplete : styles.followUpChip} onClick={() => onFollowUpChip?.(chip.query)}>
                    {chip.label}
                  </button>
                )
                i++
              }
            }
            return rows
          })()}
        </div>
      )}
      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${copied ? styles.actionBtnActive : ''}`} onClick={handleCopy} type="button" aria-label="Copy response" title={copied ? 'Copied!' : 'Copy'}>
          <img src={copied ? checkIcon : contentCopy} width={16} height={16} alt="" aria-hidden="true" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button className={styles.actionBtn} type="button" aria-label="Save to Notes" title="Save to Notes" onClick={() => setNoteModalOpen(true)}>
          <Icon name="ControlPointOutlined" size="sm" aria-hidden />
          <span>Save to Notes</span>
        </button>
        <div className={styles.actionDivider} />
        <button className={`${styles.actionBtn} ${msg.feedback === 'up' ? styles.actionBtnActive : ''}`} onClick={() => onFeedback?.(msg.id, 'up')} type="button" aria-label="Helpful" title="Helpful">
          <img src={msg.feedback === 'up' ? thumbUpFill : thumbUp} width={16} height={16} alt="" aria-hidden="true" />
        </button>
        <button className={`${styles.actionBtn} ${msg.feedback === 'down' ? styles.actionBtnActive : ''}`} onClick={() => onFeedback?.(msg.id, 'down')} type="button" aria-label="Not helpful" title="Not helpful">
          <img src={msg.feedback === 'down' ? thumbDownFill : thumbDown} width={16} height={16} alt="" aria-hidden="true" />
        </button>
      </div>
      {noteSaved && <NoteToast onDone={() => setNoteSaved(false)} />}
      {noteModalOpen && (
        <AddNoteModal
          initialContent={fullText}
          memberName={memberName ?? ''}
          memberId={undefined}
          onClose={() => setNoteModalOpen(false)}
          onSuccess={() => setNoteSaved(true)}
        />
      )}
    </div>
  )
}

/* ── Reusable feedback bar for inline assistant bubbles ── */
export function MessageFeedbackBar({ content, memberName, memberId }: { content: string; memberName?: string; memberId?: string }) {
  const [copied, setCopied] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 5000)
  }

  return (
    <>
      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${copied ? styles.actionBtnActive : ''}`} onClick={handleCopy} type="button" aria-label="Copy response" title={copied ? 'Copied!' : 'Copy'}>
          <img src={copied ? checkIcon : contentCopy} width={16} height={16} alt="" aria-hidden="true" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button className={styles.actionBtn} type="button" aria-label="Save to Notes" title="Save to Notes" onClick={() => setNoteModalOpen(true)}>
          <Icon name="ControlPointOutlined" size="sm" aria-hidden />
          <span>Save to Notes</span>
        </button>
        <div className={styles.actionDivider} />
        <button className={`${styles.actionBtn} ${feedback === 'up' ? styles.actionBtnActive : ''}`} onClick={() => setFeedback(f => f === 'up' ? null : 'up')} type="button" aria-label="Helpful" title="Helpful">
          <img src={feedback === 'up' ? thumbUpFill : thumbUp} width={16} height={16} alt="" aria-hidden="true" />
        </button>
        <button className={`${styles.actionBtn} ${feedback === 'down' ? styles.actionBtnActive : ''}`} onClick={() => setFeedback(f => f === 'down' ? null : 'down')} type="button" aria-label="Not helpful" title="Not helpful">
          <img src={feedback === 'down' ? thumbDownFill : thumbDown} width={16} height={16} alt="" aria-hidden="true" />
        </button>
      </div>
      {noteSaved && <NoteToast onDone={() => setNoteSaved(false)} />}
      {noteModalOpen && (
        <AddNoteModal
          initialContent={content}
          memberName={memberName ?? ''}
          memberId={memberId}
          onClose={() => setNoteModalOpen(false)}
          onSuccess={() => setNoteSaved(true)}
        />
      )}
    </>
  )
}

/* ── Main component ── */
export function ChatMessages({ messages, loading, thinkingSteps, memberName, memberDob, memberDisplayId, onFeedback, onGoalAdded, onFollowUpChip, onNavigateNote, onNavigateActivity, onRequestMedCard }: ChatMessagesProps) {
  const lastMsgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [messages, loading, thinkingSteps])

  return (
    <div className={styles.list} aria-live="polite" aria-relevant="additions" aria-label="Chat messages">
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1
        return msg.role === 'user' ? (
          <div key={msg.id} ref={isLast ? lastMsgRef : undefined} className={styles.userRow}>
            <div className={styles.userBubble}>{msg.content}</div>
          </div>
        ) : (
          <div key={msg.id} ref={isLast ? lastMsgRef : undefined}>
            <AssistantMessage
              msg={msg}
              memberName={memberName}
              memberDob={memberDob}
              memberDisplayId={memberDisplayId}
              onFeedback={onFeedback}
              onGoalAdded={onGoalAdded}
              onFollowUpChip={onFollowUpChip}
              onNavigateNote={onNavigateNote}
              onNavigateActivity={onNavigateActivity}
              onRequestMedCard={onRequestMedCard}
            />
          </div>
        )
      })}
      {thinkingSteps && thinkingSteps.length > 0 && <ThinkingSteps steps={thinkingSteps} />}
      {loading && !thinkingSteps && <TypingIndicator />}
    </div>
  )
}
