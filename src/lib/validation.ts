import type {
  CoSellRecord,
  ValidationIssue,
  Pattern,
  ValidationResult
} from '@/types/coSell'
import {
  MANDATORY_FIELDS,
  ALLOWED_VALUES,
  CONDITIONAL_MANDATORY_FIELDS
} from '@/types/coSell'

const DATE_FORMAT_REGEX = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/

function validateDateFormat(value: any): boolean {
  if (!value) return false
  const dateStr = String(value).trim()
  return DATE_FORMAT_REGEX.test(dateStr)
}

function validateCountryCode(value: any): boolean {
  if (!value) return false
  const code = String(value).trim()
  return code.length === 2 && /^[A-Z]{2}$/i.test(code)
}

function validateEmail(value: any): boolean {
  if (!value) return false
  const email = String(value).trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCurrency(value: any): boolean {
  if (!value) return false
  const currency = String(value).trim()
  return currency.length === 3 && /^[A-Z]{3}$/i.test(currency)
}

function validateNumeric(value: any): boolean {
  if (value === null || value === undefined || value === '') return false
  return !isNaN(Number(value))
}

export function validateRecord(data: Record<string, any>, rowNumber: number): CoSellRecord {
  const issues: ValidationIssue[] = []

  MANDATORY_FIELDS.forEach((field) => {
    const value = data[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      issues.push({
        field,
        message: `${field} is mandatory and cannot be empty`,
        severity: 'error'
      })
    }
  })

  const consentValue = data['Consent to share Customer/Partner contact']
  if (consentValue && String(consentValue).trim() !== '' && consentValue !== 'Yes') {
    issues.push({
      field: 'Consent to share Customer/Partner contact',
      message: 'Must be "Yes" - deals cannot be created or updated without consent',
      severity: 'error',
      suggestedFix: 'Yes'
    })
  }

  Object.entries(CONDITIONAL_MANDATORY_FIELDS).forEach(([, config]) => {
    const conditionValue = data[config.condition]
    const shouldValidate = Array.isArray(config.conditionValue)
      ? config.conditionValue.includes(conditionValue)
      : conditionValue === config.conditionValue

    if (shouldValidate) {
      config.fields.forEach((field) => {
        const value = data[field]
        if (value === undefined || value === null || String(value).trim() === '') {
          issues.push({
            field,
            message: `${field} is required when "${config.condition}" is "${conditionValue}"`,
            severity: 'error'
          })
        }
      })
    }
  })

  Object.entries(ALLOWED_VALUES).forEach(([field, allowedValues]) => {
    const value = data[field]
    if (value && !allowedValues.includes(String(value).trim())) {
      issues.push({
        field,
        message: `Invalid value "${value}". Must be one of: ${allowedValues.join(', ')}`,
        severity: 'error',
        suggestedFix: allowedValues
      })
    }
  })

  if (data['Estimated Close Date']) {
    if (!validateDateFormat(data['Estimated Close Date'])) {
      issues.push({
        field: 'Estimated Close Date',
        message: 'Date must be in MM/DD/YYYY format',
        severity: 'error'
      })
    }
  }

  if (data['Customer Country']) {
    if (!validateCountryCode(data['Customer Country'])) {
      issues.push({
        field: 'Customer Country',
        message: 'Must be a two-letter country code (e.g., US, CH, GB)',
        severity: 'error'
      })
    }
  }

  if (data['Currency']) {
    if (!validateCurrency(data['Currency'])) {
      issues.push({
        field: 'Currency',
        message: 'Must be a three-letter ISO currency code (e.g., USD, EUR, GBP)',
        severity: 'error'
      })
    }
  }

  if (data['Estimated Deal Value']) {
    if (!validateNumeric(data['Estimated Deal Value'])) {
      issues.push({
        field: 'Estimated Deal Value',
        message: 'Must be a numeric value',
        severity: 'error'
      })
    }
  }

  const contactEmail = data['Customer Contact Email Address']
  if (contactEmail && String(contactEmail).trim() !== '') {
    if (!validateEmail(contactEmail)) {
      issues.push({
        field: 'Customer Contact Email Address',
        message: 'Must be a valid email address',
        severity: 'error'
      })
    }
  }

  if (data['Microsoft help required?'] === 'No' && !data['Share with Microsoft sales team']) {
    issues.push({
      field: 'Share with Microsoft sales team',
      message: 'Must specify Yes or No when Microsoft help is not required',
      severity: 'warning'
    })
  }

  if (data['Estimated ACR Value'] && !validateNumeric(data['Estimated ACR Value'])) {
    issues.push({
      field: 'Estimated ACR Value',
      message: 'Must be a numeric value if provided',
      severity: 'warning'
    })
  }

  if (!data['Customer D-U-N-S id']) {
    issues.push({
      field: 'Customer D-U-N-S id',
      message: 'DUNS ID helps with faster account matching and seller assignment',
      severity: 'warning'
    })
  }

  const errorCount = issues.filter(i => i.severity === 'error').length
  const status = errorCount > 0 ? 'error' : issues.length > 0 ? 'warning' : 'passed'

  return {
    rowNumber,
    data,
    status,
    issues
  }
}

export function detectPatterns(records: CoSellRecord[]): Pattern[] {
  const patterns: Pattern[] = []
  const issueMap: Record<string, { rows: number[]; issue: ValidationIssue }> = {}

  records.forEach((record) => {
    record.issues.forEach((issue) => {
      const key = `${issue.field}:${issue.message}`
      if (!issueMap[key]) {
        issueMap[key] = { rows: [], issue }
      }
      issueMap[key].rows.push(record.rowNumber)
    })
  })

  Object.entries(issueMap).forEach(([key, data]) => {
    if (data.rows.length >= 3) {
      const isDatePattern = data.issue.field === 'Estimated Close Date' && 
        data.issue.message.includes('MM/DD/YYYY')
      
      const isConsentPattern = data.issue.field === 'Consent to share Customer/Partner contact'

      patterns.push({
        id: key,
        type: data.issue.severity,
        title: `${data.issue.field} issue in ${data.rows.length} records`,
        description: data.issue.message,
        affectedRows: data.rows,
        suggestedFix: isConsentPattern ? 'Set all to "Yes"' : isDatePattern ? 'Convert dates to MM/DD/YYYY format' : undefined,
        autoFixable: isConsentPattern || (isDatePattern && data.rows.length > 0)
      })
    }
  })

  return patterns.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'error' ? -1 : 1
    return b.affectedRows.length - a.affectedRows.length
  })
}

