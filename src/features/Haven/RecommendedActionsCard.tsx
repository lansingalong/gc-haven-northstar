import { useState } from 'react'
import { Icon } from '@/components/Icons'
import { AddActivityModal, type ActivityConfig } from './AddActivityModal'
import styles from './RecommendedActionsCard.module.css'

type Destination = 'activities' | 'care-plan'

const ACTIONS: {
  label: string
  destination: Destination
  activity: ActivityConfig
}[] = [
  {
    label: 'Schedule a follow-up call with the member',
    destination: 'activities',
    activity: {
      title: 'Add Activity',
      activityType: 'Call member',
      contactType: 'Member - Phone',
      scheduledDate: '',
    },
  },
  {
    label: 'Add doctor appointment for member',
    destination: 'activities',
    activity: {
      title: 'Add Activity',
      activityType: 'Doctor Appointment',
      contactType: 'Member - In Person',
      scheduledDate: '',
    },
  },
  {
    label: 'Add Improve Knowledge and Skills in Managing Diabetes an opportunity',
    destination: 'care-plan',
    activity: {
      title: 'Add Activity',
      activityType: 'Education Session',
      contactType: 'Member - Phone',
      scheduledDate: '',
    },
  },
]

interface RecommendedActionsCardProps {
  memberName?: string
  onDismiss?: () => void
  onActivityAdded?: (config: ActivityConfig, destination: Destination) => void
  onNavigate?: (destination: Destination) => void
}

export function RecommendedActionsCard({
  memberName = 'Jackson Thomas',
  onDismiss,
  onActivityAdded,
  onNavigate,
}: RecommendedActionsCardProps) {
  const [added, setAdded] = useState<Set<number>>(new Set())
  const [done, setDone] = useState<Set<number>>(new Set())
  const [view, setView] = useState<'actions' | 'tasklist'>('actions')
  const [openModal, setOpenModal] = useState<number | null>(null)

  const toggle = (i: number) => {
    setAdded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }
  const addAll = () => setAdded(new Set(ACTIONS.map((_, i) => i)))
  const allAdded = added.size === ACTIONS.length
  const someAdded = added.size > 0
  const addedItems = ACTIONS.map((a, i) => ({ ...a, i })).filter(({ i }) => added.has(i))

  /* ── Task list view ── */
  if (view === 'tasklist') {
    return (
      <>
        <div className={styles.root}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <button className={styles.backBtn} type="button" onClick={() => setView('actions')}>
                <Icon name="ArrowBack" size="xs" color="action" />
              </button>
              <Icon name="TaskAlt" size="sm" color="primary" />
              <span className={styles.title}>Task List</span>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.dismissBtn} type="button" aria-label="Dismiss" onClick={onDismiss}>
                <Icon name="Close" size="xs" color="action" />
              </button>
            </div>
          </div>

          <div className={styles.cards}>
            {addedItems.map(({ label, i }) => {
              const isDone = done.has(i)
              return (
                <div key={i} className={`${styles.taskCard} ${isDone ? styles.taskCardDone : ''}`}>
                  <div className={styles.taskCardLeft}>
                    <Icon
                      name={isDone ? 'CheckCircle' : 'RadioButtonUnchecked'}
                      size="md"
                      color={isDone ? 'success' : 'action'}
                    />
                    <div className={styles.taskCardContent}>
                      <button
                        className={`${styles.taskLinkBtn} ${isDone ? styles.taskLinkBtnDone : ''}`}
                        type="button"
                        onClick={() => isDone ? onNavigate?.(ACTIONS[i].destination) : setOpenModal(i)}
                      >
                        {label}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {openModal !== null && (
          <AddActivityModal
            config={ACTIONS[openModal].activity}
            memberName={memberName}
            onClose={() => setOpenModal(null)}
            onAdd={() => {
              const idx = openModal
              setDone(prev => new Set(prev).add(idx))
              onActivityAdded?.(ACTIONS[idx].activity, ACTIONS[idx].destination)
              setOpenModal(null)
            }}
          />
        )}
      </>
    )
  }

  /* ── Actions view ── */
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="AutoAwesome" size="sm" color="primary" />
          <span className={styles.title}>Review Recommended Actions</span>
        </div>
        <div className={styles.headerRight}>
          {allAdded && (
            <span className={styles.allDone}>
              <Icon name="PlaylistAddCheck" size="xs" color="primary" />
              All added to list
            </span>
          )}
          <button className={styles.dismissBtn} type="button" aria-label="Dismiss" onClick={onDismiss}>
            <Icon name="Close" size="xs" color="action" />
          </button>
        </div>
      </div>

      {!allAdded && (
        <div className={styles.addAllRow}>
          <button className={styles.addAllBtn} type="button" onClick={addAll}>
            Add all to list
          </button>
        </div>
      )}
      <div className={styles.cards}>
        {ACTIONS.map(({ label }, i) => {
          const isAdded = added.has(i)
          return (
            <button
              key={i}
              className={`${styles.actionCard} ${isAdded ? styles.actionCardAdded : ''}`}
              type="button"
              onClick={() => toggle(i)}
            >
              <span className={styles.addIcon}>
                {isAdded
                  ? <Icon name="PlaylistAddCheck" size="md" color="primary" />
                  : <Icon name="AddCircleOutline" size="md" color="primary" />
                }
              </span>
              <span className={styles.actionText}>{label}</span>
              {isAdded && <span className={styles.addedTag}>✓ Added</span>}
            </button>
          )
        })}
      </div>

      {someAdded && (
        <button className={styles.finishBtn} type="button" onClick={() => setView('tasklist')}>
          <Icon name="TaskAlt" size="sm" color="inherit" />
          View Task List
        </button>
      )}
    </div>
  )
}
