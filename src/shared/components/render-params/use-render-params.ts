import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const useRenderParams = (
  params: string[],
  onParams?: (paramValues: ((null | string | undefined) | string[])[]) => void,
) => {
  const searchParams = useSearchParams()
  const paramValues = params.map((param) => searchParams?.get(param))

  useEffect(() => {
    if (paramValues.length && onParams) {
      onParams(paramValues)
    }
  }, [paramValues, onParams])

  return { paramValues }
}
