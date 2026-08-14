import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './AddCarePlanModal.module.css'

interface AddCarePlanModalProps {
  memberName: string
  dob: string
  memberId: string
  onClose: () => void
  onComplete?: () => void
}

export function AddCarePlanModal({ memberName, dob, memberId, onClose, onComplete }: AddCarePlanModalProps) {
  const [condition, setCondition] = useState('General')
  const [opportunity, setOpportunity] = useState('Consider referring member to a transportation Vendor to get help for transportation')
  const [goalGroup, setGoalGroup] = useState('Access to care')
  const [goal, setGoal] = useState('Ensure member meets transportation Vendor for transportation')
  const [intervention, setIntervention] = useState('Provide transportation vendor contact information to member to get help for transportation')
  const [startDate, setStartDate] = useState('08/07/2026')
  const [targetDate, setTargetDate] = useState('08/20/2026')
  const [status, setStatus] = useState('In Progress')
  const [assignOwner, setAssignOwner] = useState('')
  const [note, setNote] = useState('')
  const [notesViewable, setNotesViewable] = useState<'all' | 'internal'>('internal')

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add Care Plan Item">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Add Care Plan Item</h2>
          </div>
          <button className={styles.closeBtn} type="button" aria-label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className={styles.topAccent} />

        {/* Member info bar */}
        <div className={styles.memberBar}>
          <span className={styles.memberName}>{memberName}</span>
          <span className={styles.memberMeta}>DOB {dob}</span>
          <span className={styles.memberMeta}>Member ID {memberId}</span>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.required}>* Indicates required field</p>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><span className={styles.star}>*</span>Condition</label>
              <input className={styles.input} type="text" value={condition} onChange={e => setCondition(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><span className={styles.star}>*</span>Opportunity</label>
              <input className={styles.input} type="text" value={opportunity} onChange={e => setOpportunity(e.target.value)} />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><span className={styles.star}>*</span>Goal Group</label>
              <input className={styles.input} type="text" value={goalGroup} onChange={e => setGoalGroup(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><span className={styles.star}>*</span>Goal</label>
              <input className={styles.input} type="text" value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
          </div>

          {/* Interventions */}
          <div className={styles.interventionsSection}>
            <div className={styles.interventionsHeader}>
              <span className={styles.interventionsTitle}>Interventions</span>
              <span className={styles.interventionsHint}>Interventions manage care for members.</span>
            </div>
            <div className={styles.interventionRow}>
              <div className={styles.interventionField}>
                <label className={styles.fieldLabel}><span className={styles.star}>*</span>Intervention</label>
                <div className={styles.interventionInputWrap}>
                  <input
                    className={styles.input}
                    type="text"
                    value={intervention}
                    onChange={e => setIntervention(e.target.value)}
                    placeholder="Start search by entering text to access library"
                  />
                  <button className={styles.searchBtn} type="button" aria-label="Search library">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.dateField}>
                <label className={styles.fieldLabel}><span className={styles.star}>*</span>Start Date</label>
                <div className={styles.dateRow}>
                  <input className={styles.dateInput} type="text" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <button className={styles.calBtn} type="button" aria-label="Pick date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.dateField}>
                <label className={styles.fieldLabel}><span className={styles.star}>*</span>Target Date</label>
                <div className={styles.dateRow}>
                  <input className={styles.dateInput} type="text" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                  <button className={styles.calBtn} type="button" aria-label="Pick date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.interventionActions}>
                <button type="button" className={styles.interventionActionBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  Add
                </button>
                <button type="button" className={styles.interventionActionBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                  Remove
                </button>
                <button type="button" className={styles.interventionActionBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Status + Assign Owner */}
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><span className={styles.star}>*</span>Status</label>
              <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Not Started</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Assign Owner</label>
              <select className={styles.select} value={assignOwner} onChange={e => setAssignOwner(e.target.value)}>
                <option value="">Select</option>
                <option>Beatrice</option>
                <option>Care Team</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Note</label>
            <textarea
              className={styles.textarea}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
            />
          </div>

          {/* Notes viewable by */}
          <div className={styles.notesViewable}>
            <span className={styles.fieldLabel}>Notes viewable by</span>
            <div className={styles.radioGroup}>
              {(['all', 'internal'] as const).map(v => (
                <label key={v} className={styles.radioLabel}>
                  <input type="radio" className={styles.radioInput} name="notesViewable" checked={notesViewable === v} onChange={() => setNotesViewable(v)} />
                  <span className={`${styles.radioCircle} ${notesViewable === v ? styles.radioCircleActive : ''}`} />
                  {v === 'all' ? 'All Users' : 'Internal Users Only'}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.saveAddBtn} type="button">Save &amp; Add More</button>
          <button className={styles.addCloseBtn} type="button" onClick={() => { onComplete?.(); onClose() }}>Add &amp; Close</button>
          <button className={styles.cancelBtn} type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
