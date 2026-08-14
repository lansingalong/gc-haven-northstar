import { Chip, Typography } from '@/components'
import styles from './ChatWelcome.module.css'

const FEATURED_PROMPTS = [
  "Catch me up on member's care",
  'Prepare me for a member call',
  'Help me with admin for this member',
  "Review member's care plan",
]

export interface ChatWelcomeProps {
  onPrompt: (prompt: string) => void
  onMore: () => void
}

export function ChatWelcome({ onPrompt, onMore }: ChatWelcomeProps) {
  return (
    <div className={styles.root}>
      <Typography variant="h4">Welcome</Typography>
      <Typography variant="body2">Start with a common question or ask your own below</Typography>
      <div className={styles.chipRow}>
        {FEATURED_PROMPTS.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            onClick={() => onPrompt(prompt)}
            className={styles.chip}
          />
        ))}
        <Chip
          label="More"
          onClick={onMore}
          className={styles.chip}
        />
      </div>
    </div>
  )
}
