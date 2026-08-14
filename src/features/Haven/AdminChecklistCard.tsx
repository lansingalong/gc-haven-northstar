import { useState } from 'react'
import { Icon } from '@/components/Icons'
import styles from './SummaryCard.module.css'
import { UracChecklistCard, buildSections } from './UracChecklistCard'
import type { ChecklistType } from './UracChecklistCard'

function countCompleted(type: ChecklistType, memberId?: string) {
  const sections = buildSections(type, memberId)
  const done = sections.reduce((s, sec) => s + sec.items.filter(i => i.checked).length, 0)
  const total = sections.reduce((s, sec) => s + sec.items.length, 0)
  return { done, total }
}

function ChecklistStandaloneCard({
  title,
  icon,
  checklistType,
  memberId,
}: {
  title: string
  icon: string
  checklistType: ChecklistType
  memberId?: string
}) {
  const [open, setOpen] = useState(false)
  const { done, total } = countCompleted(checklistType, memberId)
  const allDone = done === total

  return (
    <div className={open ? styles.cardExpanded : styles.card} style={{ marginTop: 10 }}>
      <div className={`${styles.cardInner} ${open ? '' : styles.cardInnerCollapsed}`}>
        <button
          type="button"
          className={`${styles.cardHeader} ${open ? '' : styles.cardHeaderCollapsed}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{ background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={icon as 'VerifiedUser'} size="sm" color="primary" aria-hidden />
            <span className={styles.cardTitle}>{title}</span>
            <span
              className={`${styles.badge} ${allDone ? styles.badgeActive : styles.badgeWarning}`}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {done}/{total}
            </span>
          </div>
          <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" aria-hidden />
        </button>
        {open && (
          <div style={{ paddingTop: 4 }}>
            <UracChecklistCard memberId={memberId} checklistType={checklistType} />
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminChecklistCard({ memberId }: { memberId?: string }) {
  return (
    <>
      <ChecklistStandaloneCard
        title="URAC Compliance"
        icon="VerifiedUser"
        checklistType="case-closure"
        memberId={memberId}
      />
      <ChecklistStandaloneCard
        title="NCQA Compliance"
        icon="AssignmentTurnedIn"
        checklistType="compliance"
        memberId={memberId}
      />
      <ChecklistStandaloneCard
        title="General Compliance"
        icon="Gavel"
        checklistType="general"
        memberId={memberId}
      />
    </>
  )
}
