import { useState, useCallback } from 'react'
import { UploadSimple, FileXls } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isProcessing: boolean
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const isValidFileType = useCallback((filename: string) => {
    const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb', '.csv']
    return validExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file && isValidFileType(file.name)) {
        onFileSelect(file)
      }
    },
    [onFileSelect, isValidFileType]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  return (
    <Card
      className={cn(
        'relative border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50',
        isDragOver && 'border-primary bg-primary/5 scale-[1.02]',
        isProcessing && 'opacity-50 pointer-events-none'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
        <input
          type="file"
          accept=".xlsx,.xls,.xlsm,.xlsb,.csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <FileXls size={64} className="text-primary animate-pulse" weight="duotone" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Processing file...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Validating records and detecting patterns
                </p>
              </div>
            </>
          ) : (
            <>
              <UploadSimple size={64} className="text-muted-foreground" weight="duotone" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports Excel (.xlsx, .xls, .xlsm, .xlsb) and CSV files (max 1,000 rows)
                </p>
              </div>
            </>
          )}
        </div>
      </label>
    </Card>
  )
}
