import { useState } from 'react'
import styles from './PresetPromptsPanel.module.css'
import { Icon } from '@/components/Icons'

interface PresetPromptsPanelProps {
  onClose: () => void
  onSelectPrompt: (text: string) => void
  memberName?: string
}

const DEFAULT_VISIBLE = 3

function getCategories(firstName: string) {
  return [
    {
      icon: 'AccountBox' as const,
      label: 'Get Member Details',
      prompts: [
        "What is this member's current risk level?",
        "What is this member's last recorded health indicator?",
        "What services is this member eligible for?",
        "What is this member's current medication list?",
      ],
    },
    {
      icon: 'AutoAwesome' as const,
      label: 'Summarize for Me',
      prompts: [
        'Summarize what I need before calling the member',
        'Summarize my outreach attempts for this member',
        'Summarize a catch-up since last conversation',
        'Summarize clinical changes since last conversation',
        'Summarize a care plan review for the member',
      ],
    },
    {
      icon: 'Assignment' as const,
      label: 'Prepare',
      prompts: [
        'Prep me for an outreach call',
        'Prep me for a follow-up call',
        `Summarize what I should know before calling ${firstName} today`,
        'Which care plan goals are currently in progress?',
      ],
    },
    {
      icon: 'LocalHospital' as const,
      label: 'Care Gaps',
      prompts: [
        `What are the open care gaps for ${firstName}?`,
        'Which HEDIS measures are overdue?',
        `What assessments have been completed for ${firstName}?`,
        'What did the most recent health risk assessment show?',
      ],
    },
    {
      icon: 'Receipt' as const,
      label: 'Visits & Claims',
      prompts: [
        `Has ${firstName} had any ER visits recently?`,
        `Has ${firstName} had any recent hospitalizations?`,
        `What are ${firstName}'s latest claims?`,
        `Is ${firstName} enrolled in any disease management programs?`,
      ],
    },
    {
      icon: 'Person' as const,
      label: 'Member Details',
      prompts: [
        'When is the best time of day to contact the member?',
        `What is on ${firstName}'s medication list?`,
        `Has ${firstName}'s risk level changed since our last call?`,
        `What are ${firstName}'s active diagnoses?`,
        'What does the care plan look like right now?',
      ],
    },
  ]
}

export function PresetPromptsPanel({ onClose, onSelectPrompt, memberName = '' }: PresetPromptsPanelProps) {
  const firstName = memberName.split(' ')[0] || 'this member'
  const categories = getCategories(firstName)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function handleSelect(prompt: string) {
    onSelectPrompt(prompt)
    onClose()
  }

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onClose} type="button" aria-label="Back">
          <Icon name="ArrowBackIos" size="sm" color="action" />
          <span>Back</span>
        </button>
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close prompts">
          <Icon name="Close" size="md" color="action" />
        </button>
      </div>


      <div className={styles.content}>
        {categories.map(cat => {
          const isExpanded = !!expanded[cat.label]
          const visible = isExpanded ? cat.prompts : cat.prompts.slice(0, DEFAULT_VISIBLE)
          const hasMore = cat.prompts.length > DEFAULT_VISIBLE

          return (
            <div key={cat.label} className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Icon name={cat.icon} size="md" color="primary" />
                  <span>{cat.label}</span>
                </div>
                {hasMore && (
                  <button
                    className={styles.moreLink}
                    type="button"
                    onClick={() => setExpanded(prev => ({ ...prev, [cat.label]: !prev[cat.label] }))}
                  >
                    {isExpanded ? 'Less' : 'More Prompts'}
                  </button>
                )}
              </div>

              <div className={styles.bubbles}>
                {visible.map(prompt => (
                  <button
                    key={prompt}
                    className={styles.bubble}
                    type="button"
                    onClick={() => handleSelect(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
