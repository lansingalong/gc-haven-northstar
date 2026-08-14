import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Icon, AiAssistant } from '@/components/Icons'
import { MemberHeader, DashboardHeader } from './MemberHeader'
import { ChatWelcome } from './ChatWelcome'
import { MemberDetailMenu } from './MemberDetailMenu'
import { SummarizeMenu } from './SummarizeMenu'
import { ComplianceMenu } from './ComplianceMenu'
import { DocumentMenu } from './DocumentMenu'
import { ChatMessages, type Message, type FollowUpChip } from './ChatMessages'
import { AskHavenInput } from './AskHavenInput'
import styles from './HavenWindow.module.css'
import panelStyles from './HavenPanel.module.css'
import { getMockReply, getFollowUp, getFollowUpQuery, getGuardrailMessage, getRecommendedActionsFromNote, getLastUpdateData, getOpenCareGaps } from './mockReplies'
import { type SmartGoalData } from './SmartGoalCard'
import { HomeWelcome, MariaTodaysTasks, MarcusNewMemberWelcome } from './HomeWelcome'
import { MemberChatWindow } from './MemberChatWindow'
import { SukiWindow, type Alert as SukiAlert } from './SukiWindow'
import { ChatHistoryDrawer } from './ChatHistoryDrawer'
import { PresetPromptsPanel } from './PresetPromptsPanel'
import { RecommendedActionsCard } from './RecommendedActionsCard'
import { CallInsightsCard } from './CallInsightsCard'
import { AddActivityModal, type ActivityConfig } from './AddActivityModal'
import { Alert } from '@/components'
import { useChatHistory } from './useChatHistory'
import chatIcon from '@/assets/chat.png'
import chevronForwardIcon from '@/assets/chevron_forward.png'
import { type PreCallBriefCardData, type CatchMeUpCardData } from './PreCallBriefCard'
import {
  marcusMemberDetail,
  marcusEligibility,
  marcusMedications,
  marcusDiagnosis,
  marcusGapsInCare,
  marcusVisits,
  marcusPrograms,
} from '@/mocks/marcusWebb'
import {
  mockMemberDetail as jacksonMemberDetail,
  mockEligibility as jacksonEligibility,
  mockMedications as jacksonMedications,
  mockDiagnosis as jacksonDiagnosis,
  mockGapsInCare as jacksonGapsInCare,
  mockVisits as jacksonVisits,
  mockPrograms as jacksonPrograms,
} from '@/mocks'
import { sarahMedications, sarahCarePlan } from '@/mocks/sarahWilliams'
import { marcusCarePlan } from '@/mocks/marcusWebb'
import { mockCarePlan as jacksonCarePlan } from '@/mocks'
import { jamesCarePlan } from '@/mocks/jamesOConnor'
import {
  jamesMemberDetail,
  jamesEligibility,
  jamesMedications,
  jamesDiagnosis,
  jamesGapsInCare,
  jamesVisits,
  jamesPrograms,
} from '@/mocks/jamesOConnor'

const JACKSON_SMART_GOAL: SmartGoalData = {
  goals: [
    {
      name: 'Blood Sugar Monitoring',
      description: 'Daily glucose logging to support A1C reduction',
      iconName: 'MonitorHeart',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Check blood sugar and log readings twice daily, before breakfast and before dinner' },
        { label: 'How will you and the member know progress is being made?', value: 'Twice daily readings logged in Wellframe and A1C target below 8.0% at next lab visit.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member agreed and has no major barriers.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Supports A1C reduction from 9.2%, consistent monitoring is the primary identified opportunity.' },
        { label: 'What is the timeframe for this goal?', value: '30 days' },
        { label: 'How will progress be tracked?', value: 'Wellframe app logging, phone calls, text.' },
      ],
    },
    {
      name: 'Medication Adherence',
      description: 'Consistent use of prescribed diabetes medications',
      iconName: 'Medication',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Take metformin as prescribed twice daily with meals and refill before running out' },
        { label: 'How will you and the member know progress is being made?', value: 'Member self-reports adherence weekly via Wellframe and pharmacy refill history shows no gaps.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member has pharmacy coverage and is motivated to manage diabetes.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Medication adherence is essential to achieving A1C target and preventing complications.' },
        { label: 'What is the timeframe for this goal?', value: '60 days' },
        { label: 'How will progress be tracked?', value: 'Pharmacy refill data, Wellframe check-ins, care manager follow-up calls.' },
      ],
    },
    {
      name: 'Foot Care & Exam',
      description: 'Preventive foot care to reduce complication risk',
      iconName: 'HealthAndSafety',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Complete annual podiatry exam and perform daily foot inspection at home' },
        { label: 'How will you and the member know progress is being made?', value: 'Podiatry appointment scheduled and completed; member demonstrates daily inspection routine.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member has transportation access and podiatry is covered under their plan.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Addresses open HEDIS gap for diabetic foot exam and reduces risk of amputation.' },
        { label: 'What is the timeframe for this goal?', value: '30 days' },
        { label: 'How will progress be tracked?', value: 'Appointment confirmation, HEDIS gap closure, member self-report.' },
      ],
    },
  ],
}

const MARIA_SMART_GOAL: SmartGoalData = {
  goals: [
    {
      name: 'Personal Care Aide Visits',
      description: 'Maintain aide support for ADLs and independent living',
      iconName: 'SupportAgent',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Participate in at least 3 approved personal care aide visits per week to assist with bathing, dressing, and meal preparation' },
        { label: 'How will you and the member know progress is being made?', value: 'Care aide visit logs completed weekly and member reports ability to complete 2+ ADLs independently by next assessment.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member has authorized aide services and caregiver support at home.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Supports LTSS care plan objective to maintain independent living and prevent nursing facility placement.' },
        { label: 'What is the timeframe for this goal?', value: '60 days' },
        { label: 'How will progress be tracked?', value: 'Aide visit logs, monthly care manager check-ins, ADL reassessment.' },
      ],
    },
    {
      name: 'Home Safety & Fall Prevention',
      description: 'Reduce fall risk and improve safety in the home',
      iconName: 'HomeWork',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Complete a home safety assessment and implement at least 2 recommended modifications (e.g. grab bars, removal of tripping hazards)' },
        { label: 'How will you and the member know progress is being made?', value: 'Home safety checklist completed and modifications confirmed at next care manager visit.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member has family support and modifications are covered under LTSS waiver.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Addresses fall risk identified in ADL assessment and supports continued community living.' },
        { label: 'What is the timeframe for this goal?', value: '30 days' },
        { label: 'How will progress be tracked?', value: 'Care manager home visit, member and caregiver self-report.' },
      ],
    },
  ],
}

const JAMES_SMART_GOAL: SmartGoalData = {
  goals: [
    {
      name: 'Apixaban Adherence',
      description: 'Consistent anticoagulation to reduce stroke risk',
      iconName: 'Medication',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Take Apixaban as prescribed twice daily with the aid of a medication calendar or pill organizer' },
        { label: 'How will you and the member know progress is being made?', value: 'Member self-reports adherence weekly via phone check-in and pharmacy refill history shows no gaps.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, wife Patricia assists with medication management and a pill organizer is in place.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Consistent Apixaban use is critical for AFib-related stroke prevention, the highest-priority care plan goal.' },
        { label: 'What is the timeframe for this goal?', value: '30 days' },
        { label: 'How will progress be tracked?', value: 'Pharmacy refill data, weekly care manager calls, pill organizer check at next visit.' },
      ],
    },
    {
      name: 'Pulmonary Rehabilitation',
      description: 'Enroll and participate in pulmonary rehab for COPD',
      iconName: 'MonitorHeart',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Contact the pulmonary rehab center to schedule an intake appointment within 2 weeks' },
        { label: 'How will you and the member know progress is being made?', value: 'Intake appointment scheduled; member attends at least 2 sessions in the first month.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, transportation support is available and rehab is covered under his plan.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'Addresses COPD Gold III functional decline and is an open program eligibility gap.' },
        { label: 'What is the timeframe for this goal?', value: '60 days' },
        { label: 'How will progress be tracked?', value: 'Appointment confirmation, session attendance logs, O₂ sat trend monitoring.' },
      ],
    },
    {
      name: 'Flu & Pneumococcal Vaccination',
      description: 'Close high-priority HEDIS vaccination gaps',
      iconName: 'HealthAndSafety',
      fields: [
        { label: 'What behavior or action should the member take?', value: 'Schedule and receive flu vaccine and PCV20 pneumococcal vaccine at next PCP visit or pharmacy' },
        { label: 'How will you and the member know progress is being made?', value: 'Vaccination records updated in GuidingCare and HEDIS gaps closed.' },
        { label: "Is this realistic given the member's current barriers and abilities?", value: 'Yes, member has PCP access and vaccines are covered with no cost share.' },
        { label: "How does this goal connect to the member's condition or care plan?", value: 'COPD significantly elevates infection risk; flu and PCV20 are both open HEDIS gaps.' },
        { label: 'What is the timeframe for this goal?', value: '30 days' },
        { label: 'How will progress be tracked?', value: 'Immunization record update, HEDIS gap closure confirmation.' },
      ],
    },
  ],
}

