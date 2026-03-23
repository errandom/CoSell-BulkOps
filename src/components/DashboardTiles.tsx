import { Card } from '@/components/ui/card'
import { Funnel } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { FilterType } from '@/types/coSell'

interface DashboardTilesProps {
  totalRecords: number
  errorCount: number
  warningCount: number
  passedCount: number
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const tiles = [
  { filter: 'all' as FilterType, label: 'Total Records', colorClass: 'border-l-primary' },
  { filter: 'errors' as FilterType, label: 'Errors', colorClass: 'border-l-destructive' },
  { filter: 'warnings' as FilterType, label: 'Warnings', colorClass: 'border-l-warning' },
  { filter: 'passed' as FilterType, label: 'Passed', colorClass: 'border-l-success' }
]

export function DashboardTiles({
  totalRecords,
  errorCount,
  warningCount,
  passedCount,
  activeFilter,
  onFilterChange
}: DashboardTilesProps) {
  const counts = {
    all: totalRecords,
    errors: errorCount,
    warnings: warningCount,
    passed: passedCount
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {isActive && <Funnel size={18} className="text-primary" weight="fill" />}
              </div>
              <p className="text-3xl font-semibold font-mono">{count}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
