import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TrendUp } from '@phosphor-icons/react'
import type { Pattern } from '@/types/coSell'

interface PatternAlertProps {
  pattern: Pattern
  onApplyFix: (pattern: Pattern) => void
}

export function PatternAlert({ pattern, onApplyFix }: PatternAlertProps) {
  const bgColor = pattern.type === 'error' ? 'bg-destructive/10' : 'bg-warning/10'
  const borderColor = pattern.type === 'error' ? 'border-destructive' : 'border-warning'

  return (
    <Alert className={`${bgColor} ${borderColor} border-l-4`}>
      <TrendUp className="h-5 w-5" weight="bold" />
      <AlertTitle className="font-semibold text-base">Pattern Detected</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          <span className="font-semibold">{pattern.title}:</span> {pattern.description}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Affected rows: {pattern.affectedRows.slice(0, 10).join(', ')}
          {pattern.affectedRows.length > 10 && ` and ${pattern.affectedRows.length - 10} more`}
        </p>
        {pattern.autoFixable && pattern.suggestedFix && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApplyFix(pattern)}
            className="mt-2"
          >
            {pattern.suggestedFix}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
