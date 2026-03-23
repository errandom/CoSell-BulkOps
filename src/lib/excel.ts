import * as XLSX from 'xlsx'
import type { CoSellRecord } from '@/types/coSell'

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it matches the template format.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'))
    }

    reader.readAsBinaryString(file)
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
