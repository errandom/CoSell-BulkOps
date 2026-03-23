import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CoSellRecord, ValidationIssue } from '@/types/coSell'
import { ALLOWED_VALUES } from '@/types/coSell'

interface EditDialogProps {
  open: boolean
  record: CoSellRecord | null
  issue: ValidationIssue | null
  onSave: (record: CoSellRecord, field: string, value: string) => void
  onClose: () => void
}

export function EditDialog({ open, record, issue, onSave, onClose }: EditDialogProps) {
  const [value, setValue] = useState('')

  if (!record || !issue) return null

  const fieldValue = record.data[issue.field] || ''
  const currentValue = value || String(fieldValue)

  const handleSave = () => {
    onSave(record, issue.field, value || currentValue)
    setValue('')
    onClose()
  }

  const allowedValuesForField = ALLOWED_VALUES[issue.field]
  const isDropdown = allowedValuesForField || (issue.suggestedFix && Array.isArray(issue.suggestedFix))
  const dropdownOptions = allowedValuesForField || (Array.isArray(issue.suggestedFix) ? issue.suggestedFix : [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <DialogDescription>
            Update the value for <strong>{issue.field}</strong> in row {record.rowNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-value">Current Value</Label>
            <Input
              id="current-value"
              value={fieldValue}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-value">New Value</Label>
            {isDropdown ? (
              <Select value={value || currentValue} onValueChange={setValue}>
                <SelectTrigger id="new-value">
                  <SelectValue placeholder="Select a value" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="new-value"
                value={value || currentValue}
                onChange={(e) => setValue(e.target.value)}
                placeholder={issue.suggestedFix ? `e.g., ${issue.suggestedFix}` : 'Enter new value'}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">{issue.message}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
