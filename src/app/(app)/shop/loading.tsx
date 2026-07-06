import { Grid } from '@/modules/products/components/grid/grid.component'

export default function Loading() {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(12)
        .fill(0)
        .map((_, index) => (
          <div className="animate-pulse" key={index}>
            <div className="aspect-square rounded-2xl border bg-base-200" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-4 w-1/2 rounded bg-base-200" />
              <div className="h-4 w-16 rounded bg-base-200" />
            </div>
          </div>
        ))}
    </Grid>
  )
}
