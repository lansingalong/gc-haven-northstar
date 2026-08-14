import { useState, useEffect } from 'react'
import { Icon } from '@/components/Icons'
import { type Alert as SukiAlert } from './SukiWindow'
import { MedicationsOverviewCard, type PreCallBriefCardData } from './PreCallBriefCard'
import { AddMedicationModal } from './AddMedicationModal'
import { AddCarePlanModal } from './AddCarePlanModal'
import { AddClinicalProgramModal } from './AddClinicalProgramModal'
import styles from './CallInsightsCard.module.css'

const SUMMARY_TEXT =
  "The care manager conducted a check-in call with the member regarding ongoing management of Type 2 diabetes mellitus and essential hypertension. The member reported missing evening Metformin doses and difficulty with dietary modifications. Fasting glucose has been elevated, averaging approximately 180 mg/dL. Blood pressure was self-reported at 142/88 mmHg.\n\nThe member has no personal vehicle and may need transportation support for upcoming appointments. The member expressed interest in speaking with a nutritionist and raised concerns about knee pain limiting physical activity. Care gaps reviewed include overdue HbA1c lab work and a pending nephrology follow-up. The member agreed to schedule an appointment with their PCP within the next two weeks and confirmed willingness to participate in a structured care plan review.\n\nClinical notes: A1C is trending up (last 7.8%, up from 7.2%); blood pressure remains above the 130/80 goal. Member is eligible for the Diabetes Prevention Program and expressed interest in dietary support. Member has not yet completed the diabetes self-management assessment."

const DEFAULT_ALERTS: SukiAlert[] = [
  {
    id: 'med-adherence',
    label: 'Medication adherence issue detected',
    detail: 'Member reports missing evening Metformin doses - not documented in care plan.',
    tasks: ['Add Metformin to medication list'],
  },
  {
    id: 'transportation',
    label: 'New issue identified: Transportation barrier',
    detail: 'Member reports no personal vehicle - not documented as a care barrier.',
    tasks: ['Add transportation barrier to care plan'],
  },
]

interface TaskItemProps {
  label: string
  done: boolean
  onAction: () => void
  onEdit: () => void
}

function TaskItem({ label, done, onAction, onEdit }: TaskItemProps) {
  return (
    <div className={styles.alertTaskRow}>
      {done ? (
        <>
          <Icon name="CheckCircle" size="xs" color="success" aria-hidden />
          <span className={styles.alertTaskDone}>{label}</span>
          <button type="button" className={styles.editLink} onClick={onEdit}>Edit</button>
        </>
      ) : (
        <button type="button" className={styles.alertTaskLink} onClick={onAction}>{label}</button>
      )}
    </div>
  )
}

interface AlertRowProps {
  alert: SukiAlert
  isLast: boolean
  medDone: boolean
  transportDone: boolean
  onAddMedication?: () => void
  onAddCarePlan?: () => void
}

function AlertRow({ alert, isLast, medDone, transportDone, onAddMedication, onAddCarePlan }: AlertRowProps) {
  const isMedTask = (task: string) => /add.*metformin|metformin.*add/i.test(task)
  const isTransportTask = (task: string) => /transportation/i.test(task)

  return (
    <div className={`${styles.alertRow}${isLast ? '' : ` ${styles.alertRowDivider}`}`}>
      <p className={styles.alertTitle}>{alert.label}</p>
      <p className={styles.alertDetail}>{alert.detail}</p>
      {alert.tasks.map((task, idx) => {
        if (isMedTask(task) && onAddMedication) {
          return <TaskItem key={idx} label={task} done={medDone} onAction={onAddMedication} onEdit={onAddMedication} />
        }
        if (isTransportTask(task) && onAddCarePlan) {
          return <TaskItem key={idx} label={task} done={transportDone} onAction={onAddCarePlan} onEdit={onAddCarePlan} />
        }
        return <div key={idx} className={styles.alertTaskRow}><span className={styles.alertTaskText}>{task}</span></div>
      })}
    </div>
  )
}

interface CallInsightsCardProps {
  memberFirstName?: string
  memberName?: string
  memberDob?: string
  memberDisplayId?: string
  alerts?: SukiAlert[]
  onDismiss?: () => void
  medicationData?: PreCallBriefCardData
  hideSummary?: boolean
}

