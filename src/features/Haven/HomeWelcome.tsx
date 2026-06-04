import { useState } from 'react'
import { Icon } from '@/components/Icons'
import { Typography } from '@/components'
import { AddActivityModal, type ActivityConfig } from './AddActivityModal'
import styles from './HomeWelcome.module.css'

export interface HomeWelcomeProps {
  onPrompt: (text: string) => void
  onPresetsClick: () => void
}

const CONTINUE_ITEMS = [
  { icon: 'Assignment', text: 'Update care plan goals' },
]

const SUGGESTED_TASKS = [
  { icon: 'Phone', text: 'Follow-up call — Jackson Thomas', due: 'Today' },
  { icon: 'Description', text: 'Complete URAC documentation — Maria Rivera', due: 'Today' },
  { icon: 'Assignment', text: 'Care plan review — Robert Chen', due: 'Jun 4' },
]

const ALERTS = [
  { label: 'ER Visit', member: 'Maria Rivera', detail: 'visited ER on 5/30', severity: 'warning' as const, action: 'Schedule a follow-up call to review discharge plan' },
  { label: 'Rx Change', member: 'Jackson Thomas', detail: 'Glipizide 10mg discontinued, Jardiance 10mg started on 6/1', severity: 'warning' as const, action: 'Update medication list in care plan and educate member on new dosing schedule' },
{ label: 'Assessment Overdue', member: 'Sarah Williams', detail: 'HRA not completed — due 5/15', severity: 'error' as const, action: 'Call member to complete health risk assessment' },
]

function Card({ icon, iconColor, title, defaultOpen = true, children }: {
  icon: string
  iconColor: 'primary' | 'error'
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.card}>
      <button className={styles.cardHeader} type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Icon name={icon as never} size="sm" color={iconColor} />
        <span className={styles.cardTitle}>{title}</span>
        <Icon name={open ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" />
      </button>
      {open && <div className={styles.actionList}>{children}</div>}
    </div>
  )
}

export function HomeWelcome({ onPrompt }: HomeWelcomeProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [taskListOpen, setTaskListOpen] = useState(false)
  const [openModal, setOpenModal] = useState<typeof ALERTS[number] | null>(null)

  const checkedTasks = ALERTS.filter(a => checked.has(a.member))
  const allChecked = checked.size === ALERTS.length

  function toggle(member: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(member) ? next.delete(member) : next.add(member)
      return next
    })
    if (!taskListOpen && !checked.has(member)) setTaskListOpen(true)
  }

  function selectAll() {
    if (allChecked) {
      setChecked(new Set())
      setTaskListOpen(false)
    } else {
      setChecked(new Set(ALERTS.map(a => a.member)))
      setTaskListOpen(true)
    }
  }

  return (
    <>
    <div className={styles.root}>
      <Typography variant="h4">Welcome back, Beatrice</Typography>

      <div className={styles.cards}>
        <Card icon="NotificationImportant" iconColor="error" title="Needs your attention">
          {ALERTS.map(a => {
            const isChecked = checked.has(a.member)
            return (
              <div key={a.member} className={styles.alertItem}>
                <div className={styles.alertRow}>
                  <span className={`${styles.alertDot} ${styles[a.severity]}`} aria-hidden="true" />
                  <span className={styles.actionText}>
                    <span className={styles.alertLabel}>{a.label}</span>
                    {' · '}<span className={styles.alertMember}>{a.member}</span>
                    <span className={styles.alertDetail}> — {a.detail}</span>
                  </span>
                </div>
                <button
                  className={styles.alertAction}
                  type="button"
                  onClick={() => toggle(a.member)}
                  aria-pressed={isChecked}
                >
                  <Icon name={isChecked ? 'CheckBox' : 'CheckBoxOutlineBlank'} size="sm" color="action" />
                  {a.action}
                </button>
              </div>
            )
          })}

          <div className={styles.selectAllRow}>
            <button className={styles.selectAllBtn} type="button" onClick={selectAll}>
              <Icon name={allChecked ? 'CheckBox' : 'CheckBoxOutlineBlank'} size="sm" color="action" />
              {allChecked ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {/* Task list — shown once at least one is checked */}
          {checkedTasks.length > 0 && (
            <div className={styles.taskList}>
              <button
                className={styles.taskListHeader}
                type="button"
                onClick={() => setTaskListOpen(o => !o)}
                aria-expanded={taskListOpen}
              >
                <Icon name="TaskAlt" size="sm" color="primary" />
                <span className={styles.taskListTitle}>Task List ({checkedTasks.length})</span>
                <Icon name={taskListOpen ? 'ExpandLess' : 'ExpandMore'} size="sm" color="action" />
              </button>
              {taskListOpen && (
                <div className={styles.taskListItems}>
                  {checkedTasks.map(t => (
                    <div key={t.member} className={styles.taskListItem}>
                      <button
                        className={styles.taskLink}
                        type="button"
                        onClick={() => setOpenModal(t)}
                      >
                        <span className={styles.alertMember}>{t.member}</span>
                        {' — '}{t.action}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card icon="History" iconColor="primary" title="Continue where you left off" defaultOpen={false}>
          {CONTINUE_ITEMS.map(a => (
            <button key={a.text} className={styles.actionRow} type="button" onClick={() => onPrompt(a.text)}>
              <Icon name={a.icon as never} size="sm" color="action" />
              <span className={styles.actionText}>{a.text}</span>
              <Icon name="ChevronRight" size="sm" color="action" />
            </button>
          ))}
          <div className={styles.sectionDivider}>Today's Tasks</div>
          {SUGGESTED_TASKS.map(t => (
            <button key={t.text} className={styles.actionRow} type="button" onClick={() => onPrompt(t.text)}>
              <Icon name={t.icon as never} size="sm" color="action" />
              <span className={styles.actionText}>{t.text}</span>
              <span className={`${styles.dueBadge} ${t.due === 'Today' ? styles.dueToday : ''}`}>{t.due}</span>
            </button>
          ))}
        </Card>
      </div>
    </div>

    {openModal && (
      <AddActivityModal
        config={{
          title: 'Add Activity',
          activityType: 'Follow-up',
          contactType: 'Member - Phone',
          scheduledDate: '',
        } as ActivityConfig}
        memberName={openModal.member}
        onClose={() => setOpenModal(null)}
        onAdd={() => setOpenModal(null)}
      />
    )}
    </>
  )
}
