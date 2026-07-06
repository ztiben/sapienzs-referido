import { LoadingSpinner } from '@/shared/components/loading-spinner/loading-spinner.component'

export default function Loading() {
  return (
    <div className="flex justify-center py-32">
      <LoadingSpinner />
    </div>
  )
}
