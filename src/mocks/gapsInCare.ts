/**
 * Mock data for Gaps In Care
 * Loaded via batch interface (not a direct API call) - source: CarePlans → Guiding Opportunities → Source DD = External quality measures
 * Member: Henry Tom Garcia (AH58319473)
 */

export interface GapInCare {
  opportunity: string
  opportunityDescription: string
  goal: string
  opportunityStatus: string
  measureCode: string
  measureCategory: string
  ncqaGrouping: string
  measureDescription: string
  identifiedDate: string
  updatedOn: string
  updatedBy: string
}

export const mockGapsInCare: GapInCare[] = [
  {
    opportunity: 'Annual Wellness Visit',
    opportunityDescription: 'Member has not completed an Annual Wellness Visit this year',
    goal: 'Member will complete an Annual Wellness Visit by end of measurement year',
    opportunityStatus: 'Open',
    measureCode: 'AWV',
    measureCategory: 'Preventive Care',
    ncqaGrouping: 'Preventive Screening',
    measureDescription: 'Member has not completed an Annual Wellness Visit in the current measurement year. Last completed March 2025.',
    identifiedDate: '2026-01-01',
    updatedOn: '2026-01-01',
    updatedBy: 'batch.interface',
  },
  {
    opportunity: 'Diabetic Eye Exam (Retinal Screening)',
    opportunityDescription: 'Member has not had a retinal eye exam - required annually for Type 2 Diabetes',
    goal: 'Member will schedule and complete a retinal screening with an ophthalmologist',
    opportunityStatus: 'Open',
    measureCode: 'EED',
    measureCategory: 'Diabetes Management',
    ncqaGrouping: 'HEDIS - Diabetes',
    measureDescription: 'No retinal or dilated eye exam on record. Required annually for members with Type 2 Diabetes.',
    identifiedDate: '2026-01-01',
    updatedOn: '2026-01-01',
    updatedBy: 'batch.interface',
  },
  {
    opportunity: 'Depression Screening (PHQ-9)',
    opportunityDescription: 'Member is overdue for annual depression screening (PHQ-9)',
    goal: 'Member will complete a PHQ-9 depression screening at next care contact',
    opportunityStatus: 'Open',
    measureCode: 'DSF',
    measureCategory: 'Behavioral Health',
    ncqaGrouping: 'HEDIS - Behavioral Health',
    measureDescription: 'PHQ-9 last completed November 2024. Annual re-screening is due.',
    identifiedDate: '2026-01-01',
    updatedOn: '2026-01-01',
    updatedBy: 'batch.interface',
  },
  {
    opportunity: 'HbA1c Testing',
    opportunityDescription: 'Member requires HbA1c monitoring for diabetes management',
    goal: 'Member will have HbA1c tested at least twice in the measurement year',
    opportunityStatus: 'Closed',
    measureCode: 'HBA1C',
    measureCategory: 'Diabetes Management',
    ncqaGrouping: 'HEDIS - Diabetes',
    measureDescription: 'HbA1c tested 02/01/2026. Result: 7.8% - above goal but measure fulfilled for current period.',
    identifiedDate: '2026-01-01',
    updatedOn: '2026-02-01',
    updatedBy: 'prudhvi.rajan',
  },
  {
    opportunity: 'Kidney Health Evaluation',
    opportunityDescription: 'Member has not completed annual kidney health evaluation (uACR)',
    goal: 'Member will complete a urine albumin-to-creatinine ratio (uACR) test this year',
    opportunityStatus: 'Open',
    measureCode: 'KED',
    measureCategory: 'Diabetes Management',
    ncqaGrouping: 'HEDIS - Diabetes',
    measureDescription: 'Annual urine albumin-to-creatinine ratio (uACR) test not yet completed for current measurement year.',
    identifiedDate: '2026-01-01',
    updatedOn: '2026-01-01',
    updatedBy: 'batch.interface',
  },
  {
    opportunity: 'Statin Therapy for Cardiovascular Disease',
    opportunityDescription: 'Member should be on statin therapy for cardiovascular risk reduction',
    goal: 'Member will be prescribed and adherent to statin therapy to reduce cardiovascular risk',
    opportunityStatus: 'Closed',
    measureCode: 'SPC',
    measureCategory: 'Cardiovascular',
    ncqaGrouping: 'HEDIS - Cardiovascular',
    measureDescription: 'Member is currently prescribed Atorvastatin 20mg. Measure fulfilled.',
    identifiedDate: '2025-01-01',
    updatedOn: '2026-02-14',
    updatedBy: 'prudhvi.rajan',
  },
]
