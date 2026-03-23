import * as XLSX from 'xlsx'
import type { CoSellRecord } from '@/types/coSell'

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const fileExtension = file.name.toLowerCase().split('.').pop()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        
        let workbook: XLSX.WorkBook
        
        if (fileExtension === 'csv') {
          const csvData = new TextDecoder('utf-8').decode(data as ArrayBuffer)
          workbook = XLSX.read(csvData, { type: 'string', raw: true })
        } else {
          workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            dateNF: 'mm/dd/yyyy'
          })
        }
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        
        if (!firstSheet) {
          reject(new Error('No data found in file. Please ensure the file contains data.'))
          return
        }
        
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          raw: false,
          dateNF: 'mm/dd/yyyy',
          defval: ''
        })
        
        resolve(jsonData)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        reject(new Error(`Failed to parse file: ${errorMessage}. Please ensure it matches the template format.`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export function exportToExcel(records: CoSellRecord[], filename: string) {
  const data = records.map(record => record.data)
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Validated Records')
  XLSX.writeFile(workbook, filename)
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  return dateStr
}