function getJamesPreCallBriefCardData(): PreCallBriefCardData {
  const elig = jamesEligibility.eligibilities[0]
  const activeMeds = jamesMedications.filter(m => m.isCurrent)
  const primaryProgram = jamesPrograms.find(p => p.status === 'Active') ?? jamesPrograms[0]
  const recentVisits = [...jamesVisits].sort((a, b) => b.serviceFrom.localeCompare(a.serviceFrom))

  return {
    memberFirstName: jamesMemberDetail.memberFirstName,

    referralProgram: primaryProgram?.program ?? 'Care Coordination',
    referralBy: primaryProgram?.referralSource ?? 'Care Manager',
    referralDate: primaryProgram?.createdOn ?? '2026-01-01',
    referralLastUpdated: primaryProgram?.updatedOn ?? '2026-01-01',

    eligibilities: elig ? [{
      status: elig.status,
      startDate: elig.startDate,
      planName: elig.eligiblityRecords.map((r: { desc: string }) => r.desc).join(' → '),
      lineOfBusiness: elig.planType,
    }] : [],
    eligibilityLastUpdated: elig?.startDate ?? '2026-01-01',

    riskTier: 'Tier 3',
    riskLabel: 'Moderate-High',
    riskScore: 71,
    riskScoreMax: 100,
    riskDrivers: [
      { condition: 'COPD Gold III', detail: 'O₂ sat 94%, below 95% goal; 2 exacerbations in past 12 months' },
      { condition: 'Atrial Fibrillation', detail: 'On Apixaban anticoagulation; occasional missed doses reported' },
      { condition: 'Osteoporosis', detail: 'DEXA scan overdue; fall risk elevated with COPD' },
    ],
    riskLastUpdated: '02/14/2026',

    activeMedCount: activeMeds.length,
    keyMedications: activeMeds.slice(0, 6).map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      medicationClass: m.medicationClass,
      prescribedBy: m.prescribedBy,
      startDate: m.startDate,
      dispensedDate: m.dispensedDate ?? '',
    })),
    medsLastUpdated: activeMeds[0]?.lastReconDate ?? '2026-02-01',
    discontinuedMedications: jamesMedications.filter(m => !m.isCurrent && m.endDate).map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      endDate: m.endDate!,
      prescribedBy: m.prescribedBy,
    })),

    recentClaims: recentVisits.slice(0, 5).map(v => ({
      visitType: v.visitType,
      date: v.serviceFrom,
      provider: v.providerName,
      procedureCode: v.procedureCode,
      reasonForVisit: v.reasonForVisit,
    })),
    claimsApproved: Math.max(0, recentVisits.length - 1),
    claimsPending: recentVisits.length > 0 ? 1 : 0,
    claimsDenied: 0,
    claimsTypeBreakdown: (() => {
      const counts: Record<string, number> = {}
      recentVisits.forEach(v => {
        const type = v.visitType.includes('Emergency') ? 'ER'
          : v.visitType.includes('Pharmacy') ? 'Pharmacy'
          : v.visitType.includes('Telehealth') ? 'Telehealth'
          : v.visitType.includes('Inpatient') ? 'Inpatient'
          : v.visitType.includes('Specialist') ? 'Specialist'
          : 'PCP Office Visit'
        counts[type] = (counts[type] ?? 0) + 1
      })
      return Object.entries(counts).map(([type, count]) => ({ type, count }))
    })(),

    conditions: jamesDiagnosis.map(d => ({
      condition: d.condition,
      code: d.diagnosisCode,
      level: d.level,
      isPrimary: d.isPrimaryDiagnosis,
    })),

    openCareGaps: jamesGapsInCare
      .filter(g => g.opportunityStatus === 'Open')
      .map(g => ({ opportunity: g.opportunity, measureCode: g.measureCode, ncqaGrouping: g.ncqaGrouping, measureDescription: g.measureDescription })),

    activeOGIs: [],

    preferredPhone: jamesMemberDetail.phones.find(p => p.isPreferred)?.phoneNumber ?? '',
    bestTimeToCall: jamesMemberDetail.phones.find(p => p.isPreferred)?.bestTimeToCall ?? 'M-F 9-11am',
    communicationImpairments: jamesMemberDetail.communicationImpairments,
    preferredLanguage: jamesMemberDetail.primaryLanguage,
    preferredContactFormat: jamesMemberDetail.preferredContactFormat,

    assessments: [
      {
        name: 'Health Risk Assessment (HRA)',
        lastCompleted: '2026-01-20',
        score: 79,
        scoreLabel: '79/100',
        dueDate: '2027-01-20',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
      {
        name: 'PHQ-9 Depression Screening',
        lastCompleted: '2025-10-15',
        score: 4,
        scoreLabel: 'Minimal (4/27)',
        dueDate: '2026-10-15',
        frequency: 'Annual',
        status: 'Due Soon' as const,
      },
      {
        name: 'SDOH Screening',
        lastCompleted: '2026-01-20',
        score: 2,
        scoreLabel: '2/10',
        dueDate: '2027-01-20',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
    ],

    lastRecordUpdate: recentVisits[0]?.serviceFrom ?? '2026-02-14',
  }
}

function getMarcusPreCallBriefCardData(): PreCallBriefCardData {
  const elig = marcusEligibility.eligibilities[0]
  const activeMeds = marcusMedications.filter(m => m.isCurrent)
  const primaryProgram = marcusPrograms.find(p => p.status === 'Active')

  return {
    memberFirstName: marcusMemberDetail.memberFirstName,

    referralProgram: primaryProgram?.program ?? 'Chronic Disease Management',
    referralBy: primaryProgram?.referralSource ?? 'Care Manager',
    referralDate: primaryProgram?.createdOn ?? '2026-02-01',
    referralLastUpdated: primaryProgram?.updatedOn ?? '2026-02-20',

    eligibilities: elig ? [{
      status: elig.status,
      startDate: elig.startDate,
      planName: elig.eligiblityRecords.map(r => r.desc).join(' → '),
      lineOfBusiness: elig.planType,
    }] : [],
    eligibilityLastUpdated: elig?.startDate ?? '2026-01-01',

    riskTier: 'Tier 2',
    riskLabel: 'Moderate',
    riskScore: 52,
    riskScoreMax: 100,
    riskDrivers: [
      { condition: 'Type 2 Diabetes Mellitus', detail: 'A1C at 7.2%, active monitoring needed' },
      { condition: 'Essential Hypertension', detail: 'Controlled on Amlodipine, home monitoring' },
      { condition: 'Obesity', detail: 'BMI elevated, sedentary work schedule' },
    ],
    riskLastUpdated: '02/20/2026',

    activeMedCount: activeMeds.length,
    keyMedications: activeMeds.map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      medicationClass: m.medicationClass,
      prescribedBy: m.prescribedBy,
      startDate: m.startDate,
      dispensedDate: m.dispensedDate ?? '',
    })),
    medsLastUpdated: '2026-02-20',
    discontinuedMedications: [],

    recentClaims: marcusVisits.slice(0, 3).map(v => ({
      visitType: v.visitType,
      date: v.serviceFrom,
      provider: v.providerName,
      procedureCode: v.procedureCode,
      reasonForVisit: v.reasonForVisit,
    })),
    claimsApproved: 3,
    claimsPending: 0,
    claimsDenied: 0,
    claimsTypeBreakdown: [
      { type: 'PCP Office Visit', count: 2 },
      { type: 'Specialist', count: 1 },
    ],

    conditions: marcusDiagnosis.map(d => ({
      condition: d.condition,
      code: d.diagnosisCode,
      level: d.level,
      isPrimary: d.isPrimaryDiagnosis,
    })),

    openCareGaps: marcusGapsInCare
      .filter(g => g.opportunityStatus === 'Open')
      .map(g => ({ opportunity: g.opportunity, measureCode: g.measureCode, ncqaGrouping: g.ncqaGrouping, measureDescription: g.measureDescription })),

    activeOGIs: [],

    preferredPhone: marcusMemberDetail.phones.find(p => p.isPreferred)?.phoneNumber ?? '415-782-3901',
    bestTimeToCall: marcusMemberDetail.phones.find(p => p.isPreferred)?.bestTimeToCall ?? 'M-F 5pm-7pm',
    communicationImpairments: marcusMemberDetail.communicationImpairments,
    preferredLanguage: marcusMemberDetail.primaryLanguage,
    preferredContactFormat: marcusMemberDetail.preferredContactFormat,

    assessments: [
      {
        name: 'Health Risk Assessment (HRA)',
        lastCompleted: '2026-01-15',
        score: 52,
        scoreLabel: '52/100',
        dueDate: '2027-01-15',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
      {
        name: 'SDOH Screening',
        lastCompleted: '2026-01-15',
        score: 1,
        scoreLabel: '1/10',
        dueDate: '2027-01-15',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
    ],

    lastRecordUpdate: '02/20/2026',
  }
}

function getJacksonPreCallBriefCardData(): PreCallBriefCardData {
  const elig = jacksonEligibility.eligibilities[0]
  const activeMeds = jacksonMedications.filter(m => m.isCurrent)
  const primaryProgram = jacksonPrograms.find(p => p.status === 'Active') ?? jacksonPrograms[0]
  const recentVisits = [...jacksonVisits].sort((a, b) => b.serviceFrom.localeCompare(a.serviceFrom))

  return {
    memberFirstName: jacksonMemberDetail.memberFirstName,

    referralProgram: primaryProgram?.program ?? 'Care Coordination',
    referralBy: primaryProgram?.referralSource ?? 'Care Manager',
    referralDate: primaryProgram?.createdOn ?? '2026-01-01',
    referralLastUpdated: primaryProgram?.updatedOn ?? '2026-01-01',

    eligibilities: elig ? [{
      status: elig.status,
      startDate: elig.startDate,
      planName: elig.eligiblityRecords.map((r: { desc: string }) => r.desc).join(' → '),
      lineOfBusiness: elig.planType,
    }] : [],
    eligibilityLastUpdated: elig?.startDate ?? '2026-01-01',

    riskTier: 'Tier 4',
    riskLabel: 'High',
    riskScore: 82,
    riskScoreMax: 100,
    riskDrivers: [
      { condition: 'Type 2 Diabetes with DKA', detail: 'A1C 9.8%, recent DKA hospitalization 05/2026; now on basal insulin' },
      { condition: 'Essential Hypertension', detail: 'BP 144/92 at last visit, above target (<130/80)' },
      { condition: 'Diabetic Nephropathy (Stage G2)', detail: 'eGFR 68, elevated urine albumin-creatinine ratio' },
      { condition: 'Diabetic Peripheral Neuropathy', detail: 'Bilateral foot numbness, fall risk — podiatry not yet scheduled' },
    ],
    riskLastUpdated: '06/10/2026',

    activeMedCount: activeMeds.length,
    keyMedications: activeMeds.slice(0, 6).map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      medicationClass: m.medicationClass,
      prescribedBy: m.prescribedBy,
      startDate: m.startDate,
      dispensedDate: m.dispensedDate ?? '',
    })),
    medsLastUpdated: activeMeds[0]?.lastReconDate ?? '2026-06-01',
    discontinuedMedications: jacksonMedications.filter(m => !m.isCurrent && m.endDate).map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      endDate: m.endDate!,
      prescribedBy: m.prescribedBy,
    })),

    recentClaims: recentVisits.slice(0, 5).map(v => ({
      visitType: v.visitType,
      date: v.serviceFrom,
      provider: v.providerName,
      procedureCode: v.procedureCode,
      reasonForVisit: v.reasonForVisit,
    })),
    claimsApproved: Math.max(0, recentVisits.length - 1),
    claimsPending: recentVisits.length > 0 ? 1 : 0,
    claimsDenied: 0,
    claimsTypeBreakdown: (() => {
      const counts: Record<string, number> = {}
      recentVisits.forEach(v => {
        const type = v.visitType.includes('Emergency') ? 'ER'
          : v.visitType.includes('Pharmacy') ? 'Pharmacy'
          : v.visitType.includes('Telehealth') ? 'Telehealth'
          : v.visitType.includes('Inpatient') ? 'Inpatient'
          : v.visitType.includes('Specialist') ? 'Specialist'
          : 'PCP Office Visit'
        counts[type] = (counts[type] ?? 0) + 1
      })
      return Object.entries(counts).map(([type, count]) => ({ type, count }))
    })(),

    conditions: jacksonDiagnosis.map(d => ({
      condition: d.condition,
      code: d.diagnosisCode,
      level: d.level,
      isPrimary: d.isPrimaryDiagnosis,
    })),

    openCareGaps: jacksonGapsInCare
      .filter(g => g.opportunityStatus === 'Open')
      .map(g => ({ opportunity: g.opportunity, measureCode: g.measureCode, ncqaGrouping: g.ncqaGrouping, measureDescription: g.measureDescription })),

    activeOGIs: [],

    preferredPhone: jacksonMemberDetail.phones.find(p => p.isPreferred)?.phoneNumber ?? '',
    bestTimeToCall: jacksonMemberDetail.phones.find(p => p.isPreferred)?.bestTimeToCall ?? '',
    communicationImpairments: jacksonMemberDetail.communicationImpairments,
    preferredLanguage: jacksonMemberDetail.primaryLanguage,
    preferredContactFormat: jacksonMemberDetail.preferredContactFormat,

    assessments: [
      {
        name: 'Health Risk Assessment (HRA)',
        lastCompleted: '2026-02-14',
        score: 72,
        scoreLabel: '72/100',
        dueDate: '2027-02-14',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
      {
        name: 'Adult LTSS Reassessment',
        lastCompleted: '2026-01-10',
        score: 68,
        scoreLabel: '68/100',
        dueDate: '2026-07-10',
        frequency: 'Every 6 months',
        status: 'Due' as const,
      },
      {
        name: 'PHQ-9 Depression Screening',
        lastCompleted: '2025-11-20',
        score: 6,
        scoreLabel: 'Mild (6/27)',
        dueDate: '2026-11-20',
        frequency: 'Annual',
        status: 'Due Soon' as const,
      },
      {
        name: 'SDOH Screening',
        lastCompleted: '2025-12-15',
        score: 3,
        scoreLabel: '3/10',
        dueDate: '2026-12-15',
        frequency: 'Annual',
        status: 'Up to Date' as const,
      },
    ],

    lastRecordUpdate: recentVisits[0]?.serviceFrom ?? '2026-06-01',
  }
}

