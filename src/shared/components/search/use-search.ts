import { createUrl } from '@/shared/utils/create-url.util'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FormEvent } from 'react'

export const useSearch = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams?.get('q') || ''

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const search = form.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (search.value) {
      newParams.set('q', search.value)
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/deals', newParams))
  }

  return { query, onSubmit }
}
