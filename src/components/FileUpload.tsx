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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
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
          accept=".xlsx,.xls"
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
                  Drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports .xlsx and .xls files (max 1,000 rows)
                </p>
              </div>
            </>
          )}
        </div>
      </label>
    </Card>
  )
}
