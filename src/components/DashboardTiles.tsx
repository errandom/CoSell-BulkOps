import { Card } from '@/components/ui/card'
import { Funnel } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { FilterType } from '@/types/coSell'

interface DashboardTilesProps {
  totalRecords: number
  errorCount: number
  warningCount: number
  passedCount: number
  existingCount: number
  newCount: number
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const tiles = [
  { filter: 'all' as FilterType, label: 'Total Records', colorClass: 'border-l-primary' },
  { filter: 'errors' as FilterType, label: 'Errors', colorClass: 'border-l-destructive' },
  { filter: 'warnings' as FilterType, label: 'Warnings', colorClass: 'border-l-warning' },
  { filter: 'passed' as FilterType, label: 'Passed', colorClass: 'border-l-success' },
  { filter: 'existing' as FilterType, label: 'Existing', colorClass: 'border-l-secondary' },
  { filter: 'new' as FilterType, label: 'New', colorClass: 'border-l-accent' }
]

export function DashboardTiles({
  totalRecords,
  errorCount,
  warningCount,
  passedCount,
  existingCount,
  newCount,
  activeFilter,
  onFilterChange
}: DashboardTilesProps) {
  const counts: Record<FilterType, number> = {
    all: totalRecords,
    errors: errorCount,
    warnings: warningCount,
    passed: passedCount,
    existing: existingCount,
    new: newCount
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map(({ filter, label, colorClass }) => {
        const isActive = activeFilter === filter
        const count = counts[filter]

        return (
          <Card
            key={filter}
            className={cn(
              'relative cursor-pointer transition-all duration-200 border-l-4',
              colorClass,
              isActive && 'ring-2 ring-ring shadow-lg scale-[1.02]',
              !isActive && 'hover:shadow-md hover:scale-[1.01]'
            )}
            onClick={() => onFilterChange(filter)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                {isActive && <Funnel size={14} className="text-primary" weight="fill" />}
              </div>
              <p className="text-xl font-semibold font-mono">{count}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
