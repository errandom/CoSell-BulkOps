import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Warning } from '@phosphor-icons/react'

interface ExportDialogProps {
  open: boolean
  totalIncluded: number
  totalExcluded: number
  onConfirm: () => void
  onClose: () => void
}

export function ExportDialog({
  open,
  totalIncluded,
  totalExcluded,
  onConfirm,
  onClose
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Validated Records</DialogTitle>
          <DialogDescription>
            Only error-free records will be included in the export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-success/10 border-success">
            <CheckCircle className="h-5 w-5 text-success" weight="fill" />
            <AlertDescription>
              <strong>{totalIncluded}</strong> record{totalIncluded !== 1 ? 's' : ''} will be
              exported (passed validation or have warnings only)
            </AlertDescription>
          </Alert>

          {totalExcluded > 0 && (
            <Alert className="bg-destructive/10 border-destructive">
              <Warning className="h-5 w-5 text-destructive" weight="fill" />
              <AlertDescription>
                <strong>{totalExcluded}</strong> record{totalExcluded !== 1 ? 's' : ''} will be
                excluded (contains errors)
              </AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            The exported file will maintain the original template structure and can be uploaded
            directly to Microsoft Partner Center.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={totalIncluded === 0}>
            Export File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