export function validateFile(data: any[]): ValidationResult {
  if (data.length > 1000) {
    throw new Error('File contains more than 1,000 rows. Please split the file and try again.')
  }

  const records = data.map((row, index) => validateRecord(row, index + 2))
  const patterns = detectPatterns(records)

  const errorCount = records.filter(r => r.status === 'error').length
  const warningCount = records.filter(r => r.status === 'warning').length
  const passedCount = records.filter(r => r.status === 'passed').length

  return {
    records,
    patterns,
    totalRecords: records.length,
    errorCount,
    warningCount,
    passedCount
  }
}

function attemptDateConversion(dateValue: any): string | null {
  if (!dateValue) return null
  
  const dateStr = String(dateValue).trim()
  
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  ]
  
  for (const format of formats) {
    const match = dateStr.match(format)
    if (match) {
      let month: number, day: number, year: number
      
      if (format === formats[0]) {
        year = parseInt(match[1])
        month = parseInt(match[2])
        day = parseInt(match[3])
      } else if (format === formats[1]) {
        month = parseInt(match[1])
        day = parseInt(match[2])
        year = 2000 + parseInt(match[3])
      } else {
        month = parseInt(match[1])
        day = parseInt(match[2])
        year = parseInt(match[3])
      }
      
      const paddedMonth = String(month).padStart(2, '0')
      const paddedDay = String(day).padStart(2, '0')
      
      return `${paddedMonth}/${paddedDay}/${year}`
    }
  }
  
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    }
  } catch {
    return null
  }
  
  return null
}

export function applyBulkFix(
  records: CoSellRecord[],
  pattern: Pattern
): CoSellRecord[] {
  const affectedRowSet = new Set(pattern.affectedRows)

  return records.map((record) => {
    if (!affectedRowSet.has(record.rowNumber)) return record

    const updatedData = { ...record.data }

    if (pattern.id.includes('Consent to share Customer/Partner contact')) {
      updatedData['Consent to share Customer/Partner contact'] = 'Yes'
    }

    if (pattern.id.includes('Estimated Close Date') && pattern.id.includes('MM/DD/YYYY')) {
      const convertedDate = attemptDateConversion(record.data['Estimated Close Date'])
      if (convertedDate) {
        updatedData['Estimated Close Date'] = convertedDate
      }
    }

    return validateRecord(updatedData, record.rowNumber)
  })
}