export function CallInsightsCard({ memberFirstName = 'Jackson', memberName = 'Jackson Thomas', memberDob, memberDisplayId, alerts, onDismiss, medicationData, hideSummary }: CallInsightsCardProps) {
  const displayAlerts = alerts && alerts.length > 0 ? alerts : DEFAULT_ALERTS
  const [reminderSent, setReminderSent] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [addMedOpen, setAddMedOpen] = useState(false)
  const [addCarePlanOpen, setAddCarePlanOpen] = useState(false)
  const [addClinicalProgramOpen, setAddClinicalProgramOpen] = useState(false)
  const [medDone, setMedDone] = useState(false)
  const [transportDone, setTransportDone] = useState(false)
  const [dppDone, setDppDone] = useState(false)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'SUKI_NOTE_SAVED') setNoteSaved(true)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleSaveNote = () => {
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach(f => f.contentWindow?.postMessage({ type: 'SUKI_NOTE_READY', noteText: SUMMARY_TEXT }, '*'))
  }

  return (
    <>
    <div className={styles.card}>
      {(!hideSummary || onDismiss) && (
        <div className={styles.header}>
          <Icon name="AutoAwesome" size="sm" color="primary" />
          <span className={styles.headerTitle}>Haven - Call summary</span>
          {onDismiss && (
            <button type="button" className={styles.dismissBtn} aria-label="Dismiss" onClick={onDismiss}>
              <Icon name="Close" size="xs" color="action" />
            </button>
          )}
        </div>
      )}

      {/* AI summary */}
      {!hideSummary && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>AI summary</p>
          <p className={styles.summaryText}>{SUMMARY_TEXT}</p>
        </div>
      )}

      {/* Alerts from this call */}
      <div className={styles.section}>
        <div className={styles.sectionLabelRow}>
          <Icon name="NotificationImportant" size="sm" color="primary" aria-hidden />
          <p className={styles.sectionLabel}>Alerts</p>
        </div>
        <div className={styles.alertList}>
          {displayAlerts.map((alert, i) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              isLast={i === displayAlerts.length - 1}
              medDone={medDone}
              transportDone={transportDone}
              onAddMedication={alert.id === 'med-adherence' ? () => setAddMedOpen(true) : undefined}
              onAddCarePlan={alert.id === 'transportation' ? () => setAddCarePlanOpen(true) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className={styles.section}>
        <div className={styles.sectionLabelRow}>
          <Icon name="Lightbulb" size="sm" color="primary" aria-hidden />
          <p className={styles.sectionLabel}>Insights</p>
        </div>
        <div className={styles.alertList}>
          <div className={`${styles.alertRow} ${styles.alertRowDivider}`}>
            <p className={styles.alertTitle}>A1C trending up</p>
            <p className={styles.alertDetail}>Fasting glucose reported at ~180 mg/dL. Last A1C was 7.8% (Feb 2024), up from 7.2% (Aug 2023). Consider escalating glycemic management discussion.</p>
          </div>
          <div className={`${styles.alertRow} ${styles.alertRowDivider}`}>
            <p className={styles.alertTitle}>Blood pressure above goal</p>
            <p className={styles.alertDetail}>Self-reported BP 142/88 mmHg - above the 130/80 target. Confirm Lisinopril adherence at next contact.</p>
          </div>
          <div className={styles.alertRow}>
            <p className={styles.alertTitle}>DPP enrollment opportunity</p>
            <p className={styles.alertDetail}>Member is eligible for the Diabetes Prevention Program and expressed interest in dietary support. Good moment to introduce referral.</p>
            <TaskItem
              label="Refer to Diabetes Prevention Program"
              done={dppDone}
              onAction={() => setAddClinicalProgramOpen(true)}
              onEdit={() => setAddClinicalProgramOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Not yet covered this call */}
      <div className={`${styles.section} ${styles.sectionLast}`}>
        <div className={styles.sectionLabelRow}>
          <Icon name="PendingActions" size="sm" color="primary" aria-hidden />
          <p className={styles.sectionLabel}>Missing Assessment</p>
        </div>
        <div className={styles.missedCard}>
          <div className={styles.missedCardHeader}>
            <span className={styles.missedCardTitle}>Assessment Not Done</span>
          </div>
          <p className={styles.missedCardDetail}>
            On 02/20/2024, {memberFirstName} agreed to complete the diabetes self-management assessment in Wellframe. It has not been completed yet.
          </p>
          <button
            type="button"
            className={`${styles.missedCardBtn}${reminderSent ? ` ${styles.missedCardBtnDone}` : ''}`}
            disabled={reminderSent}
            onClick={() => setReminderSent(true)}
          >
            {reminderSent
              ? <><Icon name="Check" size="xs" color="success" /> Message sent to {memberFirstName}</>
              : 'Send Message to Member'
            }
          </button>
        </div>
      </div>

      {/* Save to Notes */}
      <div className={styles.saveFooter}>
        <button
          type="button"
          className={`${styles.saveBtn}${noteSaved ? ` ${styles.saveBtnDone}` : ''}`}
          onClick={handleSaveNote}
          disabled={noteSaved}
        >
          <Icon name={noteSaved ? 'Check' : 'Save'} size="sm" color="inverse" />
          {noteSaved ? 'Saved' : 'Save to Notes'}
        </button>
      </div>
    </div>
    {addMedOpen && (
      <AddMedicationModal
        memberName={memberName}
        dob={memberDob ?? ''}
        memberId={memberDisplayId ?? ''}
        onClose={() => setAddMedOpen(false)}
        onComplete={() => setMedDone(true)}
      />
    )}
    {addClinicalProgramOpen && (
      <AddClinicalProgramModal
        memberName={memberName}
        dob={memberDob ?? ''}
        memberId={memberDisplayId ?? ''}
        onClose={() => setAddClinicalProgramOpen(false)}
        onComplete={() => setDppDone(true)}
      />
    )}
    {addCarePlanOpen && (
      <AddCarePlanModal
        memberName={memberName}
        dob={memberDob ?? ''}
        memberId={memberDisplayId ?? ''}
        onClose={() => setAddCarePlanOpen(false)}
        onComplete={() => setTransportDone(true)}
      />
    )}
    </>
  )
}
