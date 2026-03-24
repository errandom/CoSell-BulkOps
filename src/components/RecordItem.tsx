import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, WarningCircle, XCircle, PencilSimple, CaretDown, CaretUp, ArrowsClockwise, Plus } from '@phosphor-icons/react'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/excel'
import { cn } from '@/lib/utils'
import type { CoSellRecord, ValidationIssue } from '@/types/coSell'

interface RecordItemProps {
  record: CoSellRecord
  onEdit: (record: CoSellRecord, issue: ValidationIssue) => void
}

export function RecordItem({ record, onEdit }: RecordItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const StatusIcon = {
    error: XCircle,
    warning: WarningCircle,
    passed: CheckCircle
  }[record.status]

  const statusColor = {
    error: 'text-destructive',
    warning: 'text-warning',
    passed: 'text-success'
  }[record.status]

  const statusBgColor = {
    error: 'bg-destructive',
    warning: 'bg-warning',
    passed: 'bg-success'
  }[record.status]

  const errors = record.issues.filter(i => i.severity === 'error')
  const warnings = record.issues.filter(i => i.severity === 'warning')

  const dealValue = record.data['Estimated Deal Value']
  const currency = record.data['Currency'] || 'USD'
  const formattedValue = dealValue ? formatCurrency(Number(dealValue), currency) : 'N/A'

  return (
    <Card className={cn(
      'transition-all duration-200',
      isExpanded && 'ring-1 ring-ring'
    )}>
      <div
        className="p-4 cursor-pointer hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <StatusIcon size={24} weight="fill" className={statusColor} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">Row {record.rowNumber}</span>
                  <Badge variant="outline" className={cn('text-xs', statusBgColor, 'text-white border-0')}>
                    {record.status}
                  </Badge>
                  {record.isExisting ? (
                    <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground border-0 gap-1">
                      <ArrowsClockwise size={12} weight="bold" />
                      Existing
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-accent text-accent-foreground border-0 gap-1">
                      <Plus size={12} weight="bold" />
                      New
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-base truncate">
                  {record.data['Deal Name'] || 'Untitled Deal'}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {record.data['Customer Name'] || 'No customer'}
                </p>
              </div>
              
              <div className="hidden md:flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Deal Value</p>
                  <p className="font-semibold font-mono">{formattedValue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Close Date</p>
                  <p className="font-semibold">{formatDate(record.data['Estimated Close Date'])}</p>
                </div>
              </div>
            </div>

            {!isExpanded && record.issues.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {errors.length > 0 && `${errors.length} error${errors.length !== 1 ? 's' : ''}`}
                  {errors.length > 0 && warnings.length > 0 && ', '}
                  {warnings.length > 0 && `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isExpanded ? <CaretUp size={20} className="text-muted-foreground" /> : <CaretDown size={20} className="text-muted-foreground" />}
          </div>
        </div>
      </div>

      {isExpanded && record.issues.length > 0 && (
        <>
          <Separator />
          <div className="p-4 space-y-3 bg-muted/20">
            {errors.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-destructive mb-2">Errors</h5>
                <div className="space-y-2">
                  {errors.map((issue, idx) => (
                    <IssueItem key={idx} issue={issue} record={record} onEdit={onEdit} />
                  ))}
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-warning mb-2">Warnings</h5>
                <div className="space-y-2">
                  {warnings.map((issue, idx) => (
                    <IssueItem key={idx} issue={issue} record={record} onEdit={onEdit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  )
}

interface IssueItemProps {
  issue: ValidationIssue
  record: CoSellRecord
  onEdit: (record: CoSellRecord, issue: ValidationIssue) => void
}

function IssueItem({ issue, record, onEdit }: IssueItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-card rounded-md border">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{issue.field}</p>
        <p className="text-sm">{issue.message}</p>
        {issue.suggestedFix && (
          <p className="text-xs text-muted-foreground mt-1">
            Suggested: {Array.isArray(issue.suggestedFix) ? issue.suggestedFix.join(', ') : issue.suggestedFix}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(record, issue)
        }}
      >
        <PencilSimple size={16} className="mr-1" />
        Edit
      </Button>
    </div>
  )
}
