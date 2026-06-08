import { Skeleton } from '@/components/ui/Skeleton'
import { CoastDateSelectors } from './CoastDateSelectors'

export function TodaySkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading forecast">
      <CoastDateSelectors stub />
      <Skeleton className="h-[220px] w-full rounded-[22px]" />
      <div className="grid gap-4 min-[980px]:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-[280px] w-full rounded-[20px]" />
          <Skeleton className="h-[160px] w-full rounded-[20px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[320px] w-full rounded-[20px]" />
          <Skeleton className="h-[120px] w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  )
}
