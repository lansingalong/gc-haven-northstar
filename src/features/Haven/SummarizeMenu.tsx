import styles from './MemberDetailMenu.module.css'

const PROMPTS = [
  'Summarize what I need before calling the member',
  'Summarize my outreach attempts for this member',
  'Summarize a catch-up since last conversation',
  'Summarize clinical changes since last conversation',
  'Summarize a care plan review for the member',
]

export interface SummarizeMenuProps {
  onSelect: (prompt: string) => void
  onClose: () => void
}

export function SummarizeMenu({ onSelect, onClose }: SummarizeMenuProps) {
  return (
    <div className={styles.menu} role="menu">
      {PROMPTS.map((label) => (
        <button
          key={label}
          className={styles.item}
          role="menuitem"
          type="button"
          onClick={() => { onSelect(label); onClose() }}
        >
          <span className={styles.itemLabel}>{label}</span>
        </button>
      ))}
    </div>
  )
}
