export type ValidationSeverity = 'error' | 'warning' | 'passed'

export interface ValidationIssue {
  field: string
  message: string
  severity: 'error' | 'warning'
  suggestedFix?: string | string[]
}

export interface CoSellRecord {
  rowNumber: number
  data: Record<string, any>
  status: ValidationSeverity
  issues: ValidationIssue[]
  isExisting: boolean
}

export interface Pattern {
  id: string
  type: 'error' | 'warning'
  title: string
  description: string
  affectedRows: number[]
  suggestedFix?: string
  autoFixable: boolean
}

export interface ValidationResult {
  records: CoSellRecord[]
  patterns: Pattern[]
  totalRecords: number
  errorCount: number
  warningCount: number
  passedCount: number
  existingCount: number
  newCount: number
}

export type FilterType = 'all' | 'errors' | 'warnings' | 'passed' | 'existing' | 'new'

export const MANDATORY_FIELDS = [
  'Deal Name',
  'Partner Referral Status',
  'Partner Referral Substatus',
  'Estimated Deal Value',
  'Currency',
  'Estimated Close Date',
  'Customer Name',
  'Customer Address Line 1',
  'Customer City',
  'Customer Country',
  'Microsoft help required?',
  'Consent to share Customer/Partner contact',
  'Marketplace Purchase Intent',
  'Solution 1',
  'Team member 1'
]

export const ALLOWED_VALUES: Record<string, string[]> = {
  'Marketplace Purchase Intent': ['Yes', 'No', 'Have not decided'],
  'Microsoft help required?': ['Yes', 'No'],
  'Consent to share Customer/Partner contact': ['Yes', 'No'],
  'Share with Microsoft sales team': ['Yes', 'No']
}

export const CONDITIONAL_MANDATORY_FIELDS: Record<string, { condition: string, conditionValue: any, fields: string[] }> = {
  'microsoft_help': {
    condition: 'Microsoft help required?',
    conditionValue: 'Yes',
    fields: [
      'Customer Contact First Name',
      'Customer Contact Last Name',
      'Customer Contact Phone number',
      'Customer Contact Email Address',
      'What specific help from Microsoft ?'
    ]
  },
  'declined_lost_error': {
    condition: 'Partner Referral Substatus',
    conditionValue: ['Declined', 'Lost', 'Error'],
    fields: ['Decline/Lost/Error reason']
  }
}

export const READONLY_FIELDS = [
  'Errors',
  'Microsoft MSX Id',
  'Migrated PSC Deal Id',
  'Microsoft Referral Substatus',
  'Created Date',
  'Final Matched Customer Account *',
  'Matched Category',
  'Confidence',
  'Managed Account Match 1',
  'Managed Account Match 2',
  'UnManaged Account Match 1',
  'UnManaged Account Match 2',
  'Moodys Account Match 1',
  'Moodys Account Match 2'
]
