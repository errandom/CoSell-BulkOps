import { useState, useMemo, useCallback } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { DashboardTiles } from '@/components/DashboardTiles'
import { PatternAlert } from '@/components/PatternAlert'
import { RecordItem } from '@/components/RecordItem'
import { EditDialog } from '@/components/EditDialog'
import { ExportDialog } from '@/components/ExportDialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DownloadSimple, ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react'
import { parseExcelFile, exportToExcel } from '@/lib/excel'
import { validateFile, validateRecord, detectPatterns, applyBulkFix } from '@/lib/validation'
import { toast } from 'sonner'
import type { CoSellRecord, ValidationIssue, FilterType, Pattern, ValidationResult } from '@/types/coSell'

function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [editingRecord, setEditingRecord] = useState<CoSellRecord | null>(null)
  const [editingIssue, setEditingIssue] = useState<ValidationIssue | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [history, setHistory] = useState<ValidationResult[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = useCallback((result: ValidationResult) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(result)
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setValidationResult(history[newIndex])
      toast.success('Undid last change')
    }
  }, [canUndo, historyIndex, history])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setValidationResult(history[newIndex])
      toast.success('Redid change')
    }
  }, [canRedo, historyIndex, history])

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true)
    try {
      const data = await parseExcelFile(file)
      
      if (data.length === 0) {
        toast.error('File is empty. Please upload a file with at least one data row.')
        return
      }

      const result = validateFile(data)
      setValidationResult(result)
      setActiveFilter('all')
      setHistory([result])
      setHistoryIndex(0)
      toast.success(`Processed ${result.totalRecords} records successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyBulkFix = (pattern: Pattern) => {
    if (!validationResult) return

    const updatedRecords = applyBulkFix(validationResult.records, pattern)
    const updatedPatterns = detectPatterns(updatedRecords)

    const errorCount = updatedRecords.filter(r => r.status === 'error').length
    const warningCount = updatedRecords.filter(r => r.status === 'warning').length
    const passedCount = updatedRecords.filter(r => r.status === 'passed').length
    const existingCount = updatedRecords.filter(r => r.isExisting).length
    const newCount = updatedRecords.filter(r => !r.isExisting).length

    const newResult = {
      records: updatedRecords,
      patterns: updatedPatterns,
      totalRecords: updatedRecords.length,
      errorCount,
      warningCount,
      passedCount,
      existingCount,
      newCount
    }

    setValidationResult(newResult)
    saveToHistory(newResult)

    toast.success(`Fixed ${pattern.affectedRows.length} records`)
  }

  const handleEditField = (record: CoSellRecord, field: string, value: string) => {
    if (!validationResult) return

    const updatedData = { ...record.data, [field]: value }
    const updatedRecord = validateRecord(updatedData, record.rowNumber)

    const updatedRecords = validationResult.records.map(r =>
      r.rowNumber === record.rowNumber ? updatedRecord : r
    )

    const updatedPatterns = detectPatterns(updatedRecords)

    const errorCount = updatedRecords.filter(r => r.status === 'error').length
    const warningCount = updatedRecords.filter(r => r.status === 'warning').length
    const passedCount = updatedRecords.filter(r => r.status === 'passed').length
    const existingCount = updatedRecords.filter(r => r.isExisting).length
    const newCount = updatedRecords.filter(r => !r.isExisting).length

    const newResult = {
      records: updatedRecords,
      patterns: updatedPatterns,
      totalRecords: updatedRecords.length,
      errorCount,
      warningCount,
      passedCount,
      existingCount,
      newCount
    }

    setValidationResult(newResult)
    saveToHistory(newResult)

    toast.success('Record updated successfully')
  }

  const handleExport = () => {
    if (!validationResult) return

    const exportableRecords = validationResult.records.filter(
      r => r.status === 'passed' || r.status === 'warning'
    )

    if (exportableRecords.length === 0) {
      toast.error('No error-free records to export')
      return
    }

    const timestamp = new Date().toISOString().split('T')[0]
    exportToExcel(exportableRecords, `cosell-validated-${timestamp}.xlsx`)
    toast.success(`Exported ${exportableRecords.length} records`)
    setShowExportDialog(false)
  }

  const filteredRecords = useMemo(() => {
    if (!validationResult) return []

    switch (activeFilter) {
      case 'errors':
        return validationResult.records.filter(r => r.status === 'error')
      case 'warnings':
        return validationResult.records.filter(r => r.status === 'warning')
      case 'passed':
        return validationResult.records.filter(r => r.status === 'passed')
      case 'existing':
        return validationResult.records.filter(r => r.isExisting)
      case 'new':
        return validationResult.records.filter(r => !r.isExisting)
      default:
        return validationResult.records
    }
  }, [validationResult, activeFilter])

  const exportableCount = validationResult
    ? validationResult.records.filter(r => r.status !== 'error').length
    : 0

  const excludedCount = validationResult ? validationResult.errorCount : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Microsoft Co-Sell Bulk Operation Pre-Check
          </h1>
          <p className="text-muted-foreground">
            Validate your Excel files before uploading to Partner Center
          </p>
        </header>

        {!validationResult ? (
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        ) : (
          <div className="space-y-6">
            <DashboardTiles
              totalRecords={validationResult.totalRecords}
              errorCount={validationResult.errorCount}
              warningCount={validationResult.warningCount}
              passedCount={validationResult.passedCount}
              existingCount={validationResult.existingCount}
              newCount={validationResult.newCount}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {validationResult.patterns.length > 0 && (
              <div className="space-y-3">
                {validationResult.patterns.slice(0, 3).map(pattern => (
                  <PatternAlert
                    key={pattern.id}
                    pattern={pattern}
                    onApplyFix={handleApplyBulkFix}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <ArrowCounterClockwise size={16} weight="bold" className="mr-1.5" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <ArrowClockwise size={16} weight="bold" className="mr-1.5" />
                  Redo
                </Button>
              </div>
              <h2 className="text-xl font-semibold flex-1">
                Records {activeFilter !== 'all' && `(${activeFilter})`}
              </h2>
              <Button
                onClick={() => setShowExportDialog(true)}
                disabled={exportableCount === 0}
              >
                <DownloadSimple size={18} className="mr-2" weight="bold" />
                Export Validated Records
              </Button>
            </div>

            <Separator />

            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No records match the current filter
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {filteredRecords.map(record => (
                    <RecordItem
                      key={record.rowNumber}
                      record={record}
                      onEdit={(rec, issue) => {
                        setEditingRecord(rec)
                        setEditingIssue(issue)
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setValidationResult(null)
                  setActiveFilter('all')
                  setHistory([])
                  setHistoryIndex(-1)
                }}
              >
                Upload New File
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditDialog
        open={!!editingRecord && !!editingIssue}
        record={editingRecord}
        issue={editingIssue}
        onSave={handleEditField}
        onClose={() => {
          setEditingRecord(null)
          setEditingIssue(null)
        }}
      />

      <ExportDialog
        open={showExportDialog}
        totalIncluded={exportableCount}
        totalExcluded={excludedCount}
        onConfirm={handleExport}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  )
}

export default App
