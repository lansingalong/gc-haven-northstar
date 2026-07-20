import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './AddNoteModal.module.css'

const HEALTH_NOTE_TYPES = [
  'Behavioral Clinical History',
  'Call Log Summary',
  'Crisis Call Summary',
  'Disaster Planning',
  'Durable Medical Equipment (DME)',
  'General Note',
  'Grievance',
  'HCBS Note',
  'HH Note',
  'Member Services Call',
  'Member/Caregiver Preferred Method of Contact',
  'Provider Note',
  'Restricted Recipient Program',
  'Safety Precaution',
]

interface AddNoteModalProps {
  initialContent: string
  memberName: string
  memberId?: string
  onClose: () => void
}

function formatDateTime(d: Date): string {
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function AddNoteModal({ initialContent, memberName, memberId, onClose }: AddNoteModalProps) {
  const [noteType, setNoteType] = useState('')
  const [isAlert, setIsAlert] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [visibility, setVisibility] = useState<'all' | 'internal'>('internal')

  const enteredDate = formatDateTime(new Date('2026-07-20T10:58:00'))

  const handleAdd = () => {
    if (memberId) {
      window.parent.postMessage({ type: 'MEMBER_SWITCH_TAB', memberId, tab: 'notes' }, '*')
    }
    onClose()
  }

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add Notes">

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>⊕</span>
            <h2 className={styles.title}>Add Notes</h2>
            <span className={styles.subtitle}>Use add a note to share information with care team.</span>
          </div>
          <button className={styles.closeBtn} type="button" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className={styles.topAccent} />

        <div className={styles.body}>
          <p className={styles.required}>* Indicates required field</p>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.star}>* </span>Health Note Type</label>
              <select className={styles.select} value={noteType} onChange={e => setNoteType(e.target.value)}>
                <option value="">Select</option>
                {HEALTH_NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Entered Date</label>
              <div className={styles.dateDisplay}>
                <span>{enteredDate}</span>
              </div>
            </div>

            <div className={styles.alertToggleGroup}>
              <span className={styles.label}>Note is Alert</span>
              <button
                type="button"
                className={`${styles.toggle} ${isAlert ? styles.toggleOn : ''}`}
                onClick={() => setIsAlert(a => !a)}
                aria-pressed={isAlert}
                aria-label="Note is Alert"
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>

          <div className={styles.fieldGroupFull}>
            <label className={styles.label}><span className={styles.star}>*</span>Health Note</label>
            <div className={styles.textareaWrap}>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                autoFocus
              />
              <div className={styles.textareaFooter}>
                <span className={styles.viewableLabel}>Notes viewable by</span>
                <label className={styles.radioLabel}>
                  <input type="radio" name="noteVisibility" checked={visibility === 'all'} onChange={() => setVisibility('all')} />
                  <span>All Users</span>
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="noteVisibility" checked={visibility === 'internal'} onChange={() => setVisibility('internal')} />
                  <span>Internal Users Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.addBtn} type="button" onClick={handleAdd}>Add</button>
          <button className={styles.cancelBtn} type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
