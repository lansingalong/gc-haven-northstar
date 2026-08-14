import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './AddClinicalProgramModal.module.css'

interface AddClinicalProgramModalProps {
  memberName: string
  dob: string
  memberId: string
  onClose: () => void
  onComplete?: () => void
}

const PAYORS = [
  { label: 'Program Enrollment', code: 'Program Enrollment' },
  { label: 'Altruists Health Insurance', code: 'AHI' },
]

export function AddClinicalProgramModal({ memberName, dob, memberId, onClose, onComplete }: AddClinicalProgramModalProps) {
  const [selectedPayor, setSelectedPayor] = useState<number | null>(null)
  const [activeToggle, setActiveToggle] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [statusDescription, setStatusDescription] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [assignedCM, setAssignedCM] = useState('')

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add Clinical Programs">

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add Clinical Programs</h2>
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

          {/* Payor section */}
          <div className={styles.payorSection}>
            <div className={styles.payorHeader}>
              <span className={styles.payorLabel}>Payor</span>
              <div className={styles.payorHeaderRight}>
                <span className={styles.toggleLabel}>Active</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${activeToggle ? styles.toggleOn : ''}`}
                  onClick={() => setActiveToggle(v => !v)}
                  aria-pressed={activeToggle}
                  aria-label="Toggle active/inactive"
                >
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>Inactive</span>
                <button type="button" className={styles.viewEligibilityLink}>View Full Eligibility</button>
              </div>
            </div>
            <div className={styles.payorList}>
              {PAYORS.map((p, i) => (
                <label key={i} className={styles.payorRow}>
                  <input
                    type="radio"
                    className={styles.radioInput}
                    name="payor"
                    checked={selectedPayor === i}
                    onChange={() => setSelectedPayor(i)}
                  />
                  <span className={`${styles.radioCircle} ${selectedPayor === i ? styles.radioCircleActive : ''}`} />
                  <span className={styles.payorRowText}>Payor <span className={styles.payorRowLink}>{p.label}</span></span>
                  <span className={styles.payorRowText}>Code <span className={styles.payorRowLink}>{p.code}</span></span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Clinical Program checkbox row */}
          <label className={styles.addProgramRow}>
            <span className={styles.checkboxChecked}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.addProgramLabel}>Add Clinical Program</span>
          </label>

          {/* Program row */}
          <div className={styles.programRow}>
            <div className={styles.programField}>
              <label className={styles.fieldLabel}>Program</label>
              <select className={styles.select} defaultValue="Diabetes Management">
                <option>Diabetes Management</option>
                <option>Hypertension Management</option>
                <option>Diabetes Prevention Program</option>
              </select>
            </div>
            <div className={styles.dateField}>
              <label className={styles.fieldLabel}>Start Date <span className={styles.star}>*</span></label>
              <div className={styles.dateRow}>
                <input className={styles.dateInput} type="text" placeholder="Start Date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <button className={styles.calBtn} type="button" aria-label="Pick start date">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </button>
                <span className={styles.star}>*</span>
              </div>
            </div>
            <div className={styles.dateField}>
              <label className={styles.fieldLabel}>End Date</label>
              <div className={styles.dateRow}>
                <input className={styles.dateInput} type="text" placeholder="End Date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button className={styles.calBtn} type="button" aria-label="Pick end date">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.selectField}>
              <label className={styles.fieldLabel}>Status <span className={styles.star}>*</span></label>
              <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Select</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            </div>
            <div className={styles.selectField}>
              <label className={styles.fieldLabel}>Status Description <span className={styles.star}>*</span></label>
              <select className={styles.select} value={statusDescription} onChange={e => setStatusDescription(e.target.value)}>
                <option value="">Select</option>
                <option>Enrolled</option>
                <option>Referred</option>
                <option>Declined</option>
              </select>
            </div>
            <div className={styles.selectField}>
              <label className={styles.fieldLabel}>Referral Source <span className={styles.star}>*</span></label>
              <select className={styles.select} value={referralSource} onChange={e => setReferralSource(e.target.value)}>
                <option value="">Select</option>
                <option>Care Manager</option>
                <option>PCP</option>
                <option>Member</option>
              </select>
            </div>
            <div className={styles.selectField}>
              <label className={styles.fieldLabel}>Assigned Care Manager <span className={styles.star}>*</span></label>
              <select className={styles.select} value={assignedCM} onChange={e => setAssignedCM(e.target.value)}>
                <option value="">Select</option>
                <option>Beatrice</option>
              </select>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.rowActionAdd} aria-label="Add row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
              </button>
              <button type="button" className={styles.rowActionRemove} aria-label="Remove row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm5 11H7v-2h10v2z"/></svg>
              </button>
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
