import { useState, useEffect } from 'react'
import './global.css'
import './tokens/variables.css'
import { HavenWindow } from './features/Haven/HavenWindow'
import appStyles from './App.module.css'

const MOCK_ID_MAP: Record<string, string> = {
  'jackson-thomas': 'AH58319473',
  'maria-rivera':   'AH72940158',
  'marcus-webb':    'AH36582091',
  'sarah-williams': 'AH91427634',
  'james-oconnor':  'AH60273845',
}

interface ActiveMember {
  key: string
  name: string
  phone: string
  pcp: string
  age: string
  gender: string
  dob: string
  displayMemberId: string
}

const DEFAULT_MEMBER: ActiveMember = {
  key: 'jackson-thomas',
  name: 'Jackson Thomas',
  phone: '(907) 555-0142',
  pcp: 'Dr. Sarah Chen',
  age: '67',
  gender: 'Male',
  dob: '03/15/1958',
  displayMemberId: 'MBR-2024-0847',
}

const SESSIONS = [
  { label: 'Priority', value: 1 },
  { label: 'Monthly Intake', value: 'intake' },
  { label: 'Note Insights', value: 4 },
] as const

type DayValue = 1 | 4 | 'intake'

export default function App() {
  const [view, setView] = useState<'home' | 'member'>('home')
  const [member, setMember] = useState<ActiveMember>(DEFAULT_MEMBER)
  const [day, setDay] = useState<DayValue>(1 as DayValue)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VIEW_HOME') {
        setView('home')
      } else if (e.data?.type === 'MEMBER_SWITCH') {
        const { memberId, memberName, phone, pcp, age, gender, dob, displayMemberId, switchView } = e.data
        setMember({ key: memberId, name: memberName, phone: phone ?? '', pcp: pcp ?? '', age: age ?? '', gender: gender ?? '', dob: dob ?? '', displayMemberId: displayMemberId ?? memberId })
        if (switchView !== false) setView('member')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const havenKey = view === 'home' ? `home-day${day}` : member.key

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Day tab banner — only visible on home view */}
      {view === 'home' && (
        <div className={appStyles.dayBanner}>
          {SESSIONS.map(s => (
            <button
              key={s.value}
              className={`${appStyles.dayTab} ${day === s.value ? appStyles.dayTabActive : ''}`}
              type="button"
              onClick={() => setDay(s.value as DayValue)}
            >
              <span className={appStyles.dayLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <iframe
          src={`${import.meta.env.BASE_URL}cwf.html`}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="GuidingCare CWF"
        />
        <HavenWindow
          key={havenKey}
          isHome={view === 'home'}
          memberName={member.name}
          phone={member.phone}
          memberId={member.key}
          pcp={member.pcp}
          mockMemberId={MOCK_ID_MAP[member.key]}
          hasData={member.key in MOCK_ID_MAP}
          switchConfirmation={undefined}
          age={member.age}
          gender={member.gender}
          dob={member.dob}
          displayMemberId={member.displayMemberId}
          day={day as 1 | 4 | 'intake'}
        />
      </div>
    </div>
  )
}
