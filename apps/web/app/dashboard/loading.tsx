import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 pb-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        {/* Goals Card Skeleton (2x2) */}
        <div className="md:col-span-2 md:row-span-2 h-full">
           <Skeleton className="h-full w-full rounded-xl" />
        </div>

        {/* Workout Quick Start Skeleton (2x1) */}
        <div className="md:col-span-2 lg:col-span-1 md:row-span-1 h-full min-h-[180px]">
           <Skeleton className="h-full w-full rounded-xl" />
        </div>

        {/* Weight Chart Skeleton (1x1) */}
        <div className="md:col-span-2 lg:col-span-1 md:row-span-1 h-full min-h-[180px]">
           <Skeleton className="h-full w-full rounded-xl" />
        </div>
        
        {/* Habits Skeleton */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 h-[140px]">
            <Skeleton className="h-full w-full rounded-xl" />
        </div>
        
         {/* Timeline Skeleton */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4 h-[300px]">
            <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
