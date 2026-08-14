import { Icon, Typography } from '@/components'
import sukiIcon from '@/assets/suki.png'
import dockToRightIcon from '/assets/dock_to_right.svg'
import promptIcon from '/assets/prompt.svg'
import styles from './MemberHeader.module.css'

export interface MemberHeaderProps {
  memberName: string
  phone: string
  memberId: string
  pcp: string
  onSukiClick?: () => void
  onPresetsClick?: () => void
  onHistoryClick?: () => void
  onClose?: () => void
}

export interface DashboardHeaderProps {
  onPresetsClick?: () => void
  onHistoryClick?: () => void
  onClose?: () => void
}

export function DashboardHeader({ onPresetsClick, onHistoryClick, onClose }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <div className={styles.root}>
      <div className={styles.nameRow} style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Welcome back, Beatrice</Typography>
          <Typography variant="caption">{today}</Typography>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.promptsBtn} type="button" aria-label="Preset prompts" onClick={onPresetsClick}>
            <img src={promptIcon} width={14} height={12} alt="" aria-hidden="true" />
          </button>
          <button className={styles.historyBtn} type="button" aria-label="View chat history" onClick={onHistoryClick}>
            <img src={dockToRightIcon} width={14} height={14} alt="" aria-hidden="true" />
          </button>
          <button className={styles.closeBtn} type="button" aria-label="Close Haven" onClick={onClose}>
            <span style={{ display: 'flex', color: '#000000' }}>
              <Icon name="Close" size="sm" color="action" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function MemberHeader({ memberName, phone, memberId, pcp, onSukiClick, onPresetsClick, onHistoryClick, onClose }: MemberHeaderProps) {
  return (
    <div className={styles.root}>
      {/* Row 1 - member name */}
      <div className={styles.nameRow}>
        <Icon name="Person" size="md" color="action" />
        <Typography variant="h6">{memberName}</Typography>
        <div className={styles.headerActions}>
          <button className={styles.sukiBtn} type="button" aria-label="Launch Suki voice scribe" onClick={onSukiClick}>
            <img src={sukiIcon} width={28} height={28} alt="Suki" />
          </button>
          <button className={styles.promptsBtn} type="button" aria-label="Preset prompts" onClick={onPresetsClick}>
            <img src={promptIcon} width={14} height={12} alt="" aria-hidden="true" />
          </button>
          <button className={styles.historyBtn} type="button" aria-label="View chat history" onClick={onHistoryClick}>
            <img src={dockToRightIcon} width={14} height={14} alt="" aria-hidden="true" />
          </button>
          <button className={styles.closeBtn} type="button" aria-label="Close Haven" onClick={onClose}>
            <span style={{ display: 'flex', color: '#000000' }}>
              <Icon name="Close" size="sm" color="action" />
            </span>
          </button>
        </div>
      </div>

      {/* Row 2 - data fields */}
      <div className={styles.fieldsRow}>
        <div className={styles.field}>
          <Typography variant="caption">Preferred Phone Number</Typography>
          <Typography variant="subtitle2">{phone}</Typography>
        </div>
        <div className={styles.field}>
          <Typography variant="caption">Member ID</Typography>
          <Typography variant="subtitle2">{memberId}</Typography>
        </div>
        <div className={styles.field}>
          <Typography variant="caption">Primary Care Provider</Typography>
          <Typography variant="subtitle2">{pcp}</Typography>
        </div>
      </div>
    </div>
  )
}