function getMedCardData(mockMemberId: string | undefined): PreCallBriefCardData | null {
  const srcMeds =
    mockMemberId === 'AH58319473' ? jacksonMedications :
    mockMemberId === 'AH60273845' ? jamesMedications :
    mockMemberId === 'AH36582091' ? marcusMedications :
    mockMemberId === 'AH91427634' ? sarahMedications :
    null
  if (!srcMeds) return null
  const active = srcMeds.filter(m => m.isCurrent)
  const discontinued = srcMeds.filter(m => !m.isCurrent && m.endDate)
  return {
    memberFirstName: '',
    referralProgram: '', referralBy: '', referralDate: '', referralLastUpdated: '',
    eligibilities: [], eligibilityLastUpdated: '',
    riskTier: '', riskLabel: '', riskScore: 0, riskScoreMax: 100, riskDrivers: [], riskLastUpdated: '',
    activeMedCount: active.length,
    keyMedications: active.map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      medicationClass: m.medicationClass,
      prescribedBy: m.prescribedBy,
      startDate: m.startDate,
      dispensedDate: m.dispensedDate ?? '',
    })),
    medsLastUpdated: active[0]?.lastReconDate ?? '',
    discontinuedMedications: discontinued.map(m => ({
      name: m.medicationName,
      dosage: m.dosage,
      endDate: m.endDate!,
      prescribedBy: m.prescribedBy,
    })),
    recentClaims: [], claimsApproved: 0, claimsPending: 0, claimsDenied: 0, claimsTypeBreakdown: [],
    conditions: [], openCareGaps: [], activeOGIs: [],
    preferredPhone: '', bestTimeToCall: '', communicationImpairments: [],
    preferredLanguage: '', preferredContactFormat: '', assessments: [], lastRecordUpdate: '',
  }
}

function getCarePlanGoals(mockMemberId: string | undefined) {
  const src =
    mockMemberId === 'AH58319473' ? jacksonCarePlan :
    mockMemberId === 'AH60273845' ? jamesCarePlan :
    mockMemberId === 'AH36582091' ? marcusCarePlan :
    mockMemberId === 'AH91427634' ? sarahCarePlan :
    []
  return src.map(c => ({
    goal: c.goal,
    status: c.status,
    category: c.category,
    targetDate: c.targetDate,
    intervention: c.intervention,
  }))
}

function getCatchMeUpData(mockMemberId: string | undefined, memberFirstName: string): CatchMeUpCardData {
  const lastCallDate = '2026-07-23'

  if (mockMemberId === 'AH60273845') {
    const jamesPreCall = getJamesPreCallBriefCardData()
    // Metformin switched to Empagliflozin — update active meds and discontinued list
    const jamesPreCallWithSwitch = {
      ...jamesPreCall,
      keyMedications: [
        ...jamesPreCall.keyMedications.filter(m => m.name !== 'Metformin'),
        {
          name: 'Empagliflozin',
          dosage: '10mg',
          frequency: 'Once daily',
          medicationClass: 'SGLT2 Inhibitor',
          prescribedBy: 'Dr. Sullivan',
          startDate: '2026-07-25',
          dispensedDate: '2026-07-25',
        },
      ],
      discontinuedMedications: [
        ...jamesPreCall.discontinuedMedications,
        {
          name: 'Metformin',
          dosage: '500mg twice daily',
          endDate: '2026-07-24',
          prescribedBy: 'Dr. Sullivan',
        },
      ],
    }
    return {
      memberFirstName,
      lastCallDate,
      preCallData: jamesPreCallWithSwitch,
      medicationChanges: [
        {
          name: 'Empagliflozin',
          changeType: 'Switched' as const,
          replacedName: 'Metformin',
          stoppedName: 'Metformin',
          date: '2026-07-25',
          notes: 'Switched due to GI intolerance; SGLT2 inhibitor also provides cardiovascular benefit',
        },
      ],
      authorizations: [
        {
          service: 'Pulmonary Rehabilitation — 12 sessions',
          authNumber: 'AUTH-2026-44812',
          status: 'Approved',
          requestedDate: '2026-07-24',
          decisionDate: '2026-07-28',
          validThrough: '2026-10-28',
          requestedBy: 'Dr. Patel — Boston Pulmonary Associates',
          units: '12 sessions',
        },
        {
          service: 'Home Oxygen Therapy (2 L/min continuous)',
          authNumber: 'AUTH-2026-45003',
          status: 'Approved',
          requestedDate: '2026-07-28',
          decisionDate: '2026-07-30',
          validThrough: '2027-01-30',
          requestedBy: 'Dr. Sullivan — UnitedHealthcare Medicare Advantage',
          units: '6-month supply',
        },
        {
          service: 'DEXA Bone Density Scan',
          authNumber: 'AUTH-2026-45217',
          status: 'Pending',
          requestedDate: '2026-08-01',
          decisionDate: '',
          validThrough: '',
          requestedBy: 'Dr. Sullivan — UnitedHealthcare Medicare Advantage',
        },
      ],
      admissions: [
        {
          visitType: 'Inpatient Hospitalization',
          admitDate: '2024-12-05',
          dischargeDate: '2024-12-08',
          lengthOfStay: 3,
          facility: 'Mass General Hospital',
          reason: 'COPD exacerbation with hypoxia — IV steroids, supplemental oxygen',
          diagnosisCode: 'J44.1',
          disposition: 'Discharged to home with O₂',
        },
        {
          visitType: 'Emergency Room',
          admitDate: '2026-07-26',
          dischargeDate: '2026-07-26',
          facility: 'Mass General Hospital — Emergency Department',
          reason: 'COPD exacerbation — treated and released',
          diagnosisCode: 'J44.1',
          disposition: 'Discharged to home',
        },
        {
          visitType: 'Emergency Room',
          admitDate: '2026-07-29',
          dischargeDate: '2026-07-29',
          facility: 'Mass General Hospital — Emergency Department',
          reason: 'Acute dyspnea — O₂ sat 88%; treated with nebulizers and discharged',
          diagnosisCode: 'J44.1',
          disposition: 'Discharged to home',
        },
      ],
      diagnosisChanges: [
        {
          condition: 'Osteoporosis without pathological fracture',
          code: 'M81.0',
          changeType: 'New',
          date: '2026-07-28',
          notes: 'Added following DEXA referral; DEXA scan pending authorization',
        },
        {
          condition: 'COPD with acute exacerbation',
          code: 'J44.1',
          changeType: 'Updated',
          date: '2026-07-23',
          notes: 'Severity reclassified to GOLD III following spirometry on 01/08/2026',
        },
      ],
    }
  }

  if (mockMemberId === 'AH58319473') {
    const jacksonPreCall = getJacksonPreCallBriefCardData()
    // Glipizide discontinued; Insulin Glargine added following DKA hospitalization
    const jacksonPreCallWithChanges = {
      ...jacksonPreCall,
      keyMedications: [
        ...jacksonPreCall.keyMedications.filter(m => m.name !== 'Glipizide'),
        {
          name: 'Insulin Glargine (Basaglar)',
          dosage: '10 units',
          frequency: 'Once daily at bedtime',
          medicationClass: 'Basal Insulin',
          prescribedBy: 'Dr. Patel',
          startDate: '2026-05-21',
          dispensedDate: '2026-07-28',
        },
      ],
      discontinuedMedications: [
        ...jacksonPreCall.discontinuedMedications,
        {
          name: 'Glipizide',
          dosage: '5mg once daily',
          endDate: '2026-05-21',
          prescribedBy: 'Dr. Patel',
        },
      ],
    }
    return {
      memberFirstName,
      lastCallDate,
      preCallData: jacksonPreCallWithChanges,
      medicationChanges: [
        {
          name: 'Insulin Glargine (Basaglar)',
          changeType: 'New' as const,
          date: '2026-05-21',
          notes: 'Started post-DKA hospitalization; Glipizide discontinued',
        },
      ],
      authorizations: [
        {
          service: 'Continuous Glucose Monitor (CGM) — 90-day supply',
          authNumber: 'AUTH-2026-43601',
          status: 'Approved',
          requestedDate: '2026-07-20',
          decisionDate: '2026-07-24',
          validThrough: '2027-01-24',
          requestedBy: 'Dr. Patel — UnitedHealthcare',
          units: '90-day supply',
        },
        {
          service: 'Nephrology Consultation',
          authNumber: 'AUTH-2026-44105',
          status: 'Approved',
          requestedDate: '2026-07-25',
          decisionDate: '2026-07-28',
          validThrough: '2026-10-28',
          requestedBy: 'Dr. Patel — UnitedHealthcare',
        },
        {
          service: 'Basal Insulin (Glargine) — 90-day supply',
          authNumber: 'AUTH-2026-44890',
          status: 'Pending',
          requestedDate: '2026-08-02',
          decisionDate: '',
          validThrough: '',
          requestedBy: 'Dr. Patel — UnitedHealthcare',
          units: '90-day supply',
        },
      ],
      admissions: [
        {
          visitType: 'Emergency Room',
          admitDate: '2025-11-03',
          dischargeDate: '2025-11-03',
          facility: 'UCSF Medical Center — Emergency Department',
          reason: 'Hypoglycemic episode — blood glucose 48 mg/dL; IV dextrose administered',
          diagnosisCode: 'E11.641',
          disposition: 'Discharged to home with medication review follow-up',
        },
        {
          visitType: 'Emergency Room',
          admitDate: '2026-07-25',
          dischargeDate: '2026-07-25',
          facility: 'UCSF Medical Center — Emergency Department',
          reason: 'Hyperglycemia — blood glucose 340 mg/dL; insulin adjustment, IV fluids',
          diagnosisCode: 'E11.65',
          disposition: 'Discharged to home, insulin dose titrated',
        },
        {
          visitType: 'Inpatient Hospitalization',
          admitDate: '2026-07-30',
          dischargeDate: '2026-08-02',
          lengthOfStay: 3,
          facility: 'UCSF Medical Center',
          reason: 'Diabetic ketoacidosis (DKA) — IV fluids, insulin drip, electrolyte correction',
          diagnosisCode: 'E11.10',
          disposition: 'Discharged home, basal insulin dose increased',
        },
      ],
      diagnosisChanges: [
        {
          condition: 'Type 2 Diabetes with Diabetic Ketoacidosis',
          code: 'E11.10',
          changeType: 'New',
          date: '2026-05-18',
          notes: 'DKA diagnosis added following hospitalization 05/18/2026',
        },
        {
          condition: 'Diabetic Nephropathy, Stage G2',
          code: 'E11.65',
          changeType: 'New',
          date: '2026-06-10',
          notes: 'eGFR 68; elevated urine albumin-creatinine ratio; nephrology referral placed',
        },
      ],
    }
  }

  const fallbackData = mockMemberId === 'AH36582091' ? getMarcusPreCallBriefCardData()
    : mockMemberId === 'AH91427634' ? getJamesPreCallBriefCardData()
    : getJamesPreCallBriefCardData()

  return {
    memberFirstName,
    lastCallDate,
    preCallData: fallbackData,
    medicationChanges: [],
    authorizations: [],
    admissions: [],
    diagnosisChanges: [],
  }
}

function postToIframe(data: object) {
  const iframes = document.querySelectorAll('iframe')
  iframes.forEach(f => f.contentWindow?.postMessage(data, '*'))
}

export interface HavenWindowProps {
  memberName?: string
  phone?: string
  memberId?: string
  pcp?: string
  /** Provide to wire a real AI backend; omit to use built-in demo replies */
  onSend?: (value: string) => Promise<string>
  onLearnMore?: () => void
  defaultRight?: number
  defaultBottom?: number
  defaultWidth?: number
  defaultHeight?: number
  /** Member ID used to select the correct mock data set */
  mockMemberId?: string
  /** Whether clinical data is available for this member in Haven */
  hasData?: boolean
  /** Confirmation message shown when the window is first opened after a member switch */
  switchConfirmation?: string
  /** True when the care manager is on the home dashboard (no active member) */
  isHome?: boolean
  age?: string
  gender?: string
  dob?: string
  displayMemberId?: string
  /** Which demo day is active — auto-opens Haven on home view */
  day?: 1 | 4 | 'intake'
}

type WindowState = 'open' | 'minimized' | 'closed'
type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const MIN_W = 360
const MIN_H = 300

export function HavenWindow({
  memberName = 'Henry Tom Garcia',
  phone = '909-851-3064',
  memberId = 'AH58319473',
  pcp = 'Ambetter',
  onSend,
  defaultRight = 24,
  defaultBottom = 118,
  defaultWidth = 500,
  defaultHeight = 657,
  mockMemberId = 'AH58319473',
  hasData = true,
  switchConfirmation,
  isHome = false,
  age = '',
  gender = '',
  dob = '',
  displayMemberId,
  day = 1 as 1 | 4 | 'intake',
}: HavenWindowProps) {
  const [winState, setWinState] = useState<WindowState>('closed')
  const [menuOpen, setMenuOpen] = useState(false)
  const [summarizeMenuOpen, setSummarizeMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [complianceMenuOpen, setComplianceMenuOpen] = useState(false)
  const [documentMenuOpen, setDocumentMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [memberChatOpen, setMemberChatOpen] = useState(false)
  const [sukiOpen, setSukiOpen] = useState(false)
  const [fabExpanded, setFabExpanded] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)
  const [sukiActionsReady, setSukiActionsReady] = useState(false)
  const [callInsightsOpen, setCallInsightsOpen] = useState(false)
  const [liveAlerts, setLiveAlerts] = useState<SukiAlert[]>([])
  const [alertTaskLabels, setAlertTaskLabels] = useState<Record<string, string[]>>({})
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)
  const [alertTaskView, setAlertTaskView] = useState<string | null>(null) // alert id in task-list view
  const [addedAlertTasks, setAddedAlertTasks] = useState<Set<string>>(new Set())
  const [doneAlertTasks, setDoneAlertTasks] = useState<Set<string>>(new Set())
  const [openAlertModal, setOpenAlertModal] = useState<{ alertId: string; taskIdx: number; task: string } | null>(null)

  const medicationBriefData = useMemo(() => {
    if (mockMemberId === 'AH58319473') return getJacksonPreCallBriefCardData()
    if (mockMemberId === 'AH72940158' || mockMemberId === 'AH36582091') return getMarcusPreCallBriefCardData()
    return undefined
  }, [mockMemberId])

  const { getSessionsForMember, saveSession, deleteSession, toggleFavorite, clearAllForMember } = useChatHistory()
  const [historyVersion, setHistoryVersion] = useState(0)
  const refreshHistory = () => setHistoryVersion(v => v + 1)
  const historySessions = useMemo(() => getSessionsForMember(memberId), [getSessionsForMember, memberId, historyVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refs so the unmount cleanup can read the latest values without stale closures
  const messagesRef = useRef<Message[]>([])
  const memberIdRef = useRef(memberId)
  const memberNameRef = useRef(memberName)
  const saveSessionRef = useRef(saveSession)
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { memberIdRef.current = memberId }, [memberId])
  useEffect(() => { memberNameRef.current = memberName }, [memberName])
  useEffect(() => { saveSessionRef.current = saveSession }, [saveSession])

  // Save session when member switches (component unmounts due to key change in App)
  useEffect(() => {
    return () => {
      saveSessionRef.current(memberIdRef.current, memberNameRef.current, messagesRef.current)
    }
  }, [])

  const [pos, setPos] = useState({ left: 0, top: 0 })
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight })
  const [posReady, setPosReady] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const preMaximizeRef = useRef<{ pos: { left: number; top: number }; size: { w: number; h: number } } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  // Set to true on unmount so any in-progress async response is discarded (member switched)
  const cancelledRef = useRef(false)
  // Prevents showing the open-time message more than once per member instance
  const openMsgShownRef = useRef(false)
  // Saved window state - restored when FAB is re-expanded
  const savedFabStateRef = useRef<{ winState: WindowState; memberChatOpen: boolean; sukiOpen: boolean } | null>(null)

  useEffect(() => {
    setPos({
      left: window.innerWidth - defaultRight - defaultWidth,
      top: window.innerHeight - defaultBottom - defaultHeight,
    })
    setPosReady(true)
    cancelledRef.current = false
    // On unmount (member switch), cancel any in-flight response
    return () => { cancelledRef.current = true }
  }, [defaultBottom, defaultRight, defaultWidth, defaultHeight])

  /* ── Show confirmation or no-data message on first open ── */
  useEffect(() => {
    if (winState !== 'open' || openMsgShownRef.current) return
    openMsgShownRef.current = true

    if (!hasData) {
      // Restricted member: surface a clear no-data message, enforce restricted context
      setMessages([{
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: `No clinical data is currently available for ${memberName} in Haven.\n\nPlease verify the member's record in GuidingCare before proceeding. Haven cannot answer clinical questions for this member until their data is available in the system.`,
        isError: true,
      }])
    } else if (switchConfirmation) {
      // Acknowledge the member switch
      setMessages([{
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: switchConfirmation,
      }])
    }
  }, [winState, hasData, memberName, switchConfirmation])

  /* ── Learn more ── */
  const handleLearnMore = useCallback(() => {
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: 'What does Haven have access to?' }
    const replyMsg: Message = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: `**I have access to:**\n• Member demographics\n• Clinical history\n• Care plan (goals, interventions)\n• Assessments\n• Eligibility\n• Care gaps\n• Claims data\n\n**I cannot help with:**\n• Clinical decisions or diagnosis\n• Systems outside this platform\n• Guaranteed accurate information, always verify yourself`,
    }
    setMessages(prev => [...prev, userMsg, replyMsg])
    setMenuOpen(false)
    setSummarizeMenuOpen(false)
    setComplianceMenuOpen(false)
    setDocumentMenuOpen(false)
    setLearnMoreOpen(true)
  }, [])

  /* ── Send a message ── */
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    cancelledRef.current = false

    // No-data members: block queries and surface a clear message
    if (!hasData) {
      setMessages(prev => [...prev,
        { id: `u-${Date.now()}`, role: 'user', content: trimmed },
        {
          id: `a-${Date.now() + 1}`,
          role: 'assistant',
          content: `Haven does not have clinical data available for ${memberName}. Questions about this member cannot be answered until their record is available in the system.`,
          isError: true,
        },
      ])
      return
    }

    // If user says "yes", resolve against the last assistant message's follow-up query
    const isYes = /^yes[.!]?\s*$/i.test(trimmed)
    const lastFollowUpQuery = isYes
      ? [...messages].reverse().find(m => m.role === 'assistant' && m.followUpQuery)?.followUpQuery
      : undefined
    const resolvedText = lastFollowUpQuery ?? trimmed

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed }

    // Real backend: show typing indicator while awaiting the network call
    if (onSend) {
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      setLoading(true)
      try {
        const reply = await onSend(resolvedText)
        if (cancelledRef.current) return
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          followUp: getFollowUp(resolvedText),
          followUpQuery: getFollowUpQuery(resolvedText),
        }])
      } finally {
        if (!cancelledRef.current) setLoading(false)
      }
      return
    }

    // Medication list - early return with MedicationsOverviewCard
    if (/medication list|current medication|list.*medication|medication.*list/i.test(resolvedText)) {
      const cardData = getMedCardData(mockMemberId)
      if (cardData) {
        const firstName = memberName.split(' ')[0]
        setMessages(prev => [...prev, userMsg])
        setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 400))
        setLoading(false)
        if (cancelledRef.current) return
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant' as const,
          content: `Here's ${firstName}'s current medication list.`,
          medicationCard: cardData,
        }])
        return
      }
    }

    // Last update - early return with card
    if (/help me with admin/i.test(resolvedText)) {
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: 'What do you need?',
        followUpChips: [
          { label: 'URAC & NCQA compliance checklists', query: 'Show me compliance checklists' },
          { label: 'Handoff summary',                   query: 'Show me a handoff summary' },
          { label: 'Help with closing this case',       query: 'Can you help me close out this case' },
        ],
      }])
      return
    }

    if (/show me the last update/i.test(resolvedText)) {
      const lastUpdate = getLastUpdateData(memberName, mockMemberId)
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant' as const, content: '', lastUpdate }])
      return
    }

    // URAC checklist - fire adminChecklist
    if (resolvedText.toLowerCase().includes('urac')) {
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here are the compliance checklists for ${firstName}. Items already completed are checked off.`,
        adminChecklist: { memberId: mockMemberId },
      }])
      return
    }

    // Case closure checklist
    if (/close.*case|help.*close|case.*clos/i.test(resolvedText)) {
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1200))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `You have certain URAC/NCQA questions that are missing for ${firstName}. Please review and complete the checklist below before closing this case.`,
        adminChecklist: { memberId: mockMemberId },
      }])
      return
    }

    // Compliance checklists
    if (/compliance checklist|show me compliance checklist|compliance audit|show me a compliance/i.test(resolvedText)) {
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here are the compliance checklists for ${firstName}'s record. Items already verified are checked off.`,
        adminChecklist: { memberId: mockMemberId },
      }])
      return
    }

    // Handoff summary card
    if (/handoff summary|show me a handoff/i.test(resolvedText)) {
      const firstName = memberName.split(' ')[0]
      const cardData = mockMemberId === 'AH60273845' ? getJamesPreCallBriefCardData()
        : mockMemberId === 'AH36582091' ? getMarcusPreCallBriefCardData()
        : getJacksonPreCallBriefCardData()
      const goals = getCarePlanGoals(mockMemberId)
      const carePlanItems = mockMemberId === 'AH60273845' ? jamesCarePlan
        : mockMemberId === 'AH36582091' ? marcusCarePlan
        : mockMemberId === 'AH91427634' ? sarahCarePlan
        : jacksonCarePlan
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here's a full handoff summary for ${firstName}. Review the Needs Attention items first.`,
        handoffCard: { data: cardData, goals, carePlanItems },
      }])
      return
    }

    // Care plan summary - early return with interactive card
    const isCarePlanReview = /review.*care plan|care plan.*review|review.*member.*care|review.*current.*care/i.test(resolvedText)
    if (isCarePlanReview) {
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg, {
        id: `a-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: `Here's a summary of ${firstName}'s current plan of care. You can update status, priority, and target dates inline.`,
        carePlanSummary: true,
        followUp: 'What would you like to do next?',
        followUpChips: [
          { label: 'Help me make a SMART goal', query: 'Help me make a SMART goal for the member' },
          { label: 'Print this plan', query: 'Print plan', inlineRow: true },
          { label: 'Schedule a follow-up call', query: 'Schedule follow-up', inlineRow: true },
        ],
      }])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      return
    }

    // SMART goal - early return with interactive card
    const smartGoalData = resolvedText.toLowerCase().includes('smart goal')
      ? mockMemberId === 'AH58319473' ? JACKSON_SMART_GOAL
      : mockMemberId === 'AH72940158' ? MARIA_SMART_GOAL
      : mockMemberId === 'AH60273845' ? JAMES_SMART_GOAL
      : null
      : null
    if (smartGoalData) {
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg, {
        id: `a-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: `Here's a SMART goal based on ${firstName}'s current care plan. Review and edit each field, then add to the care plan.`,
        smartGoal: smartGoalData,
      }])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      return
    }

    // "Prepare me for a member call" — 3-chip follow-up (Jackson Thomas + James O'Connor)
    if ((mockMemberId === 'AH58319473' || mockMemberId === 'AH60273845') && /^prepare me for a member call$/i.test(resolvedText.trim())) {
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Is this your first outreach, an intake or a follow-up call?',
        followUpChips: [
          { label: 'First outreach', query: 'Prepare me for a first outreach call' },
          { label: 'Intake', query: 'Prepare me for an intake call' },
          { label: 'Follow-up call', query: 'Prepare me for a follow-up call' },
        ],
      }])
      return
    }

    // Pre-call brief card - Jackson Thomas or James O'Connor first outreach
    if ((mockMemberId === 'AH58319473' || mockMemberId === 'AH60273845') && /prepare.*first outreach|prepare.*outreach call|first outreach/i.test(resolvedText)) {
      const firstName = memberName.split(' ')[0]
      const data = mockMemberId === 'AH60273845' ? getJamesPreCallBriefCardData() : getJacksonPreCallBriefCardData()
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here's a summary of what you might need for a first outreach call with ${firstName}.`,
        preCallBriefCard: data,
        followUp: 'Would you like to see more information? I can pull up care plan overview, care gaps overview, assessments overview.',
        followUpChips: [
          { label: 'Care plan overview',    query: 'Show me care plan overview',    inlineRow: true },
          { label: 'Care gaps overview',    query: 'What are the open care gaps?',  inlineRow: true },
          { label: 'Assessments overview',  query: 'Show me assessments overview',  inlineRow: true },
        ],
      }])
      return
    }

    // Pre-call brief card - Marcus Webb first outreach
    if (mockMemberId === 'AH36582091' && /prepare.*call|pre.?call brief|first outreach|member call/i.test(resolvedText)) {
      const data = getMarcusPreCallBriefCardData()
      // When triggered from the welcome screen (no prior messages), inject the
      // "Would you like to prep for a call?" → "Yes" exchange so the full
      // conversation is visible once the welcome view is replaced by ChatMessages.
      const isFromWelcome = messages.length === 0
      const prefixMsgs: Message[] = isFromWelcome ? [
        {
          id: `a-welcome-prep`,
          role: 'assistant' as const,
          content: 'Would you like to review more information or prep for a call?',
        },
        {
          id: `u-welcome-yes`,
          role: 'user' as const,
          content: 'Prep me for a call',
        },
      ] : [userMsg]
      setMessages(prev => [...prev, ...prefixMsgs])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here's a summary of what you might need for a first outreach call with Marcus.`,
        preCallBriefCard: data,
        followUp: 'Would you like to see more information? I can pull up care plan overview, care gaps overview, assessments overview.',
        followUpChips: [
          { label: 'Care plan overview',    query: 'Show me care plan overview',    inlineRow: true },
          { label: 'Care gaps overview',    query: 'What are the open care gaps?',  inlineRow: true },
          { label: 'Assessments overview',  query: 'Show me assessments overview',  inlineRow: true },
        ],
      }])
      return
    }

    // Intake call card
    if (/prepare.*intake call|intake call/i.test(resolvedText)) {
      const cardData = mockMemberId === 'AH60273845' ? getJamesPreCallBriefCardData()
        : mockMemberId === 'AH36582091' ? getMarcusPreCallBriefCardData()
        : getJacksonPreCallBriefCardData()
      const goals = getCarePlanGoals(mockMemberId)
      const carePlanItems = mockMemberId === 'AH60273845' ? jamesCarePlan
        : mockMemberId === 'AH36582091' ? marcusCarePlan
        : mockMemberId === 'AH91427634' ? sarahCarePlan
        : jacksonCarePlan
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here's what you need for ${firstName}'s intake call — eligibility, referral, risk, conditions, medications, and open care gaps.`,
        intakeCallCard: { data: cardData, goals, carePlanItems },
        followUpChips: [
          { label: 'Full medication list', query: "What is this member's current medication list?", inlineRow: true },
          { label: 'Care gaps',            query: 'What are the open care gaps?',                  inlineRow: true },
          { label: 'Help me make a SMART goal', query: 'Help me make a SMART goal for the member', inlineRow: true },
        ],
      }])
      return
    }

    // Follow-up call card
    if (/prepare.*follow.?up call|follow.?up call/i.test(resolvedText)) {
      const cardData = mockMemberId === 'AH60273845' ? getJamesPreCallBriefCardData()
        : mockMemberId === 'AH36582091' ? getMarcusPreCallBriefCardData()
        : getJacksonPreCallBriefCardData()
      const goals = getCarePlanGoals(mockMemberId)
      const carePlanItems = mockMemberId === 'AH60273845' ? jamesCarePlan
        : mockMemberId === 'AH36582091' ? marcusCarePlan
        : mockMemberId === 'AH91427634' ? sarahCarePlan
        : jacksonCarePlan
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `Here's a progress snapshot for ${firstName}'s follow-up call — risk, active goals, medications, open gaps, and recent claims.`,
        followUpCallCard: { data: cardData, goals, carePlanItems },
        followUpChips: [
          { label: 'Review care plan',          query: "Review member's current care plan",         inlineRow: true },
          { label: 'Full medication list',       query: "What is this member's current medication list?", inlineRow: true },
          { label: 'Help me make a SMART goal', query: 'Help me make a SMART goal for the member', inlineRow: true },
        ],
      }])
      return
    }

    // Catch me up — show changes since last call
    if (/catch me up|catch.*up on member/i.test(resolvedText)) {
      const firstName = memberName.split(' ')[0]
      const catchUpData = getCatchMeUpData(mockMemberId, firstName)
      const lastCallFmt = new Date(catchUpData.lastCallDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      const changeParts: string[] = []
      const medChanges = catchUpData.medicationChanges.length
      if (medChanges > 0) changeParts.push(`${medChanges} medication change${medChanges > 1 ? 's' : ''}`)
      const newClaims = catchUpData.preCallData.recentClaims.filter(c => c.date >= catchUpData.lastCallDate).length
      if (newClaims > 0) changeParts.push(`${newClaims} new claim${newClaims > 1 ? 's' : ''}`)
      const pendingAuth = catchUpData.authorizations.filter(a => a.status === 'Pending').length
      const approvedAuth = catchUpData.authorizations.filter(a => a.status === 'Approved').length
      if (approvedAuth > 0) changeParts.push(`${approvedAuth} new authorization${approvedAuth > 1 ? 's' : ''} approved`)
      if (pendingAuth > 0) changeParts.push(`${pendingAuth} authorization${pendingAuth > 1 ? 's' : ''} pending`)
      const newAdmissions = catchUpData.admissions.filter(a => a.admitDate >= catchUpData.lastCallDate).length
      if (newAdmissions > 0) changeParts.push(`${newAdmissions} new admission${newAdmissions > 1 ? 's' : ''} or ER visit${newAdmissions > 1 ? 's' : ''}`)
      if (catchUpData.diagnosisChanges.length > 0) changeParts.push(`${catchUpData.diagnosisChanges.length} diagnosis change${catchUpData.diagnosisChanges.length > 1 ? 's' : ''}`)
      const summaryLine = changeParts.length > 0
        ? `Since your last call on ${lastCallFmt}, there have been ${changeParts.join(', ')}.`
        : `No changes recorded since your last call with ${firstName} on ${lastCallFmt}.`
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false); setSummarizeMenuOpen(false); setMoreMenuOpen(false); setComplianceMenuOpen(false); setDocumentMenuOpen(false); setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: summaryLine,
        catchMeUpCard: catchUpData,
      }])
      return
    }

    // Care gaps - append follow-up chips to add each open gap to the care plan
    const isCareGapsQuery = /missing care gap|care gap|gaps in care|open gap/i.test(resolvedText)
    if (isCareGapsQuery) {
      const replyContent = getMockReply(resolvedText, memberName, mockMemberId)
      const openGaps = getOpenCareGaps(mockMemberId).slice(0, 3)
      const chips: FollowUpChip[] = openGaps.map(gap => ({
        label: `Add "${gap.opportunity}" to care plan`,
        query: `__ADD_CARE_GAP__${JSON.stringify({ opportunity: gap.opportunity, goal: gap.goal, category: gap.category })}`,
      }))
      setMessages(prev => [...prev, userMsg])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoading(false)
      if (cancelledRef.current) return
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: replyContent,
        followUpChips: chips,
      }])
      return
    }

    // Add gap to care plan - post to CWF and confirm
    if (resolvedText.startsWith('__ADD_CARE_GAP__')) {
      const gap = JSON.parse(resolvedText.slice('__ADD_CARE_GAP__'.length)) as { opportunity: string; goal: string; category: string }
      const firstName = memberName.split(' ')[0]
      setMessages(prev => [...prev, { ...userMsg, content: `Add "${gap.opportunity}" to care plan` }])
      setMenuOpen(false)
      setSummarizeMenuOpen(false)
      setComplianceMenuOpen(false)
      setDocumentMenuOpen(false)
      setLearnMoreOpen(false)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoading(false)
      if (cancelledRef.current) return
      postToIframe({ type: 'HAVEN_ADD_CARE_GAP', opportunity: gap.opportunity, goal: gap.goal, category: gap.category })
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant' as const,
        content: `"${gap.opportunity}" has been added to ${firstName}'s care plan.`,
      }])
      return
    }

    // Mock path: show typing indicator briefly before resolving
    const guardrail = getGuardrailMessage(resolvedText)
    const replyContent = guardrail ?? getMockReply(resolvedText, memberName, mockMemberId)
    setMessages(prev => [...prev, userMsg])
    setMenuOpen(false)
    setSummarizeMenuOpen(false)
    setComplianceMenuOpen(false)
    setDocumentMenuOpen(false)
    setLearnMoreOpen(false)
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 400))
    setLoading(false)
    if (cancelledRef.current) return
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: replyContent,
      followUp: guardrail ? undefined : getFollowUp(resolvedText),
      followUpQuery: guardrail ? undefined : getFollowUpQuery(resolvedText),
    }])
  }, [loading, hasData, memberName, memberId, mockMemberId, onSend, messages])

  /* ── Geometry ref — single source of truth during gestures ── */
  // Mutate only the ref + write directly to DOM during drag/resize; commit to state on pointerup.
  const geo = useRef({ left: 0, top: 0, w: defaultWidth, h: defaultHeight })

  useLayoutEffect(() => { geo.current.left = pos.left; geo.current.top = pos.top }, [pos])
  useLayoutEffect(() => { geo.current.w = size.w; geo.current.h = size.h }, [size])

  const applyPos = useCallback(() => {
    const el = windowRef.current
    if (!el) return
    el.style.transform = `translate(${geo.current.left}px,${geo.current.top}px)`
  }, [])

  const applyGeo = useCallback((minimized: boolean, maximized: boolean) => {
    const el = windowRef.current
    if (!el) return
    if (maximized) {
      el.style.transform = 'translate(0px,0px)'
      el.style.width     = '100vw'
      el.style.height    = '100vh'
    } else {
      el.style.transform = `translate(${geo.current.left}px,${geo.current.top}px)`
      el.style.width     = `${geo.current.w}px`
      el.style.height    = minimized ? '28px' : `${geo.current.h}px`
    }
  }, [])

  useLayoutEffect(() => { applyGeo(winState === 'minimized', isMaximized) })

  /* Clamp back into viewport on browser resize */
  useEffect(() => {
    const onResize = () => {
      setPos(p => ({
        left: Math.max(0, Math.min(window.innerWidth  - geo.current.w, p.left)),
        top:  Math.max(0, Math.min(window.innerHeight - 28, p.top)),
      }))
      setSize(s => ({
        w: Math.min(s.w, window.innerWidth),
        h: Math.min(s.h, window.innerHeight - 28),
      }))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ── Drag ── */
  const dragState = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const d = dragState.current
      if (!d || !windowRef.current) return
      const maxLeft = window.innerWidth  - geo.current.w
      const maxTop  = window.innerHeight - 28
      geo.current.left = Math.max(0, Math.min(maxLeft, d.startLeft + (e.clientX - d.startX)))
      geo.current.top  = Math.max(0, Math.min(maxTop,  d.startTop  + (e.clientY - d.startY)))
      applyPos()
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!dragState.current) return
      const d = dragState.current
      dragState.current = null
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      const maxLeft = window.innerWidth  - geo.current.w
      const maxTop  = window.innerHeight - 28
      setPos({
        left: Math.max(0, Math.min(maxLeft, d.startLeft + (e.clientX - d.startX))),
        top:  Math.max(0, Math.min(maxTop,  d.startTop  + (e.clientY - d.startY))),
      })
    }
    document.addEventListener('pointermove', onMouseMove)
    document.addEventListener('pointerup',   onMouseUp)
    return () => {
      document.removeEventListener('pointermove', onMouseMove)
      document.removeEventListener('pointerup',   onMouseUp)
    }
  }, [applyPos])

  /* ── Resize ── */
  const resizeState = useRef<{
    dir: ResizeDir
    startX: number; startY: number
    startLeft: number; startTop: number
    startW: number; startH: number
  } | null>(null)

  const onResizeMouseDown = useCallback((dir: ResizeDir) => (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    resizeState.current = {
      dir,
      startX: e.clientX, startY: e.clientY,
      startLeft: geo.current.left, startTop: geo.current.top,
      startW: geo.current.w,       startH: geo.current.h,
    }
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const calcResize = (clientX: number, clientY: number) => {
      const r = resizeState.current
      if (!r) return null
      const dx = clientX - r.startX
      const dy = clientY - r.startY
      let newLeft = r.startLeft, newTop = r.startTop, newW = r.startW, newH = r.startH
      if (r.dir.includes('e')) {
        newW = Math.max(MIN_W, Math.min(r.startW + dx, window.innerWidth - r.startLeft))
      }
      if (r.dir.includes('s')) {
        newH = Math.max(MIN_H, Math.min(r.startH + dy, window.innerHeight - 28 - r.startTop))
      }
      if (r.dir.includes('w')) {
        const rawW = r.startW - dx
        newW    = Math.max(MIN_W, rawW)
        newLeft = Math.max(0, r.startLeft + r.startW - newW)
        newW    = r.startLeft + r.startW - newLeft
      }
      if (r.dir.includes('n')) {
        const rawH = r.startH - dy
        newH    = Math.max(MIN_H, rawH)
        newTop  = Math.max(0, r.startTop + r.startH - newH)
        newH    = r.startTop + r.startH - newTop
      }
      return { newLeft, newTop, newW, newH }
    }

    const onMouseMove = (e: MouseEvent) => {
      const v = calcResize(e.clientX, e.clientY)
      if (!v || !windowRef.current) return
      geo.current.left = v.newLeft
      geo.current.top  = v.newTop
      geo.current.w    = v.newW
      geo.current.h    = v.newH
      const el = windowRef.current
      el.style.transform = `translate(${v.newLeft}px,${v.newTop}px)`
      el.style.width     = `${v.newW}px`
      el.style.height    = `${v.newH}px`
    }
    const onMouseUp = (e: MouseEvent) => {
      const v = calcResize(e.clientX, e.clientY)
      resizeState.current = null
      document.body.style.userSelect = ''
      if (v) {
        setPos({ left: v.newLeft, top: v.newTop })
        setSize({ w: v.newW, h: v.newH })
      }
    }
    document.addEventListener('pointermove', onMouseMove)
    document.addEventListener('pointerup',   onMouseUp)
    return () => {
      document.removeEventListener('pointermove', onMouseMove)
      document.removeEventListener('pointerup',   onMouseUp)
    }
  }, [])

  /* ── Window controls ── */
  const handleClose = () => {
    saveSession(memberId, memberName, messages)
    setWinState('closed')
    setMenuOpen(false)
    setSummarizeMenuOpen(false)
    setComplianceMenuOpen(false)
    setDocumentMenuOpen(false)
    setMessages([])
  }
  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      if (preMaximizeRef.current) {
        setPos(preMaximizeRef.current.pos)
        setSize(preMaximizeRef.current.size)
      }
      setIsMaximized(false)
    } else {
      preMaximizeRef.current = { pos: { ...pos }, size: { ...size } }
      setPos({ left: 0, top: 0 })
      setSize({ w: window.innerWidth, h: window.innerHeight })
      setIsMaximized(true)
      if (winState === 'minimized') setWinState('open')
    }
  }, [isMaximized, pos, size, winState])
  const handleMaximize = toggleMaximize
  const handleMinimize = () => {
    if (isMaximized) toggleMaximize()
    setWinState(s => s === 'minimized' ? 'open' : 'minimized')
  }

  const onChromeMouseDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (isMaximized) return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragState.current = {
      startX: e.clientX, startY: e.clientY,
      startLeft: geo.current.left, startTop: geo.current.top,
    }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [isMaximized])

  const onChromeDoubleClick = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    toggleMaximize()
  }, [toggleMaximize])

  const openWindow = useCallback(() => {
    setPos({ left: window.innerWidth - defaultRight - defaultWidth, top: window.innerHeight - defaultBottom - defaultHeight })
    setPosReady(true)
    setWinState('open')
  }, [defaultRight, defaultWidth, defaultBottom, defaultHeight])

  const openMemberChat = useCallback(() => {
    setMemberChatOpen(true)
  }, [])

  const handleActivityAdded = useCallback((config: ActivityConfig, _destination: 'activities' | 'care-plan') => {
    postToIframe({ type: 'HAVEN_ADD_ACTIVITY', activityType: config.activityType, contactType: config.contactType })
  }, [])

  // Bottom edge of the Haven window (px from viewport top) - used to align MemberChatWindow
  const havenBottomY = posReady
    ? pos.top + size.h
    : window.innerHeight - defaultBottom

  const memberChat = !isHome && memberChatOpen ? (
    <MemberChatWindow
      memberName={memberName}
      memberKey={memberId}
      onClose={() => setMemberChatOpen(false)}
      havenBottomY={havenBottomY}
      zIndex={sukiOpen ? 800 : undefined}
    />
  ) : null

  /* ── FAB minimize / expand ── */
  const minimizeFab = useCallback(() => {
    savedFabStateRef.current = { winState, memberChatOpen, sukiOpen }
    setWinState('closed')
    setMemberChatOpen(false)
    setSukiOpen(false)
    setFabExpanded(false)
  }, [winState, memberChatOpen, sukiOpen])

  const expandFab = useCallback(() => {
    if (savedFabStateRef.current) {
      const { winState: sw, memberChatOpen: sm, sukiOpen: ss } = savedFabStateRef.current
      setWinState(sw)
      setMemberChatOpen(sm)
      setSukiOpen(ss)
    }
    setFabExpanded(true)
  }, [])

  // ── FAB - always rendered ──
  const fabStyle: React.CSSProperties = sukiOpen ? { zIndex: 800 } : {}

  const fab = isHome ? (
    <div className={styles.fabCard}>
      <button className={winState === 'closed' ? styles.fabHavenFilled : styles.fabHaven} onClick={openWindow} type="button" aria-label="Open Haven AI assistant">
        <Icon name="AutoAwesome" size="md" color={winState === 'closed' ? 'inverse' : 'primary'} />
        Haven
      </button>
    </div>
  ) : !fabExpanded ? (
    <button
      className={styles.fabMinimized}
      style={fabStyle}
      onClick={expandFab}
      type="button"
      aria-label="Expand"
    >
      <img src={chevronForwardIcon} width={29} height={29} alt="" aria-hidden="true" className={styles.fabChevronMin} style={{ transform: 'rotate(180deg)' }} />
    </button>
  ) : (
    <div className={styles.fabCard} style={fabStyle}>
      <button
        className={styles.fabChevronBtn}
        onClick={minimizeFab}
        type="button"
        aria-label="Minimize"
      >
        <img src={chevronForwardIcon} width={29} height={29} alt="" aria-hidden="true" className={styles.fabChevron} />
      </button>
      <div className={styles.fabDivider} />
      <button className={styles.fabMember} onClick={openMemberChat} type="button" aria-label={`Message ${memberName}`}>
        <img src={chatIcon} width={33} height={33} alt="" aria-hidden="true" />
        <span className={styles.fabMemberName}>{memberName}</span>
      </button>
      <div className={styles.fabDivider} />
      <button className={winState === 'closed' ? styles.fabHavenFilled : styles.fabHaven} onClick={openWindow} type="button" aria-label="Open Haven AI assistant">
        <Icon name="AutoAwesome" size="md" color={winState === 'closed' ? 'inverse' : 'primary'} />
        Haven
      </button>
    </div>
  )

  const sukiNode = sukiOpen && !isHome ? (
    <SukiWindow
      onClose={() => { setSukiOpen(false); setAlertTaskLabels({}); setExpandedAlertId(null) }}
      onNoteSent={(summaryText) => {
        setSukiOpen(false)
        openMsgShownRef.current = true
        setWinState('open')
        const alertsSnapshot = liveAlerts.slice()
        setLiveAlerts([])
        setMessages(prev => [
          ...prev,
          {
            id: `suki-summary-${Date.now()}`,
            role: 'assistant' as const,
            content: summaryText,
            isCallSummary: true,
            callAlerts: alertsSnapshot,
            showCallInsightsCard: true,
          },
        ])
      }}
      onAlert={(alert) => {
        setLiveAlerts(prev => prev.some(a => a.id === alert.id) ? prev : [...prev, alert])
      }}
      memberName={memberName}
      memberId={displayMemberId ?? memberId}
      memberKey={memberId}
      phone={phone}
      pcp={pcp}
      age={age}
      gender={gender}
      dob={dob}
      havenLeft={posReady ? pos.left : window.innerWidth - defaultRight - defaultWidth}
      havenTop={posReady ? pos.top : window.innerHeight - defaultBottom - defaultHeight}
    />
  ) : null

  if (winState === 'closed') {
    return (
      <>
        {memberChat}
        {fab}
        {sukiNode}
      </>
    )
  }

  const isMinimized = winState === 'minimized'
  // Geometry is owned by applyGeo() via useLayoutEffect — only carry non-geometry props here.
  const windowStyle: React.CSSProperties = isMaximized
    ? { borderRadius: 0, boxShadow: 'none', zIndex: sukiOpen ? 800 : 900 }
    : { ...(sukiOpen ? { zIndex: 800, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, transition: 'border-radius 0.18s ease' } : { transition: 'border-radius 0.18s ease' }) }

  const hasMessages = messages.length > 0 || loading

  return (
    <>
    {memberChat}
    {fab}
    {sukiNode}
    <div ref={windowRef} className={styles.window} style={windowStyle} role="dialog" aria-label="Haven AI assistant" aria-modal="false">
      {/* Resize handles */}
      {!isMinimized && !isMaximized && (
        <>
          <div className={styles.resizeN}  onPointerDown={onResizeMouseDown('n')}  />
          <div className={styles.resizeS}  onPointerDown={onResizeMouseDown('s')}  />
          <div className={styles.resizeE}  onPointerDown={onResizeMouseDown('e')}  />
          <div className={styles.resizeW}  onPointerDown={onResizeMouseDown('w')}  />
          <div className={styles.resizeNE} onPointerDown={onResizeMouseDown('ne')} />
          <div className={styles.resizeNW} onPointerDown={onResizeMouseDown('nw')} />
          <div className={styles.resizeSE} onPointerDown={onResizeMouseDown('se')} />
          <div className={styles.resizeSW} onPointerDown={onResizeMouseDown('sw')} />
        </>
      )}

      {/* Chrome bar */}
      <div className={styles.chrome} onPointerDown={onChromeMouseDown} onDoubleClick={onChromeDoubleClick}>
        <div className={styles.trafficLights}>
          <button className={`${styles.trafficBtn} ${styles.btnClose}`}  onClick={handleClose}    type="button" aria-label="Close"    title="Close"    />
          <button className={`${styles.trafficBtn} ${styles.btnMin}`}    onClick={handleMinimize} type="button" aria-label={isMinimized ? 'Restore' : 'Minimize'} title={isMinimized ? 'Restore' : 'Minimize'} />
          <button className={`${styles.trafficBtn} ${styles.btnMax}`}    onClick={handleMaximize} type="button" aria-label="Maximize"  title="Maximize"  />
        </div>
        <span className={styles.chromeTitle}>Haven</span>
      </div>

      {/* Window body */}
      {!isMinimized && (
        <div className={styles.body}>
          {isHome
            ? <DashboardHeader onPresetsClick={() => { setPresetsOpen(o => !o); setHistoryOpen(false) }} onHistoryClick={() => { setHistoryOpen(o => !o); setPresetsOpen(false) }} onClose={handleClose} />
            : <MemberHeader memberName={memberName} phone={phone} memberId={displayMemberId ?? memberId} pcp={pcp} onSukiClick={() => setSukiOpen(true)} onPresetsClick={() => setPresetsOpen(true)} onHistoryClick={() => setHistoryOpen(true)} onClose={handleClose} />
          }

          <div className={panelStyles.chatArea}>
            {/* Back button - learn more only */}
            {learnMoreOpen && (
              <button
                type="button"
                className={panelStyles.backBtn}
                onClick={() => { setMessages([]); setLearnMoreOpen(false) }}
                aria-label="Back"
              >
                <Icon name="ArrowBack" size="sm" color="action" />
                Back
              </button>
            )}

            {/* Scroll area */}
            <div className={panelStyles.chatScroll}>
              {/* Live call alerts from Suki - only shown after the call ends */}
              {liveAlerts.length > 0 && !isHome && !sukiOpen && !callInsightsOpen && (() => {
                // All tasks added across every alert (keyed by alertId:idx)
                const allAddedEntries = liveAlerts.flatMap(a => {
                  const labels = alertTaskLabels[a.id] ?? a.tasks
                  return labels
                    .map((label, idx) => ({ alertId: a.id, task: label, taskKey: `${a.id}:${idx}` }))
                    .filter(({ taskKey }) => addedAlertTasks.has(taskKey))
                })
                const hasAdded = allAddedEntries.length > 0

                if (alertTaskView === 'unified') {
                  return (
                    <div className={panelStyles.insightsWrap}>
                      <div className={panelStyles.liveAlertStack}>
                        <div className={panelStyles.liveAlertTaskListCard}>
                          <div className={panelStyles.liveAlertTaskListHeader}>
                            <button type="button" className={panelStyles.liveAlertBackBtn} onClick={() => setAlertTaskView(null)}>
                              <Icon name="ArrowBack" size="xs" color="action" />
                            </button>
                            <Icon name="TaskAlt" size="sm" color="primary" />
                            <span className={panelStyles.liveAlertTaskListTitle}>Task List</span>
                          </div>
                          <div className={panelStyles.liveAlertTasks}>
                            {allAddedEntries.map(({ alertId, task, taskKey }) => {
                              const isDone = doneAlertTasks.has(taskKey)
                              return (
                                <div key={taskKey} className={`${panelStyles.liveAlertTask} ${isDone ? panelStyles.liveAlertTaskDone : ''}`}>
                                  <span className={panelStyles.liveAlertTaskIcon}>
                                    <Icon name={isDone ? 'CheckCircle' : 'RadioButtonUnchecked'} size="md" color={isDone ? 'success' : 'action'} />
                                  </span>
                                  <button
                                    type="button"
                                    className={`${panelStyles.liveAlertTaskLink}${isDone ? ` ${panelStyles.liveAlertTaskLinkDone}` : ''}`}
                                    onClick={() => setOpenAlertModal({ alertId, taskIdx: parseInt(taskKey.split(':')[1]), task })}
                                  >
                                    {task}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className={panelStyles.insightsWrap}>
                    <div className={panelStyles.liveAlertStack}>
                    {liveAlerts.map(alert => {
                      const labels = alertTaskLabels[alert.id] ?? alert.tasks
                      return (
                        <Alert
                          key={alert.id}
                          severity="warning"
                          title={alert.label}
                          onClose={() => {
                            setLiveAlerts(prev => prev.filter(a => a.id !== alert.id))
                            if (expandedAlertId === alert.id) setExpandedAlertId(null)
                          }}
                          action={
                            expandedAlertId === alert.id ? (
                              <div className={panelStyles.liveAlertExpanded}>
                                <p className={panelStyles.liveAlertDetail}>{alert.detail}</p>
                                <div className={panelStyles.liveAlertTasks}>
                                  {labels.map((label, idx) => {
                                    const taskKey = `${alert.id}:${idx}`
                                    const added = addedAlertTasks.has(taskKey)
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        className={`${panelStyles.liveAlertTask}${added ? ` ${panelStyles.liveAlertTaskAdded}` : ''}`}
                                        onClick={() => setAddedAlertTasks(prev => {
                                          const next = new Set(prev)
                                          added ? next.delete(taskKey) : next.add(taskKey)
                                          return next
                                        })}
                                      >
                                        <input
                                          className={panelStyles.liveAlertTaskInput}
                                          type="text"
                                          value={label}
                                          placeholder="Describe the task…"
                                          aria-label={`Task ${idx + 1}`}
                                          onClick={e => e.stopPropagation()}
                                          onChange={e => {
                                            e.stopPropagation()
                                            setAlertTaskLabels(prev => {
                                              const updated = [...(prev[alert.id] ?? alert.tasks)]
                                              updated[idx] = e.target.value
                                              return { ...prev, [alert.id]: updated }
                                            })
                                          }}
                                        />
                                        <span
                                          className={`${panelStyles.liveAlertTaskAddBtn}${added ? ` ${panelStyles.liveAlertTaskAddBtnAdded}` : ''}`}
                                          aria-hidden="true"
                                        >
                                          {added ? '✓' : '+'}
                                        </span>
                                      </button>
                                    )
                                  })}
                                  <button
                                    type="button"
                                    className={panelStyles.liveAlertAddTaskBtn}
                                    onClick={() => setAlertTaskLabels(prev => ({
                                      ...prev,
                                      [alert.id]: [...(prev[alert.id] ?? alert.tasks), ''],
                                    }))}
                                  >
                                    <Icon name="AddCircleOutline" size="sm" color="primary" />
                                    Add your own task
                                  </button>
                                </div>
                                <button type="button" className={panelStyles.liveAlertCollapseBtn} onClick={() => setExpandedAlertId(null)}>Hide actions</button>
                              </div>
                            ) : (
                              <button type="button" className={panelStyles.liveAlertReviewBtn} onClick={() => setExpandedAlertId(alert.id)}>
                                Review actions
                              </button>
                            )
                          }
                        />
                      )
                    })}
                    {hasAdded && (
                      <button type="button" className={panelStyles.liveAlertFinishBtn} onClick={() => setAlertTaskView('unified')}>
                        <Icon name="TaskAlt" size="sm" color="inherit" />
                        View Task List ({allAddedEntries.length})
                      </button>
                    )}
                    </div>
                  </div>
                )
              })()}
              {openAlertModal && (() => {
                const taskKey = `${openAlertModal.alertId}:${openAlertModal.taskIdx}`
                const activityConfig: ActivityConfig = {
                  title: 'Add Activity',
                  activityType: 'Follow-up',
                  contactType: 'Member - Phone',
                  scheduledDate: '',
                }
                return (
                  <AddActivityModal
                    config={activityConfig}
                    memberName={memberName}
                    onClose={() => setOpenAlertModal(null)}
                    onAdd={() => {
                      setDoneAlertTasks(prev => new Set(prev).add(taskKey))
                      handleActivityAdded(activityConfig, 'activities')
                      setOpenAlertModal(null)
                    }}
                  />
                )
              })()}
              {callInsightsOpen && !isHome && (
                <div className={panelStyles.insightsWrap}>
                  <CallInsightsCard
                    memberFirstName={memberName.split(' ')[0]}
                    memberName={memberName}
                    alerts={liveAlerts}
                    onDismiss={() => { setCallInsightsOpen(false); setLiveAlerts([]) }}
                    medicationData={medicationBriefData}
                  />
                </div>
              )}
              {sukiActionsReady && !isHome && (
                <RecommendedActionsCard
                  memberName={memberName}
                  onDismiss={() => setSukiActionsReady(false)}
                  onActivityAdded={handleActivityAdded}
                  onNavigate={(dest) => {
                    postToIframe({ type: dest === 'activities' ? 'HAVEN_NAVIGATE_OUTSTANDING' : 'HAVEN_NAVIGATE_CARE_PLAN' })
                  }}
                />
              )}
              {!isHome && mockMemberId === 'AH36582091' && !sukiActionsReady && liveAlerts.length === 0 && !callInsightsOpen && (
                <div className={panelStyles.welcomeWrap}>
                  <MarcusNewMemberWelcome onPrompt={sendMessage} />
                </div>
              )}
              {hasMessages ? (
                <ChatMessages
                  messages={messages}
                  loading={loading}
                  memberName={memberName}
                  memberDob={dob}
                  memberDisplayId={displayMemberId ?? memberId}
                  onGoalAdded={(payload) => {
                    postToIframe({ type: 'HAVEN_ADD_SMART_GOAL', ...payload })
                  }}
                  onFollowUpChip={(query) => sendMessage(query)}
                  onNavigateNote={() => postToIframe({ type: 'HAVEN_NAVIGATE_NOTES' })}
                  onNavigateActivity={() => postToIframe({ type: 'HAVEN_NAVIGATE_OUTSTANDING' })}
                  onRequestMedCard={() => {
                    const cardData = getMedCardData(mockMemberId)
                    if (!cardData) return
                    const firstName = memberName.split(' ')[0]
                    setMessages(prev => [...prev, {
                      id: `med-from-alert-${Date.now()}`,
                      role: 'assistant' as const,
                      content: `Here's ${firstName}'s current medication list. You can update it directly.`,
                      medicationCard: cardData,
                    }])
                  }}
                />
              ) : (
                !sukiActionsReady && liveAlerts.length === 0 && !callInsightsOpen && (isHome || mockMemberId !== 'AH36582091') && (
                  <div className={panelStyles.welcomeWrap}>
                    {isHome
                      ? <HomeWelcome onPrompt={sendMessage} onPresetsClick={() => setPresetsOpen(true)} day={day} />
                      : mockMemberId === 'AH72940158'
                        ? <MariaTodaysTasks onPrompt={sendMessage} />
                        : <ChatWelcome onPrompt={sendMessage} onMore={() => setMoreMenuOpen(true)} />
                    }
                  </div>
                )
              )}
            </div>

            {/* Menu overlays — absolutely positioned inside chatArea, scroll within bounds */}
            {!isHome && menuOpen && !hasMessages && (
              <div className={panelStyles.menuOverlay}>
                <button type="button" className={panelStyles.menuFloatingClose} onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <Icon name="Close" size="xs" color="action" aria-hidden />
                  Close
                </button>
                <div className={panelStyles.menuScrollArea}>
                  <div className={panelStyles.menuCard}>
                    <MemberDetailMenu onClose={() => setMenuOpen(false)} onSelect={sendMessage} memberId={memberId} />
                  </div>
                </div>
              </div>
            )}
            {!isHome && summarizeMenuOpen && !hasMessages && (
              <div className={panelStyles.menuOverlay}>
                <button type="button" className={panelStyles.menuFloatingClose} onClick={() => setSummarizeMenuOpen(false)} aria-label="Close menu">
                  <Icon name="Close" size="xs" color="action" aria-hidden />
                  Close
                </button>
                <div className={panelStyles.menuScrollArea}>
                  <div className={panelStyles.menuCard}>
                    <SummarizeMenu onClose={() => setSummarizeMenuOpen(false)} onSelect={sendMessage} />
                  </div>
                </div>
              </div>
            )}
            {!isHome && moreMenuOpen && !hasMessages && (
              <div className={panelStyles.menuOverlay}>
                <button type="button" className={panelStyles.menuFloatingClose} onClick={() => setMoreMenuOpen(false)} aria-label="Close menu">
                  <Icon name="Close" size="xs" color="action" aria-hidden />
                  Close
                </button>
                <div className={panelStyles.menuScrollArea}>
                  <div className={panelStyles.menuCard}>
                    <MemberDetailMenu onClose={() => setMoreMenuOpen(false)} onSelect={sendMessage} memberId={memberId} />
                  </div>
                  <div className={panelStyles.menuCard}>
                    <SummarizeMenu onClose={() => setMoreMenuOpen(false)} onSelect={sendMessage} />
                  </div>
                </div>
              </div>
            )}
            {!isHome && complianceMenuOpen && !hasMessages && (
              <div className={panelStyles.menuOverlay}>
                <button type="button" className={panelStyles.menuFloatingClose} onClick={() => setComplianceMenuOpen(false)} aria-label="Close menu">
                  <Icon name="Close" size="xs" color="action" aria-hidden />
                  Close
                </button>
                <div className={panelStyles.menuScrollArea}>
                  <div className={panelStyles.menuCard}>
                    <ComplianceMenu onClose={() => setComplianceMenuOpen(false)} onSelect={sendMessage} memberId={memberId} />
                  </div>
                </div>
              </div>
            )}
            {!isHome && documentMenuOpen && !hasMessages && (
              <div className={panelStyles.menuOverlay}>
                <button type="button" className={panelStyles.menuFloatingClose} onClick={() => setDocumentMenuOpen(false)} aria-label="Close menu">
                  <Icon name="Close" size="xs" color="action" aria-hidden />
                  Close
                </button>
                <div className={panelStyles.menuScrollArea}>
                  <div className={panelStyles.menuCard}>
                    <DocumentMenu onClose={() => setDocumentMenuOpen(false)} onSelect={sendMessage} />
                  </div>
                </div>
              </div>
            )}

            {/* Input + disclaimer */}
            <div className={panelStyles.bottom}>
              <AskHavenInput onSubmit={sendMessage} />
              <p className={panelStyles.disclaimer}>
                Once closed, a chat can't be continued.{' '}
                Check your responses for accuracy.{' '}
                <button type="button" className={panelStyles.disclaimerLink} onClick={handleLearnMore}>
                  What this assistant has access to
                </button>
              </p>
            </div>
          </div>

          {/* Preset prompts panel */}
          {presetsOpen && (
            <PresetPromptsPanel
              onClose={() => setPresetsOpen(false)}
              onSelectPrompt={(text) => { sendMessage(text); setPresetsOpen(false) }}
              memberName={memberName}
              memberId={memberId}
            />
          )}

          {/* Chat history drawer - covers entire body including member header */}
          {historyOpen && (
            <ChatHistoryDrawer
              sessions={historySessions}
              onClose={() => setHistoryOpen(false)}
              onSelectSession={(msgs) => { setMessages(msgs); setLearnMoreOpen(false) }}
              onNewConversation={() => {
                saveSession(memberId, memberName, messages)
                setMessages([])
                setLearnMoreOpen(false)
              }}
              onDelete={(id) => { deleteSession(id); refreshHistory() }}
              onToggleFavorite={(id) => { toggleFavorite(id); refreshHistory() }}
              onClearHistory={() => { clearAllForMember(memberId); refreshHistory() }}
              onLearnMore={handleLearnMore}
            />
          )}
        </div>
      )}
    </div>
    </>
  )
}
